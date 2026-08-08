package com.healbit.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class LeaveRequest {
    @NotNull private LocalDate startDate;
    @NotNull private LocalDate endDate;
    private String reason;
    public LocalDate getStartDate() { return startDate; } public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; } public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getReason() { return reason; } public void setReason(String reason) { this.reason = reason; }
}
