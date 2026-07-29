import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listAppointments, updateAppointmentStatus } from "../../api/appointmentApi";
import { getErrorMessage } from "../../utils/error";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";

// Documents are viewable for patients whose appointment is live (not cancelled/rejected).
const DOC_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED"];

const FILTERS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "REJECTED", "CANCELLED"];
const PAGE_SIZE = 5;

export default function DoctorAppointments() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(0);
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

  const setStatus = async (appointmentId, status) => {
    setError("");
    try {
      await updateAppointmentStatus({ appointmentId, status });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
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
              <tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {shown.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((a) => (
                <tr key={a.appointmentId}>
                  <td>{a.patientName}</td>
                  <td>{a.appointmentDate}</td>
                  <td>{a.appointmentTime}</td>
                  <td>{a.reason}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <div className="actions">
                      {a.status === "PENDING" && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => setStatus(a.appointmentId, "CONFIRMED")}>Confirm</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setStatus(a.appointmentId, "REJECTED")}>Reject</button>
                        </>
                      )}
                      {a.status === "CONFIRMED" && (
                        <button className="btn btn-outline btn-sm" onClick={() => setStatus(a.appointmentId, "COMPLETED")}>Mark completed</button>
                      )}
                      {DOC_STATUSES.includes(a.status) && (
                        <button className="btn btn-outline btn-sm" onClick={() => openDocs(a)}>Documents</button>
                      )}
                      {["CANCELLED", "REJECTED"].includes(a.status) && <span className="muted">—</span>}
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
    </div>
  );
}
