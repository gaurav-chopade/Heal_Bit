package com.healbit.controller;

import com.healbit.config.UserPrincipal;
import com.healbit.dto.*;
import com.healbit.service.DoctorDashboardService;
import com.healbit.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorDashboardService doctorDashboardService;

    public DoctorController(DoctorService doctorService, DoctorDashboardService doctorDashboardService) {
        this.doctorService = doctorService;
        this.doctorDashboardService = doctorDashboardService;
    }

    /**
     * Public listing. ?hospitalId= lists a single hospital's doctors; ?mine=true (hospital token)
     * lists the authenticated hospital's own doctors.
     */
    @GetMapping
    public ResponseEntity<List<DoctorResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(required = false, defaultValue = "false") boolean mine) {
        if (mine && principal != null && "HOSPITAL".equals(principal.getRole())) {
            return ResponseEntity.ok(doctorService.listOwnDoctors(principal.getId()));
        }
        return ResponseEntity.ok(doctorService.listDoctors(hospitalId));
    }

    // ----- Doctor self-service (must be declared before /{id}) -----

    @GetMapping("/me")
    public ResponseEntity<DoctorResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(doctorService.getOwnProfile(principal.getId()));
    }

    @PutMapping("/me/schedule")
    public ResponseEntity<DoctorResponse> updateSchedule(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DoctorAvailabilityRequest request) {
        return ResponseEntity.ok(doctorService.updateOwnSchedule(principal.getId(), request));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DoctorDashboardResponse> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(doctorDashboardService.getDashboard(principal.getId()));
    }

    /** Public: free 30-minute slots for a doctor on a given date (?date=yyyy-MM-dd). */
    @GetMapping("/{id}/slots")
    public ResponseEntity<List<String>> slots(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(doctorService.getAvailableSlots(id, date));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctor(id));
    }

    // ----- Hospital-managed CRUD -----

    @PostMapping
    public ResponseEntity<DoctorResponse> add(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DoctorRequest request) {
        return new ResponseEntity<>(doctorService.addDoctor(principal.getId(), request), HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<DoctorResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(doctorService.updateDoctor(principal.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        doctorService.deleteDoctor(principal.getId(), id);
        return ResponseEntity.ok(new ApiResponse(true, "Doctor removed"));
    }
}
