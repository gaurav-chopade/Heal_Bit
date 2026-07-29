package com.healbit.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public auth endpoints (patient/hospital/doctor/admin login + registration)
                .requestMatchers("/auth/**").permitAll()

                // Doctor self-service — declared before the public /doctors/** rule so it wins.
                .requestMatchers(HttpMethod.GET, "/doctors/me").hasRole("DOCTOR")
                .requestMatchers(HttpMethod.PUT, "/doctors/me/schedule").hasRole("DOCTOR")
                .requestMatchers(HttpMethod.GET, "/doctors/dashboard").hasRole("DOCTOR")
                .requestMatchers(HttpMethod.GET, "/doctors/patients/**").hasRole("DOCTOR")

                // Hospital insights — declared before the public /hospitals/** rule.
                .requestMatchers(HttpMethod.GET, "/hospitals/dashboard").hasRole("HOSPITAL")

                // Public browsing for patients (hospitals, doctors, and open slots)
                .requestMatchers(HttpMethod.GET, "/hospitals", "/hospitals/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/doctors", "/doctors/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/specializations", "/specializations/**").permitAll()

                // Ratings: patients submit ratings; anyone can read the aggregated reviews.
                .requestMatchers(HttpMethod.GET, "/ratings/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/ratings/**").hasRole("PATIENT")

                // Patient-only
                .requestMatchers("/patients/**").hasRole("PATIENT")
                .requestMatchers(HttpMethod.POST, "/appointments").hasRole("PATIENT")
                .requestMatchers(HttpMethod.DELETE, "/appointments/**").hasRole("PATIENT")

                // Hospital manages its own doctors and profile
                .requestMatchers(HttpMethod.POST, "/doctors").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.PUT, "/doctors").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.DELETE, "/doctors/**").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.PUT, "/hospitals").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.DELETE, "/hospitals").hasRole("HOSPITAL")

                // Doctor confirms / rejects / completes appointments
                .requestMatchers(HttpMethod.PUT, "/appointments/status").hasRole("DOCTOR")

                // Appointment listing for patient, hospital, and doctor
                .requestMatchers(HttpMethod.GET, "/appointments").hasAnyRole("PATIENT", "HOSPITAL", "DOCTOR")

                // Admin-only
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // Everything else needs authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
