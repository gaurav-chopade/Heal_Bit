package com.healbit.controller;

import com.healbit.config.UserPrincipal;
import com.healbit.dto.ApiResponse;
import com.healbit.dto.AppointmentRequest;
import com.healbit.dto.AppointmentResponse;
import com.healbit.dto.AppointmentStatusUpdateRequest;
import com.healbit.dto.RescheduleRequest;
import com.healbit.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    /** Patient books an appointment into a free slot. */
    @PostMapping
    public ResponseEntity<AppointmentResponse> book(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AppointmentRequest request) {
        return new ResponseEntity<>(appointmentService.bookAppointment(principal.getId(), request), HttpStatus.CREATED);
    }

    /**
     * Returns appointments for the current actor:
     * patients get their own history; doctors get their queue; hospitals get all appointments at their hospital.
     */
    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        switch (principal.getRole()) {
            case "PATIENT":
                return ResponseEntity.ok(appointmentService.getPatientAppointments(principal.getId()));
            case "DOCTOR":
                return ResponseEntity.ok(appointmentService.getDoctorAppointments(principal.getId()));
            case "HOSPITAL":
                return ResponseEntity.ok(appointmentService.getHospitalAppointments(principal.getId()));
            default:
                return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /** Doctor confirms / rejects / completes one of their appointments. */
    @PutMapping("/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AppointmentStatusUpdateRequest request) {
        return ResponseEntity.ok(appointmentService.updateStatusByDoctor(principal.getId(), request));
    }

    /** Patient moves an existing appointment to another slot with the same doctor. */
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentResponse> reschedule(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request) {
        return ResponseEntity.ok(appointmentService.reschedule(principal.getId(), id, request));
    }

    /** Patient discards an unpaid booking (e.g. abandoned online payment) to free the slot. */
    @DeleteMapping("/{id}/discard")
    public ResponseEntity<ApiResponse> discard(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        appointmentService.discardUnpaidBooking(principal.getId(), id);
        return ResponseEntity.ok(new ApiResponse(true, "Booking discarded"));
    }

    /** Patient cancels their own appointment. */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> cancel(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        appointmentService.cancelAppointment(principal.getId(), id);
        return ResponseEntity.ok(new ApiResponse(true, "Appointment cancelled"));
    }
}
