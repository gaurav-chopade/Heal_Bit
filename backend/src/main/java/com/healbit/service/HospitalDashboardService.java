package com.healbit.service;

import com.healbit.dto.HospitalDashboardResponse;
import com.healbit.entity.Appointment;
import com.healbit.entity.AppointmentStatus;
import com.healbit.entity.Doctor;
import com.healbit.entity.Hospital;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.repository.AppointmentRepository;
import com.healbit.repository.DoctorRepository;
import com.healbit.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Transactional(readOnly = true)
@Service
public class HospitalDashboardService {

    private final HospitalRepository hospitalRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorService doctorService;

    public HospitalDashboardService(HospitalRepository hospitalRepository,
                                    DoctorRepository doctorRepository,
                                    AppointmentRepository appointmentRepository,
                                    DoctorService doctorService) {
        this.hospitalRepository = hospitalRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorService = doctorService;
    }

    public HospitalDashboardResponse getDashboard(Long hospitalId) {
        Hospital hospital = hospitalRepository.findByHospitalIdAndDeletedFalse(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id " + hospitalId));

        List<Doctor> doctors = doctorRepository.findByHospital_HospitalIdAndDeletedFalse(hospitalId);
        List<Appointment> appts = appointmentRepository.findByHospital_HospitalId(hospitalId);

        HospitalDashboardResponse dto = new HospitalDashboardResponse();
        dto.setHospitalName(hospital.getHospitalName());
        dto.setRegistrationNumber(hospital.getRegistrationNumber());
        dto.setTotalDoctors(doctors.size());
        // Reuse the availability computation exposed via DoctorService responses.
        long available = doctorService.listOwnDoctors(hospitalId).stream().filter(d -> d.isAvailable()).count();
        dto.setAvailableDoctors(available);

        dto.setTotalAppointments(appts.size());
        dto.setPendingAppointments(count(appts, AppointmentStatus.PENDING));
        dto.setConfirmedAppointments(count(appts, AppointmentStatus.CONFIRMED));
        dto.setCompletedAppointments(count(appts, AppointmentStatus.COMPLETED));
        dto.setRejectedAppointments(count(appts, AppointmentStatus.REJECTED));
        dto.setCancelledAppointments(count(appts, AppointmentStatus.CANCELLED));

        List<HospitalDashboardResponse.DoctorLoad> loads = new ArrayList<>();
        for (Doctor d : doctors) {
            HospitalDashboardResponse.DoctorLoad load = new HospitalDashboardResponse.DoctorLoad();
            load.setDoctorName(d.getDoctorName());
            load.setSpecialization(d.getSpecialization());
            load.setTotal(appts.stream().filter(a -> a.getDoctor().getDoctorId().equals(d.getDoctorId())).count());
            load.setCompleted(appts.stream().filter(a ->
                    a.getDoctor().getDoctorId().equals(d.getDoctorId())
                            && a.getStatus() == AppointmentStatus.COMPLETED).count());
            loads.add(load);
        }
        loads.sort(Comparator.comparingLong(HospitalDashboardResponse.DoctorLoad::getTotal).reversed());
        dto.setDoctorLoads(loads);

        dto.setAppointmentsTrend(MetricsUtil.monthlyCounts(
                appts.stream().map(Appointment::getCreatedAt).collect(Collectors.toList()), 6));

        return dto;
    }

    private long count(List<Appointment> list, AppointmentStatus status) {
        return list.stream().filter(a -> a.getStatus() == status).count();
    }
}
