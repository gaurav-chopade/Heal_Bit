package com.healbit.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healbit.dto.AdminDashboardResponse;
import com.healbit.dto.HospitalPerformance;
import com.healbit.dto.HospitalResponse;
import com.healbit.dto.PatientProfileResponse;
import com.healbit.entity.Appointment;
import com.healbit.entity.AppointmentStatus;
import com.healbit.entity.Hospital;
import com.healbit.entity.HospitalStatus;
import com.healbit.entity.Patient;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.repository.AppointmentRepository;
import com.healbit.repository.DoctorRepository;
import com.healbit.repository.HospitalRepository;
import com.healbit.repository.PatientRepository;

@Transactional
@Service
public class AdminService {

    private final HospitalRepository hospitalRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public AdminService(HospitalRepository hospitalRepository,
                        PatientRepository patientRepository,
                        DoctorRepository doctorRepository,
                        AppointmentRepository appointmentRepository) {
        this.hospitalRepository = hospitalRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    /**
     * Hospitals for the admin table, filtered by:
     * "pending" | "active" | "rejected" | "new" (last 7 days) | "recent"/"all" (newest first).
     */
    public List<HospitalResponse> getHospitals(String filter) {
        String f = filter == null ? "all" : filter.trim().toLowerCase();
        List<Hospital> hospitals;
        switch (f) {
            case "pending":
                hospitals = hospitalRepository.findByStatusAndDeletedFalseOrderByCreatedAtDesc(HospitalStatus.PENDING);
                break;
            case "active":
                hospitals = hospitalRepository.findByStatusAndDeletedFalseOrderByCreatedAtDesc(HospitalStatus.ACTIVE);
                break;
            case "rejected":
                hospitals = hospitalRepository.findByStatusAndDeletedFalseOrderByCreatedAtDesc(HospitalStatus.REJECTED);
                break;
            case "new":
                LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
                hospitals = hospitalRepository.findAllByDeletedFalseOrderByCreatedAtDesc()
                        .stream().filter(h -> h.getCreatedAt() != null && h.getCreatedAt().isAfter(cutoff))
                        .collect(Collectors.toList());
                break;
            case "recent":
            case "all":
            default:
                hospitals = hospitalRepository.findAllByDeletedFalseOrderByCreatedAtDesc();
                break;
        }
        return hospitals.stream().map(this::toHospitalResponse).collect(Collectors.toList());
    }

    public List<HospitalResponse> getAllHospitals() {
        return getHospitals("all");
    }

    public HospitalResponse approveHospital(Long hospitalId) {
        Hospital hospital = requireHospital(hospitalId);
        hospital.setStatus(HospitalStatus.ACTIVE);
        return toHospitalResponse(hospitalRepository.save(hospital));
    }

    public HospitalResponse rejectHospital(Long hospitalId) {
        Hospital hospital = requireHospital(hospitalId);
        hospital.setStatus(HospitalStatus.REJECTED);
        return toHospitalResponse(hospitalRepository.save(hospital));
    }

    public void removeHospital(Long hospitalId) {
        Hospital hospital = requireHospital(hospitalId);
        hospital.setDeleted(true);
        hospitalRepository.save(hospital);
    }

    public List<PatientProfileResponse> getAllPatients() {
        return patientRepository.findAllByDeletedFalse()
                .stream().map(this::toPatientResponse).collect(Collectors.toList());
    }

    public void deletePatient(Long patientId) {
        Patient patient = patientRepository.findByPatientIdAndDeletedFalse(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + patientId));
        patient.setDeleted(true);
        patientRepository.save(patient);
    }

