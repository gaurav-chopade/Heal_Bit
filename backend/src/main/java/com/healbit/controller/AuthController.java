package com.healbit.controller;

import com.healbit.dto.*;
import com.healbit.service.AuthenticationService;
import com.healbit.service.CaptchaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final CaptchaService captchaService;

    public AuthController(AuthenticationService authenticationService, CaptchaService captchaService) {
        this.authenticationService = authenticationService;
        this.captchaService = captchaService;
    }

    // The reCAPTCHA token is sent by the client in the X-Captcha-Token header.
    private static final String CAPTCHA_HEADER = "X-Captcha-Token";

    @PostMapping("/patient/register")
    public ResponseEntity<LoginResponse> registerPatient(
            @RequestHeader(value = CAPTCHA_HEADER, required = false) String captchaToken,
            @Valid @RequestBody PatientRegisterRequest request) {
        captchaService.verify(captchaToken);
        return new ResponseEntity<>(authenticationService.registerPatient(request), HttpStatus.CREATED);
    }

    @PostMapping("/patient/login")
    public ResponseEntity<LoginResponse> loginPatient(
            @RequestHeader(value = CAPTCHA_HEADER, required = false) String captchaToken,
            @Valid @RequestBody PatientLoginRequest request) {
        captchaService.verify(captchaToken);
        return ResponseEntity.ok(authenticationService.loginPatient(request));
    }

    @PostMapping("/hospital/register")
    public ResponseEntity<LoginResponse> registerHospital(
            @RequestHeader(value = CAPTCHA_HEADER, required = false) String captchaToken,
            @Valid @RequestBody HospitalRegisterRequest request) {
        captchaService.verify(captchaToken);
        return new ResponseEntity<>(authenticationService.registerHospital(request), HttpStatus.CREATED);
    }

    @PostMapping("/hospital/login")
    public ResponseEntity<LoginResponse> loginHospital(
            @RequestHeader(value = CAPTCHA_HEADER, required = false) String captchaToken,
            @Valid @RequestBody HospitalLoginRequest request) {
        captchaService.verify(captchaToken);
        return ResponseEntity.ok(authenticationService.loginHospital(request));
    }

    @PostMapping("/doctor/login")
    public ResponseEntity<LoginResponse> loginDoctor(
            @RequestHeader(value = CAPTCHA_HEADER, required = false) String captchaToken,
            @Valid @RequestBody DoctorLoginRequest request) {
        captchaService.verify(captchaToken);
        return ResponseEntity.ok(authenticationService.loginDoctor(request));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<LoginResponse> loginAdmin(
            @RequestHeader(value = CAPTCHA_HEADER, required = false) String captchaToken,
            @Valid @RequestBody AdminLoginRequest request) {
        captchaService.verify(captchaToken);
        return ResponseEntity.ok(authenticationService.loginAdmin(request));
    }
}
