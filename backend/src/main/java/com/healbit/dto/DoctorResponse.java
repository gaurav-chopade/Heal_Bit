package com.healbit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalTime;
import java.util.List;

public class DoctorResponse {

    private Long doctorId;
    private Long hospitalId;
    private String hospitalName;
    private String hospitalCity;
    private String doctorName;
    private String email;
    private String qualification;
    private String specialization;
    private Integer experience;
    private Double consultationFee;
    private List<String> workingDays;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    // Recurring daily breaks (lunch, recess, etc.) within the working window.
    private List<BreakPeriod> breaks;

    // Computed: does the doctor have at least one free slot in the next 7 days? Drives whether
    // "Book appointment" is enabled — this is a booking-window check, NOT the doctor's real-time
    // presence status, so it deliberately stays true even outside working hours today.
    private boolean available;

    // Computed: is right now (today, current time) inside one of the doctor's break windows?
    // Kept for backward compatibility; prefer currentStatus for display.
    private boolean onBreakNow;

    // Computed real-time presence status for display: "UNAVAILABLE" | "ON_BREAK" | "AVAILABLE".
    // Unlike `available` above, this reflects whether the doctor is within their configured
    // working hours (and not on a break) *right now*.
    private String currentStatus;

    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }

    // Computed: aggregate rating from patients (null if no ratings yet) and how many ratings.
    private Double averageRating;
    private long ratingCount;

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public long getRatingCount() { return ratingCount; }
    public void setRatingCount(long ratingCount) { this.ratingCount = ratingCount; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public String getHospitalCity() { return hospitalCity; }
    public void setHospitalCity(String hospitalCity) { this.hospitalCity = hospitalCity; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public Integer getExperience() { return experience; }
    public void setExperience(Integer experience) { this.experience = experience; }

    public Double getConsultationFee() { return consultationFee; }
    public void setConsultationFee(Double consultationFee) { this.consultationFee = consultationFee; }

    public List<String> getWorkingDays() { return workingDays; }
    public void setWorkingDays(List<String> workingDays) { this.workingDays = workingDays; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public List<BreakPeriod> getBreaks() { return breaks; }
    public void setBreaks(List<BreakPeriod> breaks) { this.breaks = breaks; }

    public boolean isOnBreakNow() { return onBreakNow; }
    public void setOnBreakNow(boolean onBreakNow) { this.onBreakNow = onBreakNow; }
}
