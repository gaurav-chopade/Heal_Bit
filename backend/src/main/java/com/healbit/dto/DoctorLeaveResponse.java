package com.healbit.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DoctorLeaveResponse {
    private Long leaveId; private Long doctorId; private String doctorName; private LocalDate startDate; private LocalDate endDate;
    private String reason; private String status; private LocalDateTime requestedAt; private LocalDateTime reviewedAt;
    public Long getLeaveId() { return leaveId; } public void setLeaveId(Long leaveId) { this.leaveId = leaveId; }
    public Long getDoctorId() { return doctorId; } public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getDoctorName() { return doctorName; } public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public LocalDate getStartDate() { return startDate; } public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; } public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getReason() { return reason; } public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public LocalDateTime getRequestedAt() { return requestedAt; } public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; } public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
