package com.healbit.config;

/**
 * Lightweight authenticated user attached to the SecurityContext after JWT validation.
 * Inject into controllers with @AuthenticationPrincipal UserPrincipal principal.
 */
public class UserPrincipal {

    private final Long id;
    private final String email;
    private final String role; // PATIENT | HOSPITAL | ADMIN

    public UserPrincipal(Long id, String email, String role) {
        this.id = id;
        this.email = email;
        this.role = role;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getRole() { return role; }

    @Override
    public String toString() {
        return email;
    }
}
