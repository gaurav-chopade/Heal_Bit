package com.healbit.service;

import com.healbit.dto.AppointmentResponse;
import com.healbit.entity.Appointment;

/**
 * The single place an Appointment entity is turned into an AppointmentResponse.
 *
 * This used to be duplicated in AppointmentService and DoctorDashboardService, and the two
 * copies drifted: when the payment fields were added, only one copy was updated, so the
 * doctor's dashboard reported every appointment as "Payment pending". Keeping one mapper
 * means a new field can only ever be forgotten in one place.
 */
public final class AppointmentMapper {

    private AppointmentMapper() {}

    public static AppointmentResponse toResponse(Appointment a) {
        AppointmentResponse r = new AppointmentResponse();

        r.setAppointmentId(a.getAppointmentId());

        r.setPatientId(a.getPatient().getPatientId());
        r.setPatientName(a.getPatient().getFullName());

        r.setHospitalId(a.getHospital().getHospitalId());
        r.setHospitalName(a.getHospital().getHospitalName());

        r.setDoctorId(a.getDoctor().getDoctorId());
        r.setDoctorName(a.getDoctor().getDoctorName());
        r.setDoctorSpecialization(a.getDoctor().getSpecialization());

        r.setAppointmentDate(a.getAppointmentDate());
        r.setAppointmentTime(a.getAppointmentTime());
        r.setReason(a.getReason());
        r.setStatus(a.getStatus());
        r.setCreatedAt(a.getCreatedAt());

        // Payment details — the part that was missing from the dashboard copy.
        r.setPaymentStatus(a.getPaymentStatus());
        r.setPaymentMethod(a.getPaymentMethod());
        r.setConsultationFee(a.getDoctor().getConsultationFee());
        r.setPaymentAmount(a.getPaymentAmount());

        return r;
    }
}
