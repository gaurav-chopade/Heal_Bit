import { useEffect, useState, Fragment } from "react";
import { listAppointments, cancelAppointment } from "../../api/appointmentApi";
import { rateDoctor, rateHospital } from "../../api/ratingApi";
import { getErrorMessage } from "../../utils/error";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import StarRating from "../../components/StarRating";

const PAGE_SIZE = 5;

export default function MyAppointments() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

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
  const cancellable = (s) => s !== "COMPLETED" && s !== "CANCELLED";

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
                <th>Hospital</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th></th>
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
                    <td>
                      <div className="actions">
                        {cancellable(a.status) && (
                          <button className="btn btn-danger btn-sm" onClick={() => onCancel(a.appointmentId)}>Cancel</button>
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
                      <td colSpan={7}>
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
    </div>
  );
}
