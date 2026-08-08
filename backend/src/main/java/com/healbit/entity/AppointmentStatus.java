package com.healbit.entity;

public enum AppointmentStatus {
    PENDING,
    CONFIRMED,
    COMPLETED,
    REJECTED,
    CANCELLED,
    /** The visit time passed while the appointment was still awaiting the doctor's decision. */
    EXPIRED
}
