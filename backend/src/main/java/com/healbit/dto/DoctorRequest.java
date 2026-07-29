package com.healbit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.time.LocalTime;
import java.util.List;

public class DoctorRequest {

    // For create: leave doctorId null. For update: supply the doctorId to modify.
    private Long doctorId;

    @NotBlank(message = "Doctor name is required")
    private String doctorName;

    // Credentials are required on create; on update they may be left blank to keep the current ones.
    @Email(message = "Invalid email format")
    private String email;

    private String password;

    private String qualification;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotNull(message = "Experience is required")
    @Min(value = 0, message = "Experience cannot be negative")
    @Max(value = 50, message = "Experience cannot exceed 50 years")
    private Integer experience;

    @PositiveOrZero(message = "Consultation fee cannot be negative")
    private Double consultationFee;

    // e.g. ["MON","TUE","WED"]
    private List<String> workingDays;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    // Recurring daily breaks (lunch, recess, etc.) within the working window.
    private List<BreakPeriod> breaks;

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

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

    public List<BreakPeriod> getBreaks() { return breaks; }
    public void setBreaks(List<BreakPeriod> breaks) { this.breaks = breaks; }
}
