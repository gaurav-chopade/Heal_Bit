package com.healbit.config;

import com.healbit.entity.Admin;
import com.healbit.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${healbit.admin.email:admin@healbit.com}")
    private String defaultEmail;

    @Value("${healbit.admin.password:Admin@123}")
    private String defaultPassword;

    public AdminInitializer(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setEmail(defaultEmail);
            admin.setPassword(passwordEncoder.encode(defaultPassword));
            adminRepository.save(admin);
            System.out.println("[Heal-Bit] Default admin created -> " + defaultEmail + " / " + defaultPassword);
        }
    }
}