    public AdminDashboardResponse getDashboard() {
        AdminDashboardResponse dto = new AdminDashboardResponse();
        dto.setTotalPatients(patientRepository.countByDeletedFalse());
        dto.setTotalHospitals(hospitalRepository.countByDeletedFalse());
        dto.setPendingHospitals(hospitalRepository.countByStatusAndDeletedFalse(HospitalStatus.PENDING));
        dto.setActiveHospitals(hospitalRepository.countByStatusAndDeletedFalse(HospitalStatus.ACTIVE));
        dto.setRejectedHospitals(hospitalRepository.countByStatusAndDeletedFalse(HospitalStatus.REJECTED));
        dto.setTotalDoctors(doctorRepository.countByDeletedFalse());
        dto.setTotalAppointments(appointmentRepository.count());
        dto.setPendingAppointments(appointmentRepository.countByStatus(AppointmentStatus.PENDING));
        dto.setConfirmedAppointments(appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED));
        dto.setCompletedAppointments(appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));
        dto.setRejectedAppointments(appointmentRepository.countByStatus(AppointmentStatus.REJECTED));
        dto.setCancelledAppointments(appointmentRepository.countByStatus(AppointmentStatus.CANCELLED));

        // Per-hospital performance.
        List<Hospital> hospitals = hospitalRepository.findAllByDeletedFalse();
        List<HospitalPerformance> perf = new ArrayList<>();
        for (Hospital h : hospitals) {
            HospitalPerformance p = new HospitalPerformance();
            p.setHospitalId(h.getHospitalId());
            p.setHospitalName(h.getHospitalName());
            p.setCity(h.getCity());
            p.setTotalAppointments(appointmentRepository.countByHospital_HospitalId(h.getHospitalId()));
            p.setCompletedAppointments(
                    appointmentRepository.countByHospital_HospitalIdAndStatus(h.getHospitalId(), AppointmentStatus.COMPLETED));
            p.setDoctorCount(doctorRepository.countByHospital_HospitalIdAndDeletedFalse(h.getHospitalId()));
            perf.add(p);
        }

        dto.setTopHospitalsByAppointments(perf.stream()
                .sorted(Comparator.comparingLong(HospitalPerformance::getTotalAppointments).reversed())
                .limit(5).collect(Collectors.toList()));
        dto.setTopHospitalsByCompleted(perf.stream()
                .sorted(Comparator.comparingLong(HospitalPerformance::getCompletedAppointments).reversed())
                .limit(5).collect(Collectors.toList()));

        List<LocalDateTime> apptTimes = appointmentRepository.findAll()
                .stream().map(Appointment::getCreatedAt).collect(Collectors.toList());
        dto.setAppointmentsTrend(MetricsUtil.monthlyCounts(apptTimes, 6));

        List<LocalDateTime> hospTimes = hospitals.stream().map(Hospital::getCreatedAt).collect(Collectors.toList());
        dto.setHospitalTrend(MetricsUtil.monthlyCounts(hospTimes, 6));

        return dto;
    }

    private Hospital requireHospital(Long hospitalId) {
        return hospitalRepository.findByHospitalIdAndDeletedFalse(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id " + hospitalId));
    }

    private HospitalResponse toHospitalResponse(Hospital h) {
        HospitalResponse r = new HospitalResponse();
        r.setHospitalId(h.getHospitalId());
        r.setHospitalName(h.getHospitalName());
        r.setRegistrationNumber(h.getRegistrationNumber());
        r.setEmail(h.getEmail());
        r.setPhone(h.getPhone());
        r.setAddress(h.getAddress());
        r.setCity(h.getCity());
        r.setState(h.getState());
        r.setPincode(h.getPincode());
        r.setDescription(h.getDescription());
        r.setStatus(h.getStatus());
        r.setCreatedAt(h.getCreatedAt());
        return r;
    }

    private PatientProfileResponse toPatientResponse(Patient p) {
        PatientProfileResponse r = new PatientProfileResponse();
        r.setPatientId(p.getPatientId());
        r.setFullName(p.getFullName());
        r.setEmail(p.getEmail());
        r.setPhoneNumber(p.getPhoneNumber());
        r.setAge(p.getAge());
        r.setGender(p.getGender());
        r.setAddress(p.getAddress());
        r.setCity(p.getCity());
        r.setCreatedAt(p.getCreatedAt());
        return r;
    }
}
