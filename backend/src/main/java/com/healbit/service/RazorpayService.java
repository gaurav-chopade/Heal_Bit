package com.healbit.service;

import com.healbit.exception.AppointmentConflictException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Minimal Razorpay integration over the REST API (no SDK dependency).
 * Creates orders, verifies the checkout signature, and issues refunds.
 */
@Service
public class RazorpayService {

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    private static final String BASE = "https://api.razorpay.com/v1";
    private static final Pattern ORDER_ID = Pattern.compile("\"id\"\\s*:\\s*\"(order_[^\"]+)\"");
    private static final Pattern REFUND_ID = Pattern.compile("\"id\"\\s*:\\s*\"(rfnd_[^\"]+)\"");

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(6))
            .build();

    public String getKeyId() {
        return keyId;
    }

    private String basicAuth() {
        String creds = keyId + ":" + keySecret;
        return "Basic " + Base64.getEncoder().encodeToString(creds.getBytes(StandardCharsets.UTF_8));
    }

    /** Creates a Razorpay order for the given amount (in paise) and returns its order id. */
    public String createOrder(long amountPaise, String receipt) {
        if (keyId.isBlank() || keySecret.isBlank()) {
            throw new AppointmentConflictException("Online payments are not configured yet");
        }
        String body = "{\"amount\":" + amountPaise + ",\"currency\":\"INR\",\"receipt\":\""
                + receipt + "\",\"payment_capture\":1}";
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE + "/orders"))
                    .timeout(Duration.ofSeconds(10))
                    .header("Authorization", basicAuth())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            HttpResponse<String> resp = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() / 100 != 2) {
                throw new AppointmentConflictException("Could not start the payment. Please try again.");
            }
            Matcher m = ORDER_ID.matcher(resp.body());
            if (m.find()) return m.group(1);
            throw new AppointmentConflictException("Unexpected response while starting the payment.");
        } catch (AppointmentConflictException ce) {
            throw ce;
        } catch (Exception e) {
            throw new AppointmentConflictException("Could not reach the payment gateway. Please try again.");
        }
    }

    /** Verifies the checkout signature: HMAC_SHA256(orderId + "|" + paymentId, keySecret). */
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : digest) hex.append(String.format("%02x", b));
            return hex.toString().equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    /** Issues a full refund for a payment and returns the refund id (or null if it couldn't be parsed). */
    public String refund(String paymentId) {
        if (keyId.isBlank() || keySecret.isBlank()) {
            throw new AppointmentConflictException("Refunds are not configured yet");
        }
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE + "/payments/" + paymentId + "/refund"))
                    .timeout(Duration.ofSeconds(10))
                    .header("Authorization", basicAuth())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString("{}"))
                    .build();
            HttpResponse<String> resp = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() / 100 != 2) {
                throw new AppointmentConflictException("The refund could not be processed. Please try again.");
            }
            Matcher m = REFUND_ID.matcher(resp.body());
            return m.find() ? m.group(1) : null;
        } catch (AppointmentConflictException ce) {
            throw ce;
        } catch (Exception e) {
            throw new AppointmentConflictException("Could not reach the payment gateway for the refund.");
        }
    }
}
