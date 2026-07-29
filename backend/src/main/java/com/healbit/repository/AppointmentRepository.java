package com.healbit.repository;

import com.healbit.entity.Appointment;
import com.healbit.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient_PatientId(Long patientId);

    List<Appointment> findByHospital_HospitalId(Long hospitalId);

    List<Appointment> findByDoctor_DoctorId(Long doctorId);

    // All non-cancelled/rejected appointments for a doctor on a date (used to compute free slots).
    List<Appointment> findByDoctor_DoctorIdAndAppointmentDateAndStatusIn(
            Long doctorId, LocalDate appointmentDate, Collection<AppointmentStatus> statuses);

    // Upcoming (from a date onward) live appointments for a doctor — used for the availability tag.
    List<Appointment> findByDoctor_DoctorIdAndAppointmentDateGreaterThanEqualAndStatusIn(
            Long doctorId, LocalDate fromDate, Collection<AppointmentStatus> statuses);

    // Is a specific slot already taken (by anyone) for this doctor?
    boolean existsByDoctor_DoctorIdAndAppointmentDateAndAppointmentTimeAndStatusIn(
            Long doctorId, LocalDate appointmentDate, LocalTime appointmentTime, Collection<AppointmentStatus> statuses);

    boolean existsByPatient_PatientIdAndDoctor_DoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
            Long patientId, Long doctorId, LocalDate appointmentDate, LocalTime appointmentTime, AppointmentStatus status);

    // Used to gate ratings: a patient may only rate a doctor/hospital they've actually completed a visit with.
    boolean existsByPatient_PatientIdAndDoctor_DoctorIdAndStatus(Long patientId, Long doctorId, AppointmentStatus status);

    boolean existsByPatient_PatientIdAndHospital_HospitalIdAndStatus(Long patientId, Long hospitalId, AppointmentStatus status);

    boolean existsByDoctor_DoctorIdAndPatient_PatientIdAndStatusIn(
            Long doctorId, Long patientId, Collection<AppointmentStatus> statuses);

    long count();

    long countByStatus(AppointmentStatus status);

    long countByHospital_HospitalId(Long hospitalId);

    long countByHospital_HospitalIdAndStatus(Long hospitalId, AppointmentStatus status);

    long countByDoctor_DoctorId(Long doctorId);

    long countByDoctor_DoctorIdAndStatus(Long doctorId, AppointmentStatus status);
}
