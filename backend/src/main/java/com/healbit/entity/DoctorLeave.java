package com.healbit.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_leaves")
public class DoctorLeave {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long leaveId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false) private LocalDate startDate;
    @Column(nullable = false) private LocalDate endDate;
    @Column(length = 500) private String reason;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private LeaveStatus status = LeaveStatus.PENDING;
    @Column(nullable = false) private LocalDateTime requestedAt = LocalDateTime.now();
    private LocalDateTime reviewedAt;

    public Long getLeaveId() { return leaveId; } public void setLeaveId(Long leaveId) { this.leaveId = leaveId; }
    public Doctor getDoctor() { return doctor; } public void setDoctor(Doctor doctor) { this.doctor = doctor; }
    public LocalDate getStartDate() { return startDate; } public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; } public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getReason() { return reason; } public void setReason(String reason) { this.reason = reason; }
    public LeaveStatus getStatus() { return status; } public void setStatus(LeaveStatus status) { this.status = status; }
    public LocalDateTime getRequestedAt() { return requestedAt; } public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; } public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
