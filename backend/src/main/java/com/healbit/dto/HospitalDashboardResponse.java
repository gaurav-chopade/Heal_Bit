package com.healbit.dto;

import java.util.List;

public class HospitalDashboardResponse {

    private String hospitalName;
    private String registrationNumber;
    private long totalDoctors;
    private long availableDoctors;
    private long totalAppointments;
    private long pendingAppointments;
    private long confirmedAppointments;
    private long completedAppointments;
    private long rejectedAppointments;
    private long cancelledAppointments;
    private long expiredAppointments;

    // Appointments handled per doctor (name -> count) for the bar chart.
    private List<DoctorLoad> doctorLoads;
    // Appointments booked per month at this hospital (last 6 months).
    private List<MonthCount> appointmentsTrend;

    public static class DoctorLoad {
        private String doctorName;
        private String specialization;
        private long total;
        private long completed;

        public String getDoctorName() { return doctorName; }
        public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }

        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }

        public long getCompleted() { return completed; }
        public void setCompleted(long completed) { this.completed = completed; }
    }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public long getTotalDoctors() { return totalDoctors; }
    public void setTotalDoctors(long totalDoctors) { this.totalDoctors = totalDoctors; }

    public long getAvailableDoctors() { return availableDoctors; }
    public void setAvailableDoctors(long availableDoctors) { this.availableDoctors = availableDoctors; }

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

    public List<DoctorLoad> getDoctorLoads() { return doctorLoads; }
    public void setDoctorLoads(List<DoctorLoad> doctorLoads) { this.doctorLoads = doctorLoads; }

    public List<MonthCount> getAppointmentsTrend() { return appointmentsTrend; }
    public void setAppointmentsTrend(List<MonthCount> appointmentsTrend) { this.appointmentsTrend = appointmentsTrend; }
}
