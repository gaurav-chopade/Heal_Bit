package com.healbit.service;

import com.healbit.entity.Appointment;
import com.healbit.entity.PaymentMethod;
import com.healbit.entity.PaymentStatus;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Composes the appointment emails sent to patients.
 *
 * Every method reads the appointment's data synchronously (while the entity is still attached
 * to the transaction) and then hands a finished HTML string to the async EmailService.
 */
@Service
public class AppointmentMailer {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("EEEE, d MMMM yyyy");
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HH:mm");

    private static final String TEAL = "#0f766e";
    private static final String GREEN = "#15803d";
    private static final String AMBER = "#b45309";
    private static final String RED = "#b91c1c";
    private static final String GREY = "#5c6b66";

    private final EmailService email;

    public AppointmentMailer(EmailService email) {
        this.email = email;
    }

    // ---------------------------------------------------------------- events

    public void bookingReceived(Appointment a) {
        send(a, "Appointment request received", TEAL,
                "We've received your request",
                "Your appointment request has been sent to the doctor. You'll get another email as soon as it's confirmed.",
                "Please don't travel to the clinic until the appointment is confirmed.");
    }

    public void bookingPaid(Appointment a) {
        send(a, "Payment received — appointment request sent", TEAL,
                "Payment successful",
                "Thanks — your payment has gone through and your request is with the doctor. We'll email you the moment it's confirmed.",
                null);
    }

    public void confirmed(Appointment a) {
        send(a, "Your appointment is confirmed", GREEN,
                "You're confirmed",
                "Good news — the doctor has confirmed your appointment. Please arrive a few minutes early.",
                paymentReminder(a));
    }

    public void rejected(Appointment a) {
        send(a, "Your appointment request was declined", RED,
                "Request declined",
                "Unfortunately the doctor couldn't take this appointment. You're welcome to book another slot, or try a different doctor.",
                refundNote(a));
    }

    public void rescheduled(Appointment a) {
        send(a, "Your appointment has been moved", AMBER,
                "New date and time",
                "Your appointment has been rescheduled to the slot below. It's gone back to the doctor for confirmation.",
                null);
    }

    public void cancelled(Appointment a) {
        send(a, "Your appointment is cancelled", GREY,
                "Appointment cancelled",
                "This appointment has been cancelled and the slot has been released.",
                refundNote(a));
    }

    public void completed(Appointment a) {
        send(a, "Thanks for visiting", TEAL,
                "Visit complete",
                "Your appointment is marked as completed. If you have a moment, you can rate your doctor and the hospital from My Appointments.",
                null);
    }

    public void expired(Appointment a) {
        send(a, "Your appointment request expired", GREY,
                "Request expired",
                "The doctor didn't respond before the appointment time, so the request has expired and the slot is free again. "
                        + "You can book another slot whenever you're ready.",
                refundNote(a));
    }

    // ---------------------------------------------------------------- helpers

    private String paymentReminder(Appointment a) {
        if (a.getPaymentMethod() == PaymentMethod.CASH && a.getPaymentStatus() != PaymentStatus.PAID) {
            return "Please carry the consultation fee — you chose to pay in cash at the clinic.";
        }
        return null;
    }

    private String refundNote(Appointment a) {
        if (a.getPaymentStatus() == PaymentStatus.REFUNDED) {
            return "Your online payment has been refunded. It usually reaches your account within 5–7 working days.";
        }
        return null;
    }

    private void send(Appointment a, String subject, String accent,
                      String heading, String lead, String note) {
        String to = a.getPatient().getEmail();
        if (to == null || to.isBlank()) return;

        List<String[]> rows = new ArrayList<>();
        rows.add(new String[]{"Doctor", "Dr. " + a.getDoctor().getDoctorName().replaceFirst("(?i)^dr\\.?\\s*", "")});
        if (a.getDoctor().getSpecialization() != null) {
            rows.add(new String[]{"Speciality", a.getDoctor().getSpecialization()});
        }
        rows.add(new String[]{"Hospital", a.getHospital().getHospitalName()});
        rows.add(new String[]{"Date", a.getAppointmentDate().format(DATE)});
        rows.add(new String[]{"Time", a.getAppointmentTime().format(TIME) + " (30 minutes)"});
        rows.add(new String[]{"Payment", paymentLabel(a)});

        email.send(to, "Heal-Bit · " + subject,
                layout(a.getPatient().getFullName(), heading, lead, rows, note, accent));
    }

