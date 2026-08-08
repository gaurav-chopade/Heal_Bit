import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listAppointments, updateAppointmentStatus } from "../../api/appointmentApi";
import { getErrorMessage } from "../../utils/error";
import StatusBadge from "../../components/StatusBadge";
import PaymentBadge from "../../components/PaymentBadge";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";

// Documents are viewable for patients whose appointment is live (not cancelled/rejected).
const DOC_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED"];
const CLOSED = ["CANCELLED", "REJECTED", "EXPIRED"];

const FILTERS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "REJECTED", "CANCELLED", "EXPIRED"];
const PAGE_SIZE = 12;

export default function DoctorAppointments() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [completing, setCompleting] = useState(null); // appointment awaiting a cash decision
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const openDocs = (a) =>
    navigate(`/doctor/patients/${a.patientId}/documents`, { state: { patientName: a.patientName } });

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

  const setStatus = async (appointmentId, status, paymentCollected) => {
    setError("");
    setSaving(true);
    try {
      await updateAppointmentStatus({ appointmentId, status, paymentCollected });
      setCompleting(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Online payments are already settled; only a cash visit needs the "did you collect it?" step.
  const onComplete = (a) => {
    if (a.paymentStatus === "PAID" || a.paymentMethod === "ONLINE") {
      setStatus(a.appointmentId, "COMPLETED", true);
    } else {
      setCompleting(a);
    }
  };

  const shown = useMemo(
    () => (filter === "ALL" ? items : items.filter((a) => a.status === filter)),
    [items, filter]
  );

  useEffect(() => { setPage(0); }, [filter]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(shown.length / PAGE_SIZE) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [shown, page]);

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Doctor</p>
          <h1>Appointments</h1>
        </div>
      </div>

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button key={f} className={`chip-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : shown.length === 0 ? (
        <div className="card empty">No appointments here.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Payment</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {shown.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((a) => (
                <tr key={a.appointmentId}>
                  <td>{a.patientName}</td>
                  <td>{a.appointmentDate}</td>
                  <td>{a.appointmentTime}</td>
                  <td>{a.reason}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td><PaymentBadge status={a.paymentStatus} method={a.paymentMethod} /></td>
                  <td>
                    <div className="actions">
                      {a.status === "PENDING" && (
                        <>
                          <button className="btn btn-primary btn-sm" disabled={saving} onClick={() => setStatus(a.appointmentId, "CONFIRMED")}>Confirm</button>
                          <button className="btn btn-danger btn-sm" disabled={saving} onClick={() => setStatus(a.appointmentId, "REJECTED")}>Reject</button>
                        </>
                      )}
                      {a.status === "CONFIRMED" && (
                        <button className="btn btn-outline btn-sm" disabled={saving} onClick={() => onComplete(a)}>Mark completed</button>
                      )}
                      {DOC_STATUSES.includes(a.status) && (
                        <button className="btn btn-outline btn-sm" onClick={() => openDocs(a)}>Documents</button>
                      )}
                      {CLOSED.includes(a.status) && <span className="muted">—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={Math.ceil(shown.length / PAGE_SIZE)}
            onChange={setPage}
          />
        </div>
      )}

      {/* Cash visits: record whether the money was actually collected. */}
      <Modal open={!!completing} onClose={() => setCompleting(null)} title="Complete appointment">
        {completing && (
          <>
            <p>
              Completing the visit for <strong>{completing.patientName}</strong> on{" "}
              {completing.appointmentDate} at {completing.appointmentTime}.
            </p>
            <p className="muted mt-2">
              This appointment was booked as <strong>pay in cash</strong>
              {completing.consultationFee != null ? ` (₹${completing.consultationFee})` : ""}.
              Did you collect the payment?
            </p>
            <div className="actions mt-3">
              <button className="btn btn-primary" disabled={saving}
                onClick={() => setStatus(completing.appointmentId, "COMPLETED", true)}>
                {saving ? "Saving…" : "Yes — mark paid"}
              </button>
              <button className="btn btn-outline" disabled={saving}
                onClick={() => setStatus(completing.appointmentId, "COMPLETED", false)}>
                No — leave payment pending
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setCompleting(null)}>Cancel</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
