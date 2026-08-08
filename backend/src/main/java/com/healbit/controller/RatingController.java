package com.healbit.controller;

import com.healbit.config.UserPrincipal;
import com.healbit.dto.RatingRequest;
import com.healbit.dto.RatingResponse;
import com.healbit.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    /** Patient rates a doctor (requires a completed appointment with them). Rating is upserted. */
    @PostMapping("/doctors/{doctorId}")
    public ResponseEntity<RatingResponse> rateDoctor(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long doctorId,
            @Valid @RequestBody RatingRequest request) {
        return ResponseEntity.ok(ratingService.rateDoctor(principal.getId(), doctorId, request));
    }

    /** Patient rates a hospital (requires a completed appointment there). Rating is upserted. */
    @PostMapping("/hospitals/{hospitalId}")
    public ResponseEntity<RatingResponse> rateHospital(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long hospitalId,
            @Valid @RequestBody RatingRequest request) {
        return ResponseEntity.ok(ratingService.rateHospital(principal.getId(), hospitalId, request));
    }

    /** Public: all reviews for a doctor, newest first. */
    @GetMapping("/doctors/{doctorId}")
    public ResponseEntity<List<RatingResponse>> doctorRatings(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ratingService.getDoctorRatings(doctorId));
    }

    /** Public: all reviews for a hospital, newest first. */
    @GetMapping("/hospitals/{hospitalId}")
    public ResponseEntity<List<RatingResponse>> hospitalRatings(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(ratingService.getHospitalRatings(hospitalId));
    }
}
