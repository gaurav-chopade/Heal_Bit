import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getHospital } from "../../api/hospitalApi";
import { listDoctors, getSlots } from "../../api/doctorApi";
import { bookAppointment, discardBooking } from "../../api/appointmentApi";
import { createPaymentOrder, verifyPayment } from "../../api/paymentApi";
import { loadRazorpay } from "../../utils/razorpay";
import { getErrorMessage } from "../../utils/error";
import { WEEK_DAYS } from "../../constants";
import StarRating from "../../components/StarRating";
import Modal from "../../components/Modal";
import Icon from "../../components/icons";
import { doctorStatusTag } from "../../utils/doctorStatus";

// Avoid "Dr. Dr." when a stored name already includes the prefix.
const drName = (name = "") => (/^dr\.?\s/i.test(name.trim()) ? name.trim() : `Dr. ${name.trim()}`);
const initials = (name = "") =>
  name.replace(/^dr\.?\s*/i, "").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "D";

const today = new Date().toISOString().split("T")[0];

// JS getDay(): 0=Sun..6=Sat  ->  our day tokens
const DOW_TOKENS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DOW_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const labelFor = (tok) => WEEK_DAYS.find((d) => d.value === tok)?.label || tok;
const workingDaysLabel = (arr) => (arr || []).map(labelFor).join(", ");

// Parse a "yyyy-MM-dd" string in local time (avoids UTC day-shift from new Date(str)).
function weekdayToken(value) {
  const [y, m, d] = value.split("-").map(Number);
  return DOW_TOKENS[new Date(y, m - 1, d).getDay()];
}
function weekdayName(value) {
  const [y, m, d] = value.split("-").map(Number);
  return DOW_FULL[new Date(y, m - 1, d).getDay()];
}

