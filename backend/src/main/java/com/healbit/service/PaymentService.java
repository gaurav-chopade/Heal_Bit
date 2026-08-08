package com.healbit.service;

import com.healbit.dto.ApiResponse;
import com.healbit.dto.PaymentOrderResponse;
import com.healbit.dto.PaymentVerifyRequest;
import com.healbit.entity.Appointment;
import com.healbit.entity.AppointmentStatus;
import com.healbit.entity.PaymentStatus;
import com.healbit.exception.AppointmentConflictException;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.exception.UnauthorizedException;
import com.healbit.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;

@Transactional
@Service
public class PaymentService {

    // Payment is allowed for live appointments only (not cancelled/rejected).
    private static final Set<AppointmentStatus> PAYABLE =
            EnumSet.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED);

    private final AppointmentRepository appointmentRepository;
    private final RazorpayService razorpay;
    private final AppointmentMailer mailer;

    public PaymentService(AppointmentRepository appointmentRepository, RazorpayService razorpay,
                          AppointmentMailer mailer) {
        this.appointmentRepository = appointmentRepository;
        this.razorpay = razorpay;
        this.mailer = mailer;
    }

    public PaymentOrderResponse createOrder(Long patientId, Long appointmentId) {
        Appointment a = requireOwn(patientId, appointmentId);

        if (a.getPaymentStatus() == PaymentStatus.PAID) {
            throw new AppointmentConflictException("This appointment is already paid");
        }
        if (!PAYABLE.contains(a.getStatus())) {
            throw new AppointmentConflictException("You can only pay for an active appointment");
        }
        Double fee = a.getDoctor().getConsultationFee();
        if (fee == null || fee <= 0) {
            throw new AppointmentConflictException("This doctor has not set a consultation fee");
        }

        long paise = Math.round(fee * 100);
        String orderId = razorpay.createOrder(paise, "apt_" + appointmentId);
        a.setRazorpayOrderId(orderId);
        a.setPaymentAmount(fee);
        appointmentRepository.save(a);

        PaymentOrderResponse r = new PaymentOrderResponse();
        r.setOrderId(orderId);
        r.setAmount(paise);
        r.setCurrency("INR");
        r.setKeyId(razorpay.getKeyId());
        r.setAppointmentId(a.getAppointmentId());
        r.setDoctorName(a.getDoctor().getDoctorName());
        r.setPatientName(a.getPatient().getFullName());
        r.setPatientEmail(a.getPatient().getEmail());
        return r;
    }

    public ApiResponse verify(Long patientId, Long appointmentId, PaymentVerifyRequest req) {
        Appointment a = requireOwn(patientId, appointmentId);

        if (a.getPaymentStatus() == PaymentStatus.PAID) {
            return new ApiResponse(true, "Payment already recorded");
        }
        if (a.getRazorpayOrderId() == null || !a.getRazorpayOrderId().equals(req.getRazorpayOrderId())) {
            throw new AppointmentConflictException("Payment order mismatch");
        }
        boolean valid = razorpay.verifySignature(
                req.getRazorpayOrderId(), req.getRazorpayPaymentId(), req.getRazorpaySignature());
        if (!valid) {
            throw new AppointmentConflictException("Payment verification failed. Please try again.");
        }

        a.setPaymentStatus(PaymentStatus.PAID);
        a.setRazorpayPaymentId(req.getRazorpayPaymentId());
        a.setPaidAt(LocalDateTime.now());
        mailer.bookingPaid(appointmentRepository.save(a));
        return new ApiResponse(true, "Payment successful");
    }

    private Appointment requireOwn(Long patientId, Long appointmentId) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id " + appointmentId));
        if (!a.getPatient().getPatientId().equals(patientId)) {
            throw new UnauthorizedException("You can only pay for your own appointments");
        }
        return a;
    }
}
