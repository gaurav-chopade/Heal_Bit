package com.healbit.dto;

import java.util.List;

public class AdminDashboardResponse {

    private long totalPatients;
    private long totalHospitals;
    private long pendingHospitals;
    private long activeHospitals;
    private long rejectedHospitals;
    private long totalDoctors;
    private long totalAppointments;
    private long pendingAppointments;
    private long confirmedAppointments;
    private long completedAppointments;
    private long rejectedAppointments;
    private long cancelledAppointments;
    private long expiredAppointments;

    // Highest-appointment hospitals (by total booked appointments).
    private List<HospitalPerformance> topHospitalsByAppointments;
    // Best-performing hospitals (by completed appointments).
    private List<HospitalPerformance> topHospitalsByCompleted;
    // Appointments booked per month (last 6 months).
    private List<MonthCount> appointmentsTrend;
    // Hospital registrations per month (last 6 months).
    private List<MonthCount> hospitalTrend;

    public long getTotalPatients() { return totalPatients; }
    public void setTotalPatients(long totalPatients) { this.totalPatients = totalPatients; }

    public long getTotalHospitals() { return totalHospitals; }
    public void setTotalHospitals(long totalHospitals) { this.totalHospitals = totalHospitals; }

    public long getPendingHospitals() { return pendingHospitals; }
    public void setPendingHospitals(long pendingHospitals) { this.pendingHospitals = pendingHospitals; }

    public long getActiveHospitals() { return activeHospitals; }
    public void setActiveHospitals(long activeHospitals) { this.activeHospitals = activeHospitals; }

    public long getRejectedHospitals() { return rejectedHospitals; }
    public void setRejectedHospitals(long rejectedHospitals) { this.rejectedHospitals = rejectedHospitals; }

    public long getTotalDoctors() { return totalDoctors; }
    public void setTotalDoctors(long totalDoctors) { this.totalDoctors = totalDoctors; }

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

    public long getExpiredAppointments() { return expiredAppointments; }
    public void setExpiredAppointments(long expiredAppointments) { this.expiredAppointments = expiredAppointments; }

    public List<HospitalPerformance> getTopHospitalsByAppointments() { return topHospitalsByAppointments; }
    public void setTopHospitalsByAppointments(List<HospitalPerformance> v) { this.topHospitalsByAppointments = v; }

    public List<HospitalPerformance> getTopHospitalsByCompleted() { return topHospitalsByCompleted; }
    public void setTopHospitalsByCompleted(List<HospitalPerformance> v) { this.topHospitalsByCompleted = v; }

    public List<MonthCount> getAppointmentsTrend() { return appointmentsTrend; }
    public void setAppointmentsTrend(List<MonthCount> v) { this.appointmentsTrend = v; }

    public List<MonthCount> getHospitalTrend() { return hospitalTrend; }
    public void setHospitalTrend(List<MonthCount> v) { this.hospitalTrend = v; }
}
