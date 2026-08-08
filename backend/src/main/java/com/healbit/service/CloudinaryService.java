package com.healbit.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

/**
 * Thin wrapper around Cloudinary.
 *
 * Patient documents are uploaded as "authenticated" (private) assets — their plain URL is
 * not publicly viewable, and this backend fetches them with a signed URL only after it has
 * checked who is asking. Hospital photos are ordinary public assets served from the CDN.
 */
@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    public static final String PRIVATE = "authenticated";
    public static final String PUBLIC = "upload";

    @Value("${cloudinary.enabled:true}")
    private boolean enabled;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${cloudinary.folder:healbit}")
    private String rootFolder;

    private Cloudinary cloudinary;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    @PostConstruct
    void init() {
        if (!enabled || !StringUtils.hasText(cloudName) || !StringUtils.hasText(apiKey) || !StringUtils.hasText(apiSecret)) {
            log.warn("[Heal-Bit] Cloudinary is not configured — uploads will fall back to local disk storage.");
            return;
        }
        cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
        log.info("[Heal-Bit] Cloudinary storage enabled (cloud: {})", cloudName);
    }

    public boolean isEnabled() {
        return cloudinary != null;
    }

    /** What we keep in the database after a successful upload. */
    public record Stored(String publicId, String url, String resourceType, String deliveryType,
                         String format, long bytes) {}

    /**
     * Uploads raw bytes.
     * `resourceType` should be "raw" for documents (PDF/Word/text) — raw assets are delivered
     * as opaque files and are not affected by Cloudinary's PDF-delivery restriction — and
     * "auto"/"image" for pictures.
     */
    public Stored upload(byte[] content, String folder, String filename, boolean privateAsset, String resourceType) {
        return doUpload(content, folder, filename, privateAsset, resourceType);
    }

    /** Uploads a base64 data URL, e.g. "data:image/png;base64,..." (used for hospital photos). */
    public Stored uploadDataUri(String dataUri, String folder, boolean privateAsset) {
        return doUpload(dataUri, folder, null, privateAsset, "auto");
    }

    private Stored doUpload(Object payload, String folder, String filename, boolean privateAsset, String resourceType) {
        requireEnabled();
        try {
            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", rootFolder + "/" + folder,
                    "resource_type", StringUtils.hasText(resourceType) ? resourceType : "auto",
                    "type", privateAsset ? PRIVATE : PUBLIC,
                    "unique_filename", true,
                    "overwrite", false);
            if (StringUtils.hasText(filename)) {
                // Keeps a readable hint in the public id; Cloudinary still makes it unique.
                options.put("public_id", sanitise(filename));
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(payload, options);

            return new Stored(
                    String.valueOf(result.get("public_id")),
                    String.valueOf(result.get("secure_url")),
                    String.valueOf(result.getOrDefault("resource_type", "image")),
                    String.valueOf(result.getOrDefault("type", privateAsset ? PRIVATE : PUBLIC)),
                    result.get("format") == null ? null : String.valueOf(result.get("format")),
                    result.get("bytes") == null ? 0L : Long.parseLong(String.valueOf(result.get("bytes"))));
        } catch (Exception e) {
            log.error("[Heal-Bit] Cloudinary upload failed", e);
            throw new IllegalStateException("Could not upload the file to cloud storage. Please try again.");
        }
    }

    /**
     * Fetches an asset's bytes. For private assets this signs the URL first, so the file is
     * never reachable by simply guessing its address.
     */
    public byte[] download(String publicId, String resourceType, String deliveryType, String format, String fallbackUrl) {
        requireEnabled();

        // Cloudinary is picky about whether the extension belongs in the delivery path, and it
        // differs between raw and image assets — so try the sensible variants in order.
        java.util.List<String> candidates = new java.util.ArrayList<>();
        candidates.add(signedUrl(publicId, resourceType, deliveryType, format));
        if (StringUtils.hasText(format)) {
            String withExt = publicId.endsWith("." + format) ? publicId : publicId + "." + format;
            candidates.add(signedUrl(withExt, resourceType, deliveryType, null));
        }
        candidates.add(signedUrl(publicId, resourceType, deliveryType, null));
        if (StringUtils.hasText(fallbackUrl)) {
            candidates.add(fallbackUrl);   // works for public assets / legacy rows
        }

        for (String url : candidates) {
            byte[] data = fetch(url);
            if (data != null) return data;
        }
        log.error("[Heal-Bit] Could not fetch Cloudinary asset {} (resourceType={}, type={}, format={}). "
                + "If this is a PDF stored as an image, enable PDF delivery in Cloudinary "
                + "Settings -> Security, or re-upload it so it is stored as a raw file.",
                publicId, resourceType, deliveryType, format);
        throw new IllegalStateException(
                "Could not read the file from cloud storage. If it is a PDF, check that PDF delivery "
                        + "is allowed in your Cloudinary security settings.");
    }

    public String signedUrl(String publicId, String resourceType, String deliveryType, String format) {
        requireEnabled();
        String id = publicId;
        // Non-raw assets need the extension appended for delivery.
        if (StringUtils.hasText(format) && !"raw".equalsIgnoreCase(resourceType) && !id.endsWith("." + format)) {
            id = id + "." + format;
        }
        return cloudinary.url()
                .resourceType(StringUtils.hasText(resourceType) ? resourceType : "image")
                .type(StringUtils.hasText(deliveryType) ? deliveryType : PRIVATE)
                .signed(true)
                .generate(id);
    }

    /** Removes an asset. Failures are logged, never fatal — the DB record still goes away. */
    public void delete(String publicId, String resourceType, String deliveryType) {
        if (!isEnabled() || !StringUtils.hasText(publicId)) return;
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                    "resource_type", StringUtils.hasText(resourceType) ? resourceType : "image",
                    "type", StringUtils.hasText(deliveryType) ? deliveryType : PUBLIC,
                    "invalidate", true));
        } catch (Exception e) {
            log.warn("[Heal-Bit] Could not delete Cloudinary asset {}: {}", publicId, e.getMessage());
        }
    }

    private byte[] fetch(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(20))
                    .GET()
                    .build();
            HttpResponse<byte[]> response = http.send(request, HttpResponse.BodyHandlers.ofByteArray());
            return response.statusCode() / 100 == 2 ? response.body() : null;
        } catch (Exception e) {
            log.warn("[Heal-Bit] Cloudinary fetch failed for {}: {}", url, e.getMessage());
            return null;
        }
    }

    private void requireEnabled() {
        if (!isEnabled()) {
            throw new IllegalStateException("Cloud storage is not configured.");
        }
    }

    /** Strips path/extension characters so the public id stays tidy. */
    private String sanitise(String filename) {
        String base = filename.contains(".") ? filename.substring(0, filename.lastIndexOf('.')) : filename;
        String cleaned = base.replaceAll("[^A-Za-z0-9-_]", "_");
        if (cleaned.length() > 60) cleaned = cleaned.substring(0, 60);
        return cleaned.isBlank() ? "file" : cleaned;
    }
}