    private String paymentLabel(Appointment a) {
        String amount = a.getPaymentAmount() != null ? " (₹" + strip(a.getPaymentAmount()) + ")"
                : a.getDoctor().getConsultationFee() != null ? " (₹" + strip(a.getDoctor().getConsultationFee()) + ")" : "";
        if (a.getPaymentStatus() == PaymentStatus.PAID) {
            return (a.getPaymentMethod() == PaymentMethod.ONLINE ? "Paid online" : "Paid in cash") + amount;
        }
        if (a.getPaymentStatus() == PaymentStatus.REFUNDED) {
            return "Refunded" + amount;
        }
        return (a.getPaymentMethod() == PaymentMethod.ONLINE ? "Payment pending" : "Pay in cash at the clinic") + amount;
    }

    private String strip(Double value) {
        return value == Math.floor(value) ? String.valueOf(value.longValue()) : String.valueOf(value);
    }

    /** Simple table-based HTML that renders reliably in email clients. */
    private String layout(String patientName, String heading, String lead,
                          List<String[]> rows, String note, String accent) {
        StringBuilder details = new StringBuilder();
        for (String[] row : rows) {
            details.append("""
                    <tr>
                      <td style="padding:9px 0;color:#5c6b66;font-size:14px;width:38%%;">%s</td>
                      <td style="padding:9px 0;color:#14302b;font-size:14px;font-weight:600;">%s</td>
                    </tr>
                    """.formatted(esc(row[0]), esc(row[1])));
        }

        String noteBlock = note == null ? "" : """
                <p style="margin:20px 0 0;padding:12px 14px;background:#f6faf8;border-left:3px solid %s;
                          color:#14302b;font-size:14px;line-height:1.6;border-radius:6px;">%s</p>
                """.formatted(accent, esc(note));

        return """
                <!doctype html>
                <html><body style="margin:0;padding:0;background:#eef3f0;
                                   font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0"
                         style="background:#eef3f0;padding:28px 12px;">
                    <tr><td align="center">
                      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0"
                             style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;
                                    box-shadow:0 2px 14px rgba(16,40,34,0.08);">

                        <tr><td style="background:%s;padding:22px 28px;">
                          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.2px;">
                            Heal&middot;Bit
                          </span>
                        </td></tr>

                        <tr><td style="padding:28px;">
                          <h1 style="margin:0 0 6px;color:#14302b;font-size:21px;">%s</h1>
                          <p style="margin:0 0 4px;color:#5c6b66;font-size:14px;">Hi %s,</p>
                          <p style="margin:12px 0 22px;color:#14302b;font-size:15px;line-height:1.65;">%s</p>

                          <table role="presentation" width="100%%" cellpadding="0" cellspacing="0"
                                 style="border-top:1px solid #e6ede9;border-bottom:1px solid #e6ede9;">
                            %s
                          </table>

                          %s
                        </td></tr>

                        <tr><td style="padding:18px 28px;background:#f6faf8;border-top:1px solid #e6ede9;">
                          <p style="margin:0;color:#5c6b66;font-size:12px;line-height:1.6;">
                            You're receiving this because you booked an appointment on Heal-Bit.
                            Manage your appointments any time from My Appointments.
                          </p>
                        </td></tr>

                      </table>
                    </td></tr>
                  </table>
                </body></html>
                """.formatted(accent, esc(heading), esc(patientName), esc(lead), details, noteBlock);
    }

    private String esc(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
