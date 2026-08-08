package com.healbit.service;

import com.healbit.entity.Appointment;
import com.healbit.entity.AppointmentStatus;
import com.healbit.entity.PaymentMethod;
import com.healbit.entity.PaymentStatus;
import com.healbit.repository.AppointmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Background housekeeping so slots are never blocked forever:
 *  - abandoned online checkouts are released after a short hold,
 *  - appointments the doctor never actioned are expired once their time has passed.
 */
@Service
public class AppointmentMaintenanceService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentMaintenanceService.class);

    /** How long an unpaid online booking may hold its slot. */
    @Value("${healbit.booking.online-hold-minutes:10}")
    private int onlineHoldMinutes;

    private final AppointmentRepository appointmentRepository;
    private final AppointmentService appointmentService;

    public AppointmentMaintenanceService(AppointmentRepository appointmentRepository,
                                         AppointmentService appointmentService) {
        this.appointmentRepository = appointmentRepository;
        this.appointmentService = appointmentService;
    }

    /**
     * Releases slots held by online bookings where the patient never completed payment
     * (closed the tab, lost connection, etc.). Runs every 5 minutes.
     */
    @Scheduled(fixedDelayString = "${healbit.booking.hold-sweep-ms:300000}")
    @Transactional
    public void releaseAbandonedOnlineHolds() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(onlineHoldMinutes);
        List<Appointment> stale = appointmentRepository
                .findByStatusAndPaymentStatusAndPaymentMethodAndCreatedAtBefore(
                        AppointmentStatus.PENDING, PaymentStatus.UNPAID, PaymentMethod.ONLINE, cutoff);
        if (stale.isEmpty()) return;

        appointmentRepository.deleteAll(stale);
        log.info("[Heal-Bit] Released {} abandoned online booking(s) older than {} min", stale.size(), onlineHoldMinutes);
    }

    /**
     * Expires appointments the doctor never confirmed or rejected once the visit time
     * has passed, so the slot and the patient's list don't stay stuck. Runs every 30 minutes.
     */
    @Scheduled(fixedDelayString = "${healbit.booking.expiry-sweep-ms:1800000}")
    @Transactional
    public void expirePastPendingAppointments() {
        LocalDate today = LocalDate.now();
        List<Appointment> candidates = appointmentRepository
                .findByStatusAndAppointmentDateLessThanEqual(AppointmentStatus.PENDING, today);

        int expired = 0;
        for (Appointment a : candidates) {
            LocalDateTime when = LocalDateTime.of(a.getAppointmentDate(), a.getAppointmentTime());
            if (when.isBefore(LocalDateTime.now())) {
                appointmentService.expire(a);   // refunds if it was paid online
                expired++;
            }
        }
        if (expired > 0) {
            log.info("[Heal-Bit] Expired {} appointment(s) the doctor never actioned", expired);
        }
    }
}
