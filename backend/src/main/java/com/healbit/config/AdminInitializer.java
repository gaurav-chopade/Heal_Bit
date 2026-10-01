package com.healbit.config;

import com.healbit.entity.Admin;
import com.healbit.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${healbit.admin.email:admin@healbit.com}")
    private String defaultEmail;

    @Value("${healbit.admin.password:Admin@123}")
    private String defaultPassword;

    // One-time switch. When set to true (environment variable HEALBIT_ADMIN_RESET=true),
    // the existing admin's password is replaced by healbit.admin.password on startup.
    // It defaults to false, so normal restarts never touch the stored password.
    @Value("${healbit.admin.reset:false}")
    private boolean resetPassword;

    public AdminInitializer(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Case 1: brand-new database with no admin yet, so create the default admin.
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setEmail(defaultEmail);
            admin.setPassword(passwordEncoder.encode(defaultPassword));
            adminRepository.save(admin);

            // Log only the email; never write the password to the logs.
            System.out.println("[Heal-Bit] Default admin created -> " + defaultEmail);
            return;
        }

        // Case 2: an admin already exists. Do nothing unless a reset was requested.
        if (!resetPassword) {
            return;
        }

        // Case 3: reset requested. Find the admin by the configured email and replace the
        // stored BCrypt hash with the hash of the new password.
        Optional<Admin> existing = adminRepository.findByEmail(defaultEmail);

        if (existing.isPresent()) {
            Admin admin = existing.get();
            admin.setPassword(passwordEncoder.encode(defaultPassword));
            adminRepository.save(admin);
            System.out.println("[Heal-Bit] Admin password reset for " + defaultEmail);
        } else {
            System.out.println("[Heal-Bit] Admin reset requested, but no admin found with email "
                    + defaultEmail);
        }
    }
}