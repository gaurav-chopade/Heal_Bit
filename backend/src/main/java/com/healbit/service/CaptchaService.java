package com.healbit.service;

import com.healbit.exception.CaptchaException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Verifies Google reCAPTCHA v2 tokens server-side (no external JSON library needed —
 * Google's siteverify response is parsed directly for the "success" flag).
 * Set google.recaptcha.enabled=false to bypass (e.g. for automated tests / offline demos).
 */
@Service
public class CaptchaService {

    @Value("${google.recaptcha.enabled:true}")
    private boolean enabled;

    @Value("${google.recaptcha.secret:6LeYHGgtAAAAAJo6MHrM7FCZKzPxzi5P5JO1dE8r}")
    private String secret;

    @Value("${google.recaptcha.verify-url:https://www.google.com/recaptcha/api/siteverify}")
    private String verifyUrl;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    /** Throws CaptchaException if the token is missing, rejected by Google, or unverifiable. */
    public void verify(String token) {
        if (!enabled) {
            return;
        }
        if (!StringUtils.hasText(token)) {
            throw new CaptchaException("Please complete the captcha verification.");
        }
        try {
            String body = "secret=" + URLEncoder.encode(secret, StandardCharsets.UTF_8)
                    + "&response=" + URLEncoder.encode(token, StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(verifyUrl))
                    .timeout(Duration.ofSeconds(8))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            // Google returns e.g. {"success": true, ...}. Strip whitespace and check the flag.
            String json = response.body() == null ? "" : response.body().replaceAll("\\s+", "");
            if (json.contains("\"success\":true")) {
                return;
            }
            throw new CaptchaException("Captcha verification failed. Please try again.");
        } catch (CaptchaException ce) {
            throw ce;
        } catch (Exception e) {
            throw new CaptchaException("Could not verify the captcha right now. Please try again.");
        }
    }
}
