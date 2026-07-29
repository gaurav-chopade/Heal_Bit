package com.healbit.dto;

public class JWTResponse {

    private String token;
    private String tokenType = "Bearer";
    private long expiresInMs;

    public JWTResponse() {
    }

    public JWTResponse(String token, long expiresInMs) {
        this.token = token;
        this.expiresInMs = expiresInMs;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public long getExpiresInMs() { return expiresInMs; }
    public void setExpiresInMs(long expiresInMs) { this.expiresInMs = expiresInMs; }
}
