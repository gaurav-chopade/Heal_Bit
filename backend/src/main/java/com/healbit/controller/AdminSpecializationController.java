package com.healbit.controller;

import com.healbit.dto.ApiResponse;
import com.healbit.dto.SpecializationRequest;
import com.healbit.dto.SpecializationResponse;
import com.healbit.service.SpecializationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Admin: manage the specialization master table (add / rename / remove) — no frontend code changes needed. */
@RestController
@RequestMapping("/admin/specializations")
public class AdminSpecializationController {

    private final SpecializationService specializationService;

    public AdminSpecializationController(SpecializationService specializationService) {
        this.specializationService = specializationService;
    }

    @GetMapping
    public ResponseEntity<List<SpecializationResponse>> list() {
        return ResponseEntity.ok(specializationService.list());
    }

    @PostMapping
    public ResponseEntity<SpecializationResponse> add(@Valid @RequestBody SpecializationRequest request) {
        return new ResponseEntity<>(specializationService.add(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SpecializationResponse> update(
            @PathVariable Long id, @Valid @RequestBody SpecializationRequest request) {
        return ResponseEntity.ok(specializationService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
        specializationService.delete(id);
        return ResponseEntity.ok(new ApiResponse(true, "Specialization removed"));
    }
}
