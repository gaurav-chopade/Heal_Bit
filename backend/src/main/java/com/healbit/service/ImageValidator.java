package com.healbit.service;

import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

/** Validates hospital images supplied as base64 data URLs (e.g. "data:image/png;base64,...."). */
public final class ImageValidator {

    // Accept common raster image formats only.
    private static final Pattern DATA_URL =
            Pattern.compile("^data:image/(png|jpe?g|gif|webp|bmp);base64,[A-Za-z0-9+/=\\s]+$");

    // ~3 MB of base64 text (roughly a 2 MB image). Guards the request/DB size.
    private static final int MAX_LEN = 3_200_000;

    private ImageValidator() {}

    /** Returns the cleaned image string, or null if none supplied. Throws if the format is invalid. */
    public static String validateAndClean(String image) {
        if (!StringUtils.hasText(image)) return null;
        String cleaned = image.trim();
        if (!cleaned.startsWith("data:image/")) {
            throw new IllegalArgumentException("Only image files are allowed (PNG, JPG, GIF, WEBP, BMP).");
        }
        if (!DATA_URL.matcher(cleaned).matches()) {
            throw new IllegalArgumentException("Unsupported or corrupted image. Please upload a valid image file.");
        }
        if (cleaned.length() > MAX_LEN) {
            throw new IllegalArgumentException("Image is too large. Please use an image under 2 MB.");
        }
        return cleaned;
    }
}
