import { useEffect, useState } from "react";
import { getAllHospitals, approveHospital, rejectHospital, removeHospital } from "../../api/adminApi";
import { getErrorMessage } from "../../utils/error";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 5;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "recent", label: "Recent" },
  { key: "new", label: "Newly registered" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "rejected", label: "Rejected" },
];

export default function ManageHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const load = async (f = filter) => {
    setLoading(true);
    try {
      const { data } = await getAllHospitals(f);
      setHospitals(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(filter); setPage(0); /* eslint-disable-next-line */ }, [filter]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(hospitals.length / PAGE_SIZE) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [hospitals, page]);

  const run = async (fn, id, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    try {
      await fn(id);
      load(filter);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Administrator</p>
          <h1>Hospitals</h1>
          <p className="sub">Approve or reject registrations and remove hospitals.</p>
        </div>
      </div>

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button key={f.key} className={`chip-btn${filter === f.key ? " active" : ""}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : hospitals.length === 0 ? (
        <div className="card empty">No hospitals in this view.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Reg. no.</th><th>Email</th><th>City</th><th>Registered</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {hospitals.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((h) => (
                <tr key={h.hospitalId}>
                  <td>{h.hospitalName}</td>
                  <td>{h.registrationNumber}</td>
                  <td>{h.email}</td>
                  <td>{h.city || "—"}</td>
                  <td>{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : "—"}</td>
                  <td><StatusBadge status={h.status} /></td>
                  <td>
                    <div className="actions">
                      {h.status !== "ACTIVE" && (
                        <button className="btn btn-primary btn-sm" onClick={() => run(approveHospital, h.hospitalId)}>Approve</button>
                      )}
                      {h.status !== "REJECTED" && (
                        <button className="btn btn-outline btn-sm" onClick={() => run(rejectHospital, h.hospitalId)}>Reject</button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => run(removeHospital, h.hospitalId, "Remove this hospital?")}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={Math.ceil(hospitals.length / PAGE_SIZE)}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
