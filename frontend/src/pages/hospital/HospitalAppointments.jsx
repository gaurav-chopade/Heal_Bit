import { useEffect, useMemo, useState } from "react";
import { listAppointments } from "../../api/appointmentApi";
import { getErrorMessage } from "../../utils/error";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";

const FILTERS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "REJECTED", "CANCELLED", "EXPIRED"];
const PAGE_SIZE = 12;

// Read-only for hospitals: appointments are confirmed/rejected/completed by the doctors themselves.
export default function HospitalAppointments() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(0);

  useEffect(() => {
    listAppointments()
      .then(({ data }) => setItems(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

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
          <p className="eyebrow">Hospital</p>
          <h1>Appointments</h1>
          <p className="sub">Every appointment booked across your doctors. Doctors manage their own confirmations.</p>
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
              <tr><th>Patient</th><th>Doctor</th><th>Specialty</th><th>Date</th><th>Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {shown.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((a) => (
                <tr key={a.appointmentId}>
                  <td>{a.patientName}</td>
                  <td>{a.doctorName}</td>
                  <td>{a.doctorSpecialization || "—"}</td>
                  <td>{a.appointmentDate}</td>
                  <td>{a.appointmentTime}</td>
                  <td><StatusBadge status={a.status} /></td>
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