export default function HospitalDetails() {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [bookingFor, setBookingFor] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slot, setSlot] = useState("");
  const [dayError, setDayError] = useState(""); // set when the chosen date is an off-day
  const [reason, setReason] = useState("");
  const [payMethod, setPayMethod] = useState(""); // "ONLINE" | "CASH"
  const [feedback, setFeedback] = useState({ type: "", msg: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [hRes, dRes] = await Promise.all([getHospital(id), listDoctors({ hospitalId: id })]);
        setHospital(hRes.data);
        setDoctors(dRes.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const openBooking = (doctor) => {
    setBookingFor(doctor);
    setDate(""); setSlots([]); setSlot(""); setDayError("");
    setReason("");
    setPayMethod("");
    setFeedback({ type: "", msg: "" });
  };

  const onPickDate = async (value) => {
    setDate(value);
    setSlot("");
    setSlots([]);
    setDayError("");
    if (!value || !bookingFor) return;

    // Guard: reject days the doctor doesn't work, before even asking for slots.
    const days = bookingFor.workingDays || [];
    const token = weekdayToken(value);
    if (days.length > 0 && !days.includes(token)) {
      setDayError(
        `${drName(bookingFor.doctorName)} doesn't work on ${weekdayName(value)}s. ` +
        `Working days: ${workingDaysLabel(days)}.`
      );
      return;
    }

    setSlotsLoading(true);
    try {
      const { data } = await getSlots(bookingFor.doctorId, value);
      setSlots(data);
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
      setSlotsLoading(false);
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (dayError) return setFeedback({ type: "error", msg: dayError });
    if (!slot) return setFeedback({ type: "error", msg: "Please pick an available time slot." });
    if (!payMethod) return setFeedback({ type: "error", msg: "Please choose how you'd like to pay." });
    setSaving(true);
    setFeedback({ type: "", msg: "" });

    let booked;
    try {
      const { data } = await bookAppointment({
        doctorId: bookingFor.doctorId,
        appointmentDate: date,
        appointmentTime: slot,
        reason,
        paymentMethod: payMethod,
      });
      booked = data;
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
      setSaving(false);
      return;
    }

    // Cash: nothing more to do — booked as "Payment pending".
    if (payMethod === "CASH") {
      setFeedback({ type: "success", msg: `Appointment booked with ${drName(bookingFor.doctorName)} on ${date} at ${slot}. Pay in cash at your visit — we\u2019ve emailed you the details.` });
      setBookingFor(null);
      setSaving(false);
      return;
    }

    // Online: the slot is now reserved; open Razorpay. If anything goes wrong, discard the reservation.
    try {
      const ready = await loadRazorpay();
      if (!ready) throw new Error("gateway");
      const { data: order } = await createPaymentOrder(booked.appointmentId);
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Heal-Bit",
        description: `Consultation with Dr. ${order.doctorName}`,
        prefill: { name: order.patientName, email: order.patientEmail },
        theme: { color: "#0f766e" },
        handler: async (resp) => {
          try {
            await verifyPayment(booked.appointmentId, {
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            });
            setFeedback({ type: "success", msg: `Booked and paid online with ${drName(bookingFor.doctorName)} on ${date} at ${slot}. A receipt is on its way to your email.` });
            setBookingFor(null);
          } catch (err) {
            setFeedback({ type: "error", msg: getErrorMessage(err) });
          } finally {
            setSaving(false);
          }
        },
        modal: {
          ondismiss: async () => {
            await discardBooking(booked.appointmentId).catch(() => {});
            setFeedback({ type: "error", msg: "Payment cancelled — the booking was not completed." });
            setSaving(false);
          },
        },
      });
      rzp.open();
    } catch (err) {
      await discardBooking(booked.appointmentId).catch(() => {});
      setFeedback({ type: "error", msg: "Could not start the payment. Please try again." });
      setSaving(false);
    }
  };

  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      {hospital.imageUrl && (
        <div className="hospital-banner">
          <img src={hospital.imageUrl} alt={hospital.hospitalName} />
        </div>
      )}
      <div className="page-head">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>{hospital.hospitalName}</h1>
          <p className="sub">
            {[hospital.city, hospital.state].filter(Boolean).join(", ")}
            {hospital.pincode ? ` · ${hospital.pincode}` : ""}
          </p>
          <div className="mt-2">
            <StarRating value={hospital.averageRating || 0} count={hospital.ratingCount} size={15} />
          </div>
        </div>
        <Link to="/patient/hospitals" className="btn btn-outline btn-sm">Back to list</Link>
      </div>

      {feedback.msg && !bookingFor && (
        <div className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}>{feedback.msg}</div>
      )}

      <h2 className="mt-2">Doctors</h2>
      {doctors.length === 0 ? (
        <div className="card empty mt-2">This hospital has not listed any doctors yet.</div>
      ) : (
        <div className="doctor-grid mt-2">
          {doctors.map((d) => {
            const tag = doctorStatusTag(d);
            return (
              <div key={d.doctorId} className="card doctor-card">
                <div className="doctor-card-head">
                  <span className="doctor-avatar">{initials(d.doctorName)}</span>
                  <div className="doctor-head-text">
                    <h3>{drName(d.doctorName)}</h3>
                    <p className="doctor-spec">{d.specialization}{d.qualification ? ` · ${d.qualification}` : ""}</p>
                  </div>
                  <span className={`avail-tag ${tag.cls}`}>
                    <span className="dot-ind" /> {tag.label}
                  </span>
                </div>

                <StarRating value={d.averageRating || 0} count={d.ratingCount} size={14} />

                <div className="doctor-facts">
                  <span>{d.experience != null ? `${d.experience} yrs experience` : "Experience —"}</span>
                  <span className="doctor-fee">{d.consultationFee != null ? `₹${d.consultationFee}` : "—"}</span>
                </div>

                <div className="doctor-schedule">
                  {d.workingDays?.length > 0 ? (
                    <p><Icon name="calendar" size={14} /> {workingDaysLabel(d.workingDays)} · {d.startTime}–{d.endTime}</p>
                  ) : (
                    <p className="muted"><Icon name="calendar" size={14} /> Schedule not set</p>
                  )}
                  {d.breaks?.length > 0 && (
                    <p><Icon name="clock" size={14} /> Break {d.breaks.map((b) => `${b.startTime}–${b.endTime}`).join(", ")}</p>
                  )}
                </div>

                <div className="doctor-card-foot">
                  <button className="btn btn-primary btn-block" onClick={() => openBooking(d)} disabled={!d.available}>
                    {d.available ? "Book appointment" : "Not accepting now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={!!bookingFor}
        onClose={() => setBookingFor(null)}
        title={bookingFor ? `Book · ${drName(bookingFor.doctorName)}` : ""}
      >
        {bookingFor && (
          <form onSubmit={submitBooking}>
            {feedback.msg && feedback.type === "error" && (
              <div className="alert alert-error">{feedback.msg}</div>
            )}
            <p className="muted" style={{ margin: "0 0 14px" }}>
              {bookingFor.specialization}
              {bookingFor.consultationFee != null ? ` · Fee ₹${bookingFor.consultationFee}` : ""}
            </p>

            <div className="field">
              <label>Date</label>
              <input className={`input${dayError ? " input-error" : ""}`} type="date" min={today} value={date}
                onChange={(e) => onPickDate(e.target.value)} required />
              {bookingFor.workingDays?.length > 0 && (
                <p className="hint">Works on {workingDaysLabel(bookingFor.workingDays)}.</p>
              )}
            </div>

            {dayError && <p className="err">{dayError}</p>}

            {date && !dayError && (
              <div className="field">
                <label>Available appointment slots</label>
                {slotsLoading ? (
                  <p className="muted">Checking availability…</p>
                ) : slots.length === 0 ? (
                  <p className="muted">No open slots on this day. Try another date.</p>
                ) : (
                  <div className="slot-grid">
                    {slots.map((t) => (
                      <button type="button" key={t}
                        className={`slot-chip${slot === t ? " active" : ""}`}
                        onClick={() => setSlot(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="field">
              <label>Reason</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} required />
            </div>

            <div className="field">
              <label>Payment</label>
              <div className="pay-method">
                <button type="button" className={`pay-opt${payMethod === "ONLINE" ? " active" : ""}`} onClick={() => setPayMethod("ONLINE")}>
                  <span className="pay-opt-title">Pay now · online</span>
                  <span className="pay-opt-sub">{bookingFor.consultationFee != null ? `₹${bookingFor.consultationFee} via Razorpay` : "via Razorpay"}</span>
                </button>
                <button type="button" className={`pay-opt${payMethod === "CASH" ? " active" : ""}`} onClick={() => setPayMethod("CASH")}>
                  <span className="pay-opt-title">Pay in cash</span>
                  <span className="pay-opt-sub">at the clinic on your visit</span>
                </button>
              </div>
            </div>

            <div className="actions mt-3">
              <button className="btn btn-primary" disabled={saving || !slot || !!dayError || !payMethod}>
                {saving
                  ? "Processing…"
                  : payMethod === "ONLINE"
                  ? `Pay${bookingFor.consultationFee != null ? ` ₹${bookingFor.consultationFee}` : ""} & book`
                  : "Book appointment"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setBookingFor(null)}>Cancel</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
