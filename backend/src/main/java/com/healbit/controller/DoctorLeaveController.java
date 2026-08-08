package com.healbit.controller;

import com.healbit.config.UserPrincipal;
import com.healbit.dto.*;
import com.healbit.service.DoctorLeaveService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/doctor-leaves")
public class DoctorLeaveController {
    private final DoctorLeaveService service;
    public DoctorLeaveController(DoctorLeaveService service) { this.service = service; }
    @PostMapping public ResponseEntity<DoctorLeaveResponse> request(@AuthenticationPrincipal UserPrincipal p, @Valid @RequestBody LeaveRequest r) { return new ResponseEntity<>(service.request(p.getId(), r), HttpStatus.CREATED); }
    @GetMapping("/mine") public List<DoctorLeaveResponse> mine(@AuthenticationPrincipal UserPrincipal p) { return service.own(p.getId()); }
    @GetMapping public List<DoctorLeaveResponse> hospital(@AuthenticationPrincipal UserPrincipal p) { return service.hospital(p.getId()); }
    @PutMapping("/{id}/decision") public DoctorLeaveResponse decide(@AuthenticationPrincipal UserPrincipal p, @PathVariable Long id, @Valid @RequestBody LeaveDecisionRequest r) { return service.decide(p.getId(), id, r); }
}
