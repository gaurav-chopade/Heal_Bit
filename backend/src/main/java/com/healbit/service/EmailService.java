package com.healbit.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

/**
 * Sends HTML email in the background.
 *
 * Nothing here ever throws: a mail problem (bad app password, no internet, Gmail hiccup)
 * is logged and swallowed so it can never break a booking or a status change.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${healbit.mail.enabled:true}")
    private boolean enabled;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    @Value("${healbit.mail.from-name:Heal-Bit}")
    private String fromName;

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean isConfigured() {
        return enabled && StringUtils.hasText(fromAddress);
    }

    @Async
    public void send(String to, String subject, String html) {
        if (!isConfigured()) {
            log.debug("[Heal-Bit] Mail disabled or not configured — skipping '{}' to {}", subject, to);
            return;
        }
        if (!StringUtils.hasText(to)) return;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            try {
                // Gmail keeps the real address but honours the display name.
                helper.setFrom(new InternetAddress(fromAddress, fromName));
            } catch (UnsupportedEncodingException e) {
                helper.setFrom(fromAddress);
            }
            mailSender.send(message);
            log.info("[Heal-Bit] Sent '{}' to {}", subject, to);
        } catch (Exception e) {
            log.warn("[Heal-Bit] Could not send '{}' to {}: {}", subject, to, e.getMessage());
        }
    }
}
