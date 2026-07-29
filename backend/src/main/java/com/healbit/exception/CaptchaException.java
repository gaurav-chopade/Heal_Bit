package com.healbit.exception;

/** Thrown when a reCAPTCHA token is missing, invalid, or cannot be verified. */
public class CaptchaException extends RuntimeException {
    public CaptchaException(String message) {
        super(message);
    }
}
