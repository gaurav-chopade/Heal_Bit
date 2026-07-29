package com.healbit.dto;

// One row in the "top hospitals" tables on the admin dashboard.
public class HospitalPerformance {
    private Long hospitalId;
    private String hospitalName;
    private String city;
    private long totalAppointments;
    private long completedAppointments;
    private long doctorCount;

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public long getTotalAppointments() { return totalAppointments; }
    public void setTotalAppointments(long totalAppointments) { this.totalAppointments = totalAppointments; }

    public long getCompletedAppointments() { return completedAppointments; }
    public void setCompletedAppointments(long completedAppointments) { this.completedAppointments = completedAppointments; }

    public long getDoctorCount() { return doctorCount; }
    public void setDoctorCount(long doctorCount) { this.doctorCount = doctorCount; }
}
