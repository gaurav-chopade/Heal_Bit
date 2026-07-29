import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getHospital } from "../../api/hospitalApi";
import { listDoctors, getSlots } from "../../api/doctorApi";
import { bookAppointment } from "../../api/appointmentApi";
import { getErrorMessage } from "../../utils/error";
import { WEEK_DAYS } from "../../constants";
import StarRating from "../../components/StarRating";
import { doctorStatusTag } from "../../utils/doctorStatus";

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
        `Dr. ${bookingFor.doctorName} doesn't work on ${weekdayName(value)}s. ` +
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
    setSaving(true);
    setFeedback({ type: "", msg: "" });
    try {
      await bookAppointment({ doctorId: bookingFor.doctorId, appointmentDate: date, appointmentTime: slot, reason });
      setFeedback({ type: "success", msg: `Appointment requested with Dr. ${bookingFor.doctorName} on ${date} at ${slot}.` });
      setBookingFor(null);
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
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

      {feedback.msg && (
        <div className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}>{feedback.msg}</div>
      )}

      <h2 className="mt-2">Doctors</h2>
      {doctors.length === 0 ? (
        <div className="card empty mt-2">This hospital has not listed any doctors yet.</div>
      ) : (
        <div className="grid grid-2 mt-2">
          {doctors.map((d) => {
            const tag = doctorStatusTag(d);
            return (
            <div key={d.doctorId} className="card">
              <div className="flex-between">
                <h3>Dr. {d.doctorName}</h3>
                <span className={`avail-tag ${tag.cls}`}>
                  <span className="dot-ind" /> {tag.label}
                </span>
              </div>
              <p className="muted mt-2">{d.specialization}{d.qualification ? ` · ${d.qualification}` : ""}</p>
              <StarRating value={d.averageRating || 0} count={d.ratingCount} size={13} />
              <p className="mt-2">
                {d.experience != null ? `${d.experience} yrs experience` : ""}
                {d.consultationFee != null ? ` · Fee ₹${d.consultationFee}` : ""}
              </p>
              {d.workingDays?.length > 0 && (
                <p className="muted">{workingDaysLabel(d.workingDays)} · {d.startTime}–{d.endTime}</p>
              )}
              {d.breaks?.length > 0 && (
                <p className="muted">Break: {d.breaks.map((b) => `${b.startTime}–${b.endTime}`).join(", ")}</p>
              )}

              {bookingFor?.doctorId === d.doctorId ? (
                <form onSubmit={submitBooking} className="mt-3 booking-box">
                  <div className="field">
                    <label>Date</label>
                    <input className={`input${dayError ? " input-error" : ""}`} type="date" min={today} value={date}
                      onChange={(e) => onPickDate(e.target.value)} required />
                    {d.workingDays?.length > 0 && (
                      <p className="hint">Works on {workingDaysLabel(d.workingDays)}.</p>
                    )}
                  </div>

                  {dayError && <p className="err">{dayError}</p>}

                  {date && !dayError && (
                    <div className="field">
                      <label>Available 30-minute slots</label>
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
                  <div className="actions">
                    <button className="btn btn-primary btn-sm" disabled={saving || !slot || !!dayError}>
                      {saving ? "Booking…" : "Confirm booking"}
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setBookingFor(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="actions mt-3">
                  <button className="btn btn-primary btn-sm" onClick={() => openBooking(d)} disabled={!d.available}>
                    {d.available ? "Book appointment" : "Not accepting now"}
                  </button>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
