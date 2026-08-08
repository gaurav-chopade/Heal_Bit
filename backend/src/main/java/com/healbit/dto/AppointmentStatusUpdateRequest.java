package com.healbit.dto;

import com.healbit.entity.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

public class AppointmentStatusUpdateRequest {

    @NotNull(message = "Appointment id is required")
    private Long appointmentId;

    @NotNull(message = "Status is required")
    private AppointmentStatus status;

    /**
     * Only meaningful when completing a cash appointment: true (or omitted) marks it paid,
     * false leaves it as payment pending because the money was never collected.
     */
    private Boolean paymentCollected;

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public Boolean getPaymentCollected() { return paymentCollected; }
    public void setPaymentCollected(Boolean paymentCollected) { this.paymentCollected = paymentCollected; }
}
