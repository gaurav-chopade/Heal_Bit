package com.healbit.service;

import com.healbit.dto.DoctorLeaveResponse;
import com.healbit.dto.LeaveDecisionRequest;
import com.healbit.dto.LeaveRequest;
import com.healbit.entity.*;
import com.healbit.exception.AppointmentConflictException;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.exception.UnauthorizedException;
import com.healbit.repository.AppointmentRepository;
import com.healbit.repository.DoctorLeaveRepository;
import com.healbit.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class DoctorLeaveService {
    private static final java.util.Set<AppointmentStatus> LIVE = java.util.Set.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);
    private final DoctorLeaveRepository leaveRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public DoctorLeaveService(DoctorLeaveRepository leaveRepository, DoctorRepository doctorRepository, AppointmentRepository appointmentRepository) {
        this.leaveRepository = leaveRepository; this.doctorRepository = doctorRepository; this.appointmentRepository = appointmentRepository;
    }
    public DoctorLeaveResponse request(Long doctorId, LeaveRequest request) {
        if (request.getStartDate().isBefore(LocalDate.now())) throw new IllegalArgumentException("Leave cannot start in the past");
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Leave end date must be on or after the start date");
        }
        DoctorLeave leave = new DoctorLeave();
        leave.setDoctor(doctorRepository.findByDoctorIdAndDeletedFalse(doctorId).orElseThrow(() -> new ResourceNotFoundException("Doctor not found")));
        leave.setStartDate(request.getStartDate()); leave.setEndDate(request.getEndDate()); leave.setReason(request.getReason());
        return toResponse(leaveRepository.save(leave));
    }
    public List<DoctorLeaveResponse> own(Long doctorId) { return leaveRepository.findByDoctor_DoctorIdOrderByRequestedAtDesc(doctorId).stream().map(this::toResponse).toList(); }
    public List<DoctorLeaveResponse> hospital(Long hospitalId) { return leaveRepository.findByDoctor_Hospital_HospitalIdOrderByRequestedAtDesc(hospitalId).stream().map(this::toResponse).toList(); }
    public DoctorLeaveResponse decide(Long hospitalId, Long leaveId, LeaveDecisionRequest request) {
        DoctorLeave leave = leaveRepository.findById(leaveId).orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        if (!leave.getDoctor().getHospital().getHospitalId().equals(hospitalId)) throw new UnauthorizedException("Hospitals can only review their own doctors' leave requests");
        if (leave.getStatus() != LeaveStatus.PENDING) throw new IllegalArgumentException("This leave request has already been reviewed");
        if (Boolean.TRUE.equals(request.getApproved())) {
            int bookings = appointmentRepository.findByDoctor_DoctorIdAndStatusInAndAppointmentDateBetween(leave.getDoctor().getDoctorId(), LIVE, leave.getStartDate(), leave.getEndDate()).size();
            if (bookings > 0) throw new AppointmentConflictException("Cannot approve leave while " + bookings + " live appointment(s) are booked for those dates. Reschedule or cancel them first.");
            leave.setStatus(LeaveStatus.APPROVED);
        } else leave.setStatus(LeaveStatus.REJECTED);
        leave.setReviewedAt(LocalDateTime.now());
        return toResponse(leaveRepository.save(leave));
    }
    private DoctorLeaveResponse toResponse(DoctorLeave l) {
        DoctorLeaveResponse r = new DoctorLeaveResponse(); r.setLeaveId(l.getLeaveId()); r.setDoctorId(l.getDoctor().getDoctorId()); r.setDoctorName(l.getDoctor().getDoctorName());
        r.setStartDate(l.getStartDate()); r.setEndDate(l.getEndDate()); r.setReason(l.getReason()); r.setStatus(l.getStatus().name()); r.setRequestedAt(l.getRequestedAt()); r.setReviewedAt(l.getReviewedAt()); return r;
    }
}
