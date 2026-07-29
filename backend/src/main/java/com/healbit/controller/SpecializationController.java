package com.healbit.controller;

import com.healbit.dto.SpecializationResponse;
import com.healbit.service.SpecializationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Public: dynamic list used to populate the Specialization dropdown when adding/editing a doctor. */
@RestController
@RequestMapping("/specializations")
public class SpecializationController {

    private final SpecializationService specializationService;

    public SpecializationController(SpecializationService specializationService) {
        this.specializationService = specializationService;
    }

    @GetMapping
    public ResponseEntity<List<SpecializationResponse>> list() {
        return ResponseEntity.ok(specializationService.list());
    }
}
