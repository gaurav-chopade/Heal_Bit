package com.healbit.service;

import com.healbit.dto.AppointmentResponse;
import com.healbit.dto.DoctorDashboardResponse;
import com.healbit.entity.Appointment;
import com.healbit.entity.AppointmentStatus;
import com.healbit.entity.Doctor;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.repository.AppointmentRepository;
import com.healbit.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Transactional(readOnly = true)
@Service
public class DoctorDashboardService {

    private static final Set<AppointmentStatus> LIVE =
            EnumSet.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public DoctorDashboardService(DoctorRepository doctorRepository,
                                  AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public DoctorDashboardResponse getDashboard(Long doctorId) {
        Doctor doctor = doctorRepository.findByDoctorIdAndDeletedFalse(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id " + doctorId));

        List<Appointment> all = appointmentRepository.findByDoctor_DoctorId(doctorId);

        DoctorDashboardResponse dto = new DoctorDashboardResponse();
        dto.setDoctorName(doctor.getDoctorName());
        dto.setSpecialization(doctor.getSpecialization());
        dto.setHospitalName(doctor.getHospital().getHospitalName());
        dto.setScheduleConfigured(ScheduleUtil.scheduleConfigured(doctor));

        dto.setTotalAppointments(all.size());
        dto.setPendingAppointments(count(all, AppointmentStatus.PENDING));
        dto.setConfirmedAppointments(count(all, AppointmentStatus.CONFIRMED));
        dto.setCompletedAppointments(count(all, AppointmentStatus.COMPLETED));
        dto.setRejectedAppointments(count(all, AppointmentStatus.REJECTED));
        dto.setCancelledAppointments(count(all, AppointmentStatus.CANCELLED));
        dto.setExpiredAppointments(count(all, AppointmentStatus.EXPIRED));

        LocalDate today = LocalDate.now();
        dto.setTodayAppointments(all.stream()
                .filter(a -> today.equals(a.getAppointmentDate()) && LIVE.contains(a.getStatus()))
                .count());

        dto.setUpcoming(all.stream()
                .filter(a -> LIVE.contains(a.getStatus()) && !a.getAppointmentDate().isBefore(today))
                .sorted(Comparator.comparing(Appointment::getAppointmentDate)
                        .thenComparing(Appointment::getAppointmentTime))
                .limit(6)
                .map(this::toResponse)
                .collect(Collectors.toList()));

        dto.setAppointmentsTrend(MetricsUtil.monthlyCounts(
                all.stream().map(Appointment::getCreatedAt).collect(Collectors.toList()), 6));

        return dto;
    }

    private long count(List<Appointment> list, AppointmentStatus status) {
        return list.stream().filter(a -> a.getStatus() == status).count();
    }

    /** Shared with AppointmentService so the payment fields can never go missing again. */
    private AppointmentResponse toResponse(Appointment a) {
        return AppointmentMapper.toResponse(a);
    }
}
