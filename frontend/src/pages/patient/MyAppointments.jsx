import { useEffect, useState, Fragment } from "react";
import { listAppointments, cancelAppointment, rescheduleAppointment } from "../../api/appointmentApi";
import { getSlots } from "../../api/doctorApi";
import { rateDoctor, rateHospital } from "../../api/ratingApi";
import { getErrorMessage } from "../../utils/error";
import StatusBadge from "../../components/StatusBadge";
import PaymentBadge from "../../components/PaymentBadge";
import Pagination from "../../components/Pagination";
import StarRating from "../../components/StarRating";
import Modal from "../../components/Modal";

const PAGE_SIZE = 12;
const LIVE = ["PENDING", "CONFIRMED"];
const today = new Date().toISOString().split("T")[0];

export default function MyAppointments() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Reschedule flow
  const [reFor, setReFor] = useState(null);        // appointment being moved
  const [reDate, setReDate] = useState("");
  const [reSlots, setReSlots] = useState([]);
  const [reSlotsLoading, setReSlotsLoading] = useState(false);
  const [reSlot, setReSlot] = useState("");
  const [reSaving, setReSaving] = useState(false);
  const [reError, setReError] = useState("");

  const [ratingFor, setRatingFor] = useState(null); // appointmentId currently being rated
  const [doctorRating, setDoctorRating] = useState(0);
  const [doctorReview, setDoctorReview] = useState("");
  const [hospitalRating, setHospitalRating] = useState(0);
  const [hospitalReview, setHospitalReview] = useState("");
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingFeedback, setRatingFeedback] = useState({ type: "", msg: "" });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await listAppointments();
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(items.length / PAGE_SIZE) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [items, page]);

  const onCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await cancelAppointment(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Cancellation is ultimately gated server-side by the hospital's policy (whether an accepted
  // appointment can still be cancelled, and any minimum-notice window); the button just offers
  // the option for any appointment that isn't already finished.
  const cancellable = (s) => LIVE.includes(s);

  const openReschedule = (a) => {
    setReFor(a);
    setReDate("");
    setReSlots([]);
    setReSlot("");
    setReError("");
  };

  const pickReDate = async (value) => {
    setReDate(value);
    setReSlot("");
    setReSlots([]);
    setReError("");
    if (!value || !reFor) return;
    setReSlotsLoading(true);
    try {
      const { data } = await getSlots(reFor.doctorId, value);
      setReSlots(data);
      if (data.length === 0) setReError("No open slots on this day. Try another date.");
    } catch (err) {
      setReError(getErrorMessage(err));
    } finally {
      setReSlotsLoading(false);
    }
  };

  const submitReschedule = async (e) => {
    e.preventDefault();
    if (!reSlot) return setReError("Please pick a new time slot.");
    setReSaving(true);
    setReError("");
    try {
      await rescheduleAppointment(reFor.appointmentId, {
        appointmentDate: reDate,
        appointmentTime: reSlot,
      });
      setReFor(null);
      load();
    } catch (err) {
      setReError(getErrorMessage(err));
    } finally {
      setReSaving(false);
    }
  };

  const openRating = (a) => {
    setRatingFor(a.appointmentId);
    setDoctorRating(0);
    setDoctorReview("");
    setHospitalRating(0);
    setHospitalReview("");
    setRatingFeedback({ type: "", msg: "" });
  };

  const submitRating = async (a) => {
    if (!doctorRating && !hospitalRating) {
      setRatingFeedback({ type: "error", msg: "Pick at least a star rating for the doctor or the hospital." });
      return;
    }
    setRatingSaving(true);
    setRatingFeedback({ type: "", msg: "" });
    try {
      if (doctorRating) {
        await rateDoctor(a.doctorId, { rating: doctorRating, review: doctorReview || undefined });
      }
      if (hospitalRating) {
        await rateHospital(a.hospitalId, { rating: hospitalRating, review: hospitalReview || undefined });
      }
      setRatingFeedback({ type: "success", msg: "Thanks for your feedback!" });
      setTimeout(() => setRatingFor(null), 900);
    } catch (err) {
      setRatingFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
      setRatingSaving(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Patient</p>
          <h1>My appointments</h1>
          <p className="sub">We'll email you whenever an appointment is confirmed, moved or cancelled.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : items.length === 0 ? (
        <div className="card empty">No appointments yet. Browse hospitals to book your first visit.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hospital</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Payment</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((a) => (
                <Fragment key={a.appointmentId}>
                  <tr>
                    <td>{a.hospitalName}</td>
                    <td>{a.doctorName}</td>
                    <td>{a.appointmentDate}</td>
                    <td>{a.appointmentTime}</td>
                    <td>{a.reason}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td><PaymentBadge status={a.paymentStatus} method={a.paymentMethod} /></td>
                    <td>
                      <div className="actions">
                        {cancellable(a.status) && (
                          <>
                            <button className="btn btn-outline btn-sm" onClick={() => openReschedule(a)}>Reschedule</button>
                            <button className="btn btn-danger btn-sm" onClick={() => onCancel(a.appointmentId)}>Cancel</button>
                          </>
                        )}
                        {a.status === "COMPLETED" && (
                          <button className="btn btn-outline btn-sm" onClick={() => openRating(a)}>
                            Rate visit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {ratingFor === a.appointmentId && (
                    <tr>
                      <td colSpan={8}>
                        <div className="card mt-2" style={{ maxWidth: 480 }}>
                          <h3>Rate your visit</h3>
                          {ratingFeedback.msg && (
                            <div className={`alert alert-${ratingFeedback.type === "success" ? "success" : "error"}`}>
                              {ratingFeedback.msg}
                            </div>
                          )}
                          <div className="field">
                            <label>Dr. {a.doctorName}</label>
                            <StarRating value={doctorRating} onChange={setDoctorRating} size={22} />
                            <textarea
                              className="mt-2"
                              placeholder="Optional review (doctor)"
                              value={doctorReview}
                              onChange={(e) => setDoctorReview(e.target.value)}
                            />
                          </div>
                          <div className="field">
                            <label>{a.hospitalName}</label>
                            <StarRating value={hospitalRating} onChange={setHospitalRating} size={22} />
                            <textarea
                              className="mt-2"
                              placeholder="Optional review (hospital)"
                              value={hospitalReview}
                              onChange={(e) => setHospitalReview(e.target.value)}
                            />
                          </div>
                          <div className="actions mt-2">
                            <button className="btn btn-primary btn-sm" disabled={ratingSaving} onClick={() => submitRating(a)}>
                              {ratingSaving ? "Submitting…" : "Submit rating"}
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => setRatingFor(null)}>Close</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={Math.ceil(items.length / PAGE_SIZE)}
            onChange={setPage}
          />
        </div>
      )}

      {/* Reschedule: same doctor, new open slot. */}
      <Modal
        open={!!reFor}
        onClose={() => setReFor(null)}
        title={reFor ? `Reschedule · ${reFor.doctorName}` : ""}
      >
        {reFor && (
          <form onSubmit={submitReschedule}>
            <p className="muted" style={{ margin: "0 0 14px" }}>
              Currently {reFor.appointmentDate} at {reFor.appointmentTime}. Picking a new slot sends the
              appointment back to the doctor for confirmation.
            </p>

            {reError && <div className="alert alert-error">{reError}</div>}

            <div className="field">
              <label>New date</label>
              <input className="input" type="date" min={today} value={reDate}
                onChange={(e) => pickReDate(e.target.value)} required />
            </div>

            {reDate && (
              <div className="field">
                <label>Available appointment slots</label>
                {reSlotsLoading ? (
                  <p className="muted">Checking availability…</p>
                ) : reSlots.length === 0 ? (
                  <p className="muted">No open slots on this day.</p>
                ) : (
                  <div className="slot-grid">
                    {reSlots.map((t) => (
                      <button type="button" key={t}
                        className={`slot-chip${reSlot === t ? " active" : ""}`}
                        onClick={() => setReSlot(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="actions mt-3">
              <button className="btn btn-primary" disabled={reSaving || !reSlot}>
                {reSaving ? "Moving…" : "Confirm new slot"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setReFor(null)}>Cancel</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
