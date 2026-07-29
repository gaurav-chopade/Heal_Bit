package com.healbit.dto;

import com.healbit.entity.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

public class AppointmentStatusUpdateRequest {

    @NotNull(message = "Appointment id is required")
    private Long appointmentId;

    @NotNull(message = "Status is required")
    private AppointmentStatus status;

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }
}
