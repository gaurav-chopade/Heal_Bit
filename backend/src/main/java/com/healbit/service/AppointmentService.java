package com.healbit.service;

import com.healbit.dto.AppointmentRequest;
import com.healbit.dto.AppointmentResponse;
import com.healbit.dto.AppointmentStatusUpdateRequest;
import com.healbit.dto.RescheduleRequest;
import com.healbit.entity.*;
import com.healbit.exception.AppointmentConflictException;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.exception.UnauthorizedException;
import com.healbit.repository.AppointmentRepository;
import com.healbit.repository.DoctorLeaveRepository;
import com.healbit.repository.DoctorRepository;
import com.healbit.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Transactional
@Service
public class AppointmentService {

    /** Statuses that actively hold a slot. */
    private static final Set<AppointmentStatus> LIVE =
            EnumSet.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);

    /** Statuses that can no longer be changed by anyone. */
    private static final Set<AppointmentStatus> FINAL_STATES = EnumSet.of(
            AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED,
            AppointmentStatus.REJECTED, AppointmentStatus.EXPIRED);

    /** Guards against one account hoarding a doctor's calendar. */
    @Value("${healbit.booking.max-open-per-patient:5}")
    private int maxOpenPerPatient;

    /** How far ahead a patient may book. */
    @Value("${healbit.booking.max-days-ahead:90}")
    private int maxDaysAhead;

    private final AppointmentRepository appointmentRepository;
    private final DoctorLeaveRepository doctorLeaveRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final RazorpayService razorpayService;
    private final AppointmentMailer mailer;

    public AppointmentService(AppointmentRepository appointmentRepository, DoctorLeaveRepository doctorLeaveRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              RazorpayService razorpayService,
                              AppointmentMailer mailer) {
        this.appointmentRepository = appointmentRepository;
        this.doctorLeaveRepository = doctorLeaveRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.razorpayService = razorpayService;
        this.mailer = mailer;
    }

    // =====================================================================
    //  Booking
    // =====================================================================

    public AppointmentResponse bookAppointment(Long patientId, AppointmentRequest request) {
        Patient patient = patientRepository.findByPatientIdAndDeletedFalse(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + patientId));

        Doctor doctor = doctorRepository.findByDoctorIdAndDeletedFalse(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id " + request.getDoctorId()));

        LocalDate date = request.getAppointmentDate();
        LocalTime time = request.getAppointmentTime();

        // The doctor's hospital must be live on the platform.
        requireBookableHospital(doctor);
        // Date/time must be valid for this doctor's published schedule.
        validateSlot(doctor, date, time);
        // The patient must not already be booked elsewhere at this moment.
        requireNoPatientClash(patientId, date, time, null);
        // The patient must be under their open-booking cap.
        long open = appointmentRepository.countByPatient_PatientIdAndStatusIn(patientId, LIVE);
        if (open >= maxOpenPerPatient) {
            throw new AppointmentConflictException(
                    "You already have " + open + " active appointments. Please complete or cancel one before booking another.");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setHospital(doctor.getHospital());
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(date);
        appointment.setAppointmentTime(time);
        appointment.setReason(request.getReason());
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setPaymentMethod(parseMethod(request.getPaymentMethod()));
        appointment.claimSlot();

        Appointment saved = saveClaimingSlot(appointment);
        // For online payments the confirmation email is sent once the payment succeeds,
        // so an abandoned checkout never produces a misleading "we got your booking" email.
        if (saved.getPaymentMethod() != PaymentMethod.ONLINE) {
            mailer.bookingReceived(saved);
        }
        return toResponse(saved);
    }

    /** Patient moves an existing appointment to a different slot (same doctor). */
    public AppointmentResponse reschedule(Long patientId, Long appointmentId, RescheduleRequest request) {
        Appointment appointment = requireOwnAppointment(patientId, appointmentId);

        if (FINAL_STATES.contains(appointment.getStatus())) {
            throw new AppointmentConflictException("This appointment can no longer be rescheduled");
        }

        Doctor doctor = appointment.getDoctor();
        LocalDate date = request.getAppointmentDate();
        LocalTime time = request.getAppointmentTime();

        if (date.equals(appointment.getAppointmentDate()) && time.equals(appointment.getAppointmentTime())) {
            throw new AppointmentConflictException("That is already the appointment's date and time");
        }

        requireBookableHospital(doctor);
        validateSlot(doctor, date, time);
        requireNoPatientClash(patientId, date, time, appointmentId);

        appointment.setAppointmentDate(date);
        appointment.setAppointmentTime(time);
        // Moving the visit sends it back to the doctor for confirmation.
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.claimSlot();

        Appointment moved = saveClaimingSlot(appointment);
        mailer.rescheduled(moved);
        return toResponse(moved);
    }

    // =====================================================================
    //  Listing
    // =====================================================================

    public List<AppointmentResponse> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatient_PatientId(patientId)
                .stream().map(this::toResponse).sorted(byDateTimeDesc()).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getHospitalAppointments(Long hospitalId) {
        return appointmentRepository.findByHospital_HospitalId(hospitalId)
                .stream().map(this::toResponse).sorted(byDateTimeDesc()).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctor_DoctorId(doctorId)
                .stream().map(this::toResponse).sorted(byDateTimeDesc()).collect(Collectors.toList());
    }

    // =====================================================================
    //  Doctor actions
    // =====================================================================

    /** Doctor confirms / rejects / completes one of their own appointments. */
    public AppointmentResponse updateStatusByDoctor(Long doctorId, AppointmentStatusUpdateRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found with id " + request.getAppointmentId()));

        if (!appointment.getDoctor().getDoctorId().equals(doctorId)) {
            throw new UnauthorizedException("Doctors can only manage their own appointments");
        }

        AppointmentStatus target = request.getStatus();
        AppointmentStatus current = appointment.getStatus();

        if (FINAL_STATES.contains(current)) {
            throw new AppointmentConflictException("This appointment can no longer be changed");
        }
        Set<AppointmentStatus> allowed =
                EnumSet.of(AppointmentStatus.CONFIRMED, AppointmentStatus.REJECTED, AppointmentStatus.COMPLETED);
        if (!allowed.contains(target)) {
            throw new IllegalArgumentException("A doctor can only confirm, reject, or complete an appointment");
        }
        if (target == AppointmentStatus.COMPLETED && current != AppointmentStatus.CONFIRMED) {
            throw new AppointmentConflictException("Only a confirmed appointment can be marked completed");
        }

        if (target == AppointmentStatus.REJECTED) {
            maybeRefund(appointment);
            appointment.releaseSlot();
        }

        if (target == AppointmentStatus.COMPLETED) {
            // A cash visit is only marked paid when the doctor confirms the money was collected.
            boolean cashCollected = !Boolean.FALSE.equals(request.getPaymentCollected());
            boolean settled = appointment.getPaymentStatus() == PaymentStatus.PAID
                    || appointment.getPaymentStatus() == PaymentStatus.REFUNDED;
            if (!settled && cashCollected) {
                appointment.setPaymentStatus(PaymentStatus.PAID);
                if (appointment.getPaymentAmount() == null) {
                    appointment.setPaymentAmount(appointment.getDoctor().getConsultationFee());
                }
                appointment.setPaidAt(LocalDateTime.now());
            }
            // The visit happened, so the slot stays consumed (its date is in the past anyway).
        }

        appointment.setStatus(target);
        Appointment updated = appointmentRepository.save(appointment);

        switch (target) {
            case CONFIRMED -> mailer.confirmed(updated);
            case REJECTED -> mailer.rejected(updated);
            case COMPLETED -> mailer.completed(updated);
            default -> { /* no email for other transitions */ }
        }
        return toResponse(updated);
    }

    // =====================================================================
    //  Patient actions
    // =====================================================================

    /** Patient cancels their own appointment (soft cancel -> status CANCELLED, preserves history). */
    public void cancelAppointment(Long patientId, Long appointmentId) {
        Appointment appointment = requireOwnAppointment(patientId, appointmentId);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new AppointmentConflictException("A completed appointment cannot be cancelled");
        }
        if (FINAL_STATES.contains(appointment.getStatus())) {
            throw new AppointmentConflictException("This appointment is already closed");
        }

        Hospital hospital = appointment.getHospital();

        // Once a hospital/doctor has accepted (CONFIRMED) an appointment, cancellation is only
        // allowed if the hospital has opted to permit it.
        if (appointment.getStatus() == AppointmentStatus.CONFIRMED && !hospital.isAllowCancellationAfterAcceptance()) {
            throw new AppointmentConflictException(
                    "This hospital does not allow cancelling an appointment that has already been accepted");
        }

        // Minimum notice: the hospital can require cancellations to happen at least N hours
        // before the scheduled appointment time.
        Integer minHours = hospital.getCancellationMinHours();
        if (minHours != null && minHours > 0) {
            LocalDateTime appointmentDateTime =
                    LocalDateTime.of(appointment.getAppointmentDate(), appointment.getAppointmentTime());
            if (!LocalDateTime.now().plusHours(minHours).isBefore(appointmentDateTime)) {
                throw new AppointmentConflictException(
                        "Cancellations must be made at least " + minHours + " hour" + (minHours == 1 ? "" : "s") +
                                " before the appointment time");
            }
        }

        maybeRefund(appointment);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.releaseSlot();
        mailer.cancelled(appointmentRepository.save(appointment));
    }

    /** Hard-deletes an unpaid booking (used to release the slot if an online payment is abandoned). */
    public void discardUnpaidBooking(Long patientId, Long appointmentId) {
        Appointment appointment = requireOwnAppointment(patientId, appointmentId);
        if (appointment.getPaymentStatus() == PaymentStatus.PAID) {
            throw new AppointmentConflictException("A paid appointment cannot be discarded");
        }
        appointmentRepository.delete(appointment);
    }

    // =====================================================================
    //  Used by the maintenance jobs and by doctor removal
    // =====================================================================

    /** Marks a still-pending, now past-due appointment as EXPIRED and frees its slot. */
    public void expire(Appointment appointment) {
        maybeRefund(appointment);
        appointment.setStatus(AppointmentStatus.EXPIRED);
        appointment.releaseSlot();
        mailer.expired(appointmentRepository.save(appointment));
    }

    /** Cancels an appointment on the platform's behalf (e.g. the doctor was removed). */
    public void cancelAdministratively(Appointment appointment) {
        maybeRefund(appointment);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.releaseSlot();
        mailer.cancelled(appointmentRepository.save(appointment));
    }

    // =====================================================================
    //  Shared validation
    // =====================================================================

    /** Validates a doctor/date/time against the doctor's published schedule. */
    public void validateSlot(Doctor doctor, LocalDate date, LocalTime time) {
        if (date == null || time == null) {
            throw new IllegalArgumentException("An appointment date and time are required");
        }
        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Appointment date cannot be in the past");
        }
        if (date.equals(LocalDate.now()) && !time.isAfter(LocalTime.now())) {
            throw new IllegalArgumentException("Appointment time has already passed");
        }
        if (date.isAfter(LocalDate.now().plusDays(maxDaysAhead))) {
            throw new IllegalArgumentException(
                    "Appointments can only be booked up to " + maxDaysAhead + " days in advance");
        }
        if (!ScheduleUtil.scheduleConfigured(doctor)) {
            throw new AppointmentConflictException("This doctor has not published a schedule yet");
        }
        Set<DayOfWeek> days = ScheduleUtil.parseWorkingDays(doctor.getWorkingDays());
        if (!days.contains(date.getDayOfWeek())) {
            throw new AppointmentConflictException("The doctor does not work on the selected day");
        }
        if (doctorLeaveRepository.existsByDoctor_DoctorIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                doctor.getDoctorId(), com.healbit.entity.LeaveStatus.APPROVED, date, date)) {
            throw new AppointmentConflictException("The doctor is on approved leave on the selected day");
        }
        List<com.healbit.dto.BreakPeriod> breaks = ScheduleUtil.parseBreaks(doctor.getBreaks());
        if (!ScheduleUtil.generateSlots(doctor.getStartTime(), doctor.getEndTime(), breaks, doctor.getSlotDurationMinutes()).contains(time)) {
            throw new AppointmentConflictException(
                    "Please choose a valid slot within the doctor's working hours");
        }
        // Fast, friendly pre-check. The unique slot_key index is what actually guarantees it.
        boolean taken = appointmentRepository
                .existsByDoctor_DoctorIdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                        doctor.getDoctorId(), date, time, LIVE);
        if (taken) {
            throw new AppointmentConflictException("That slot has just been booked. Please pick another time");
        }
    }

    private void requireBookableHospital(Doctor doctor) {
        Hospital hospital = doctor.getHospital();
        if (hospital == null || hospital.isDeleted() || hospital.getStatus() != HospitalStatus.ACTIVE) {
            throw new AppointmentConflictException(
                    "This doctor's hospital is not currently accepting appointments");
        }
    }

    /** A patient cannot be in two places at once. */
    private void requireNoPatientClash(Long patientId, LocalDate date, LocalTime time, Long ignoreAppointmentId) {
        boolean clash = appointmentRepository
                .existsByPatient_PatientIdAndAppointmentDateAndAppointmentTimeAndStatusIn(patientId, date, time, LIVE);
        if (!clash) return;
        if (ignoreAppointmentId != null) {
            // Allow the appointment being rescheduled to "clash" with itself.
            boolean onlyItself = appointmentRepository.findByPatient_PatientId(patientId).stream()
                    .filter(a -> LIVE.contains(a.getStatus()))
                    .filter(a -> a.getAppointmentDate().equals(date) && a.getAppointmentTime().equals(time))
                    .allMatch(a -> a.getAppointmentId().equals(ignoreAppointmentId));
            if (onlyItself) return;
        }
        throw new AppointmentConflictException(
                "You already have another appointment at this date and time");
    }

    /**
     * Saves while translating a unique-index violation on slot_key into a friendly conflict.
     * This is what makes concurrent bookings of the same slot impossible.
     */
    private Appointment saveClaimingSlot(Appointment appointment) {
        try {
            return appointmentRepository.saveAndFlush(appointment);
        } catch (DataIntegrityViolationException ex) {
            throw new AppointmentConflictException(
                    "That slot has just been booked by someone else. Please pick another time");
        }
    }

    private Appointment requireOwnAppointment(Long patientId, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id " + appointmentId));
        if (!appointment.getPatient().getPatientId().equals(patientId)) {
            throw new UnauthorizedException("You can only manage your own appointments");
        }
        return appointment;
    }

    private PaymentMethod parseMethod(String raw) {
        if (raw != null) {
            try {
                return PaymentMethod.valueOf(raw.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) { /* fall through to CASH */ }
        }
        return PaymentMethod.CASH;
    }

    /** If the appointment was paid online, refund it via Razorpay and mark it REFUNDED. */
    private void maybeRefund(Appointment appointment) {
        if (appointment.getPaymentStatus() == PaymentStatus.PAID
                && appointment.getRazorpayPaymentId() != null) {
            String refundId = razorpayService.refund(appointment.getRazorpayPaymentId());
            appointment.setPaymentStatus(PaymentStatus.REFUNDED);
            appointment.setRazorpayRefundId(refundId);
            appointment.setRefundedAt(LocalDateTime.now());
        }
    }

    private Comparator<AppointmentResponse> byDateTimeDesc() {
        return Comparator
                .comparing(AppointmentResponse::getAppointmentDate, Comparator.reverseOrder())
                .thenComparing(AppointmentResponse::getAppointmentTime, Comparator.reverseOrder());
    }

    /** Shared with DoctorDashboardService — see AppointmentMapper. */
    private AppointmentResponse toResponse(Appointment a) {
        return AppointmentMapper.toResponse(a);
    }
}
