package com.healbit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalTime;

/** A single recurring daily break window (e.g. lunch break) within a doctor's working hours. */
public class BreakPeriod {

    private String label; // e.g. "Lunch break", "Recess"

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    public BreakPeriod() {}

    public BreakPeriod(String label, LocalTime startTime, LocalTime endTime) {
        this.label = label;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
}
