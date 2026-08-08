package com.healbit.controller;

import com.healbit.dto.AdminDashboardResponse;
import com.healbit.dto.ApiResponse;
import com.healbit.dto.HospitalResponse;
import com.healbit.dto.PatientProfileResponse;
import com.healbit.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/hospitals")
    public ResponseEntity<List<HospitalResponse>> getAllHospitals(
            @RequestParam(required = false, defaultValue = "all") String filter) {
        return ResponseEntity.ok(adminService.getHospitals(filter));
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<HospitalResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveHospital(id));
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<HospitalResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.rejectHospital(id));
    }

    @DeleteMapping("/hospitals/{id}")
    public ResponseEntity<ApiResponse> removeHospital(@PathVariable Long id) {
        adminService.removeHospital(id);
        return ResponseEntity.ok(new ApiResponse(true, "Hospital removed"));
    }

    @GetMapping("/users")
    public ResponseEntity<List<PatientProfileResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllPatients());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id) {
        adminService.deletePatient(id);
        return ResponseEntity.ok(new ApiResponse(true, "User deleted"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> dashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }
}
