package com.healbit.entity;

/**
 * A doctor's real-time presence status, derived from their configured working hours and break
 * windows compared against the current time. See ScheduleUtil#computeCurrentStatus.
 */
public enum DoctorStatus {
    /** Outside configured working hours right now (including days they don't work, or no
     *  schedule configured at all). */
    UNAVAILABLE,
    /** Within working hours right now, but currently inside a configured break window. */
    ON_BREAK,
    /** Within working hours right now and not on a break. */
    AVAILABLE
}
