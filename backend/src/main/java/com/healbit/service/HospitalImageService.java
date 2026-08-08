package com.healbit.service;

import com.healbit.entity.Hospital;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Applies an incoming hospital photo value to a Hospital.
 *
 * The frontend sends either a base64 data URL (a newly picked file), the existing image
 * URL unchanged (when the form is simply re-saved), or an empty string (remove).
 */
@Service
public class HospitalImageService {

    private static final String FOLDER = "hospitals";

    private final CloudinaryService cloudinary;

    public HospitalImageService(CloudinaryService cloudinary) {
        this.cloudinary = cloudinary;
    }

    public void apply(Hospital hospital, String incoming) {
        if (incoming == null) return;                        // field omitted -> leave as-is

        String value = incoming.trim();

        // Remove the photo.
        if (value.isEmpty()) {
            deleteExisting(hospital);
            hospital.setImageUrl(null);
            hospital.setImagePublicId(null);
            hospital.setImageData(null);
            return;
        }

        // The client echoed back the URL we already gave it -> nothing changed.
        if (value.startsWith("http://") || value.startsWith("https://")) {
            return;
        }

        // Otherwise it must be a new file as a base64 data URL.
        String cleaned = ImageValidator.validateAndClean(value);
        if (cleaned == null) return;

        if (cloudinary.isEnabled()) {
            CloudinaryService.Stored stored = cloudinary.uploadDataUri(cleaned, FOLDER, false);
            deleteExisting(hospital);                        // drop the old asset after the new one is safely up
            hospital.setImageUrl(stored.url());
            hospital.setImagePublicId(stored.publicId());
            hospital.setImageData(null);                     // stop carrying base64 in MySQL
        } else {
            // No cloud configured — keep the old inline behaviour so nothing breaks.
            hospital.setImageData(cleaned);
        }
    }

    private void deleteExisting(Hospital hospital) {
        if (StringUtils.hasText(hospital.getImagePublicId())) {
            cloudinary.delete(hospital.getImagePublicId(), "image", CloudinaryService.PUBLIC);
        }
    }
}
