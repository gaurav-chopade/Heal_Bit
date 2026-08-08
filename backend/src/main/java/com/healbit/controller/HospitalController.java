package com.healbit.controller;

import com.healbit.config.UserPrincipal;
import com.healbit.dto.ApiResponse;
import com.healbit.dto.HospitalDashboardResponse;
import com.healbit.dto.HospitalResponse;
import com.healbit.dto.PageResponse;
import com.healbit.dto.HospitalUpdateRequest;
import com.healbit.service.HospitalDashboardService;
import com.healbit.service.HospitalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;
    private final HospitalDashboardService hospitalDashboardService;

    public HospitalController(HospitalService hospitalService,
                              HospitalDashboardService hospitalDashboardService) {
        this.hospitalService = hospitalService;
        this.hospitalDashboardService = hospitalDashboardService;
    }

    /** Public: browse + search active hospitals. Optional ?city= / ?name= / ?pincode= filters.
     *  If the caller is a signed-in patient, hospitals in their own city are shown first. */
    @GetMapping
    public ResponseEntity<PageResponse<HospitalResponse>> browse(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String pincode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long patientId = (principal != null && "PATIENT".equals(principal.getRole())) ? principal.getId() : null;
        return ResponseEntity.ok(hospitalService.browseHospitals(city, name, pincode, page, size, patientId));
    }

    /** Hospital insights dashboard. */
    @GetMapping("/dashboard")
    public ResponseEntity<HospitalDashboardResponse> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(hospitalDashboardService.getDashboard(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HospitalResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(hospitalService.getById(id));
    }

    /** Hospital updates its own profile. */
    @PutMapping
    public ResponseEntity<HospitalResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody HospitalUpdateRequest request) {
        return ResponseEntity.ok(hospitalService.updateProfile(principal.getId(), request));
    }

    /** Hospital soft-deletes (deactivates) its own account. */
    @DeleteMapping
    public ResponseEntity<ApiResponse> delete(@AuthenticationPrincipal UserPrincipal principal) {
        hospitalService.softDelete(principal.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Hospital account deactivated"));
    }
}
