package com.healbit.controller;

import com.healbit.config.UserPrincipal;
import com.healbit.dto.PatientProfileResponse;
import com.healbit.dto.PatientProfileUpdateRequest;
import com.healbit.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/profile")
    public ResponseEntity<PatientProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(patientService.getProfile(principal.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<PatientProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PatientProfileUpdateRequest request) {
        return ResponseEntity.ok(patientService.updateProfile(principal.getId(), request));
    }
}
