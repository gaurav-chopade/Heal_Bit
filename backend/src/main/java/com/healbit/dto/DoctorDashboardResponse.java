package com.healbit.dto;

import java.util.List;

public class DoctorDashboardResponse {

    private String doctorName;
    private String specialization;
    private String hospitalName;
    private boolean scheduleConfigured;
    private long totalAppointments;
    private long pendingAppointments;
    private long confirmedAppointments;
    private long completedAppointments;
    private long rejectedAppointments;
    private long cancelledAppointments;
    private long todayAppointments;

    // Next few upcoming (PENDING/CONFIRMED) appointments.
    private List<AppointmentResponse> upcoming;
    // Appointments per month (last 6 months).
    private List<MonthCount> appointmentsTrend;

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public boolean isScheduleConfigured() { return scheduleConfigured; }
    public void setScheduleConfigured(boolean scheduleConfigured) { this.scheduleConfigured = scheduleConfigured; }

    public long getTotalAppointments() { return totalAppointments; }
    public void setTotalAppointments(long totalAppointments) { this.totalAppointments = totalAppointments; }

    public long getPendingAppointments() { return pendingAppointments; }
    public void setPendingAppointments(long pendingAppointments) { this.pendingAppointments = pendingAppointments; }

    public long getConfirmedAppointments() { return confirmedAppointments; }
    public void setConfirmedAppointments(long confirmedAppointments) { this.confirmedAppointments = confirmedAppointments; }

    public long getCompletedAppointments() { return completedAppointments; }
    public void setCompletedAppointments(long completedAppointments) { this.completedAppointments = completedAppointments; }

    public long getRejectedAppointments() { return rejectedAppointments; }
    public void setRejectedAppointments(long rejectedAppointments) { this.rejectedAppointments = rejectedAppointments; }

    public long getCancelledAppointments() { return cancelledAppointments; }
    public void setCancelledAppointments(long cancelledAppointments) { this.cancelledAppointments = cancelledAppointments; }

    public long getTodayAppointments() { return todayAppointments; }
    public void setTodayAppointments(long todayAppointments) { this.todayAppointments = todayAppointments; }

    public List<AppointmentResponse> getUpcoming() { return upcoming; }
    public void setUpcoming(List<AppointmentResponse> upcoming) { this.upcoming = upcoming; }

    public List<MonthCount> getAppointmentsTrend() { return appointmentsTrend; }
    public void setAppointmentsTrend(List<MonthCount> appointmentsTrend) { this.appointmentsTrend = appointmentsTrend; }
}
