package com.healbit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalTime;
import java.util.List;

// A doctor updates their own schedule and fee from the doctor portal.
public class DoctorAvailabilityRequest {

    private List<String> workingDays;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private Double consultationFee;

    // Recurring daily breaks (lunch, recess, etc.) within the working window.
    private List<BreakPeriod> breaks;

    public List<String> getWorkingDays() { return workingDays; }
    public void setWorkingDays(List<String> workingDays) { this.workingDays = workingDays; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Double getConsultationFee() { return consultationFee; }
    public void setConsultationFee(Double consultationFee) { this.consultationFee = consultationFee; }

    public List<BreakPeriod> getBreaks() { return breaks; }
    public void setBreaks(List<BreakPeriod> breaks) { this.breaks = breaks; }
}
