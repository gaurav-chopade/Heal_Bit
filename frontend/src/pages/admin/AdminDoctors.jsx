import { useEffect, useMemo, useState } from "react";
import { listDoctors } from "../../api/doctorApi";
import { getSpecializations } from "../../api/specializationApi";
import { getErrorMessage } from "../../utils/error";
import { WEEK_DAYS } from "../../constants";

const labelFor = (tok) => WEEK_DAYS.find((d) => d.value === tok)?.label || tok;
const daysLabel = (arr) => (arr && arr.length ? arr.map(labelFor).join(", ") : "Not set");

function breaksLabel(breaks) {
  if (!breaks || breaks.length === 0) return "—";
  return breaks.map((b) => `${b.label ? b.label + " " : ""}${b.startTime}–${b.endTime}`).join(", ");
}

function StatusTag({ onBreak, available }) {
  // "Available" = bookable (has open slots in the next 7 days). "On break" is the only
  // real-time state we surface; otherwise fall back to bookability.
  const m = onBreak
    ? { cls: "badge-pending", label: "On break" }
    : available
    ? { cls: "badge-active", label: "Available" }
    : { cls: "badge-cancelled", label: "Unavailable" };
  return <span className={`badge ${m.cls}`}>{m.label}</span>;
}

function Rating({ avg, count }) {
  if (avg == null || count === 0) return <span className="muted">No ratings</span>;
  return <span title={`${count} rating${count === 1 ? "" : "s"}`}>★ {Number(avg).toFixed(1)} <span className="muted">({count})</span></span>;
}

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listDoctors(), getSpecializations()])
      .then(([dRes, sRes]) => {
        setDoctors(dRes.data || []);
        setSpecs((sRes.data || []).map((s) => s.name));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return doctors.filter((d) => {
      if (spec && d.specialization !== spec) return false;
      if (!term) return true;
      return [d.doctorName, d.hospitalName, d.specialization, d.hospitalCity]
        .filter(Boolean).some((x) => x.toLowerCase().includes(term));
    });
  }, [doctors, q, spec]);

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Administrator</p>
          <h1>Doctors</h1>
          <p className="sub">Schedules and timings for every doctor across all hospitals.</p>
        </div>
        <div className="search-bar">
          <select className="search-mode" value={spec} onChange={(e) => setSpec(e.target.value)}>
            <option value="">All specialties</option>
            {specs.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="input" placeholder="Search doctor, hospital, city" value={q} onChange={(e) => setQ(e.target.value)} />
          {(q || spec) && <button type="button" className="btn btn-outline" onClick={() => { setQ(""); setSpec(""); }}>Clear</button>}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="muted">Loading doctors…</p>
      ) : shown.length === 0 ? (
        <div className="card empty">No doctors found.</div>
      ) : (
        <>
          <p className="muted" style={{ marginBottom: 12 }}>{shown.length} doctor{shown.length === 1 ? "" : "s"}</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Doctor</th><th>Hospital</th><th>Working days</th><th>Hours</th><th>Breaks</th><th>Status</th><th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((d) => (
                  <tr key={d.doctorId}>
                    <td>
                      <strong>Dr. {d.doctorName}</strong>
                      <br /><span className="muted">{d.specialization}</span>
                    </td>
                    <td>
                      {d.hospitalName}
                      {d.hospitalCity ? <><br /><span className="muted">{d.hospitalCity}</span></> : null}
                    </td>
                    <td>{daysLabel(d.workingDays)}</td>
                    <td>{d.startTime && d.endTime ? `${d.startTime}–${d.endTime}` : <span className="muted">Not set</span>}</td>
                    <td>{breaksLabel(d.breaks)}</td>
                    <td><StatusTag onBreak={d.onBreakNow} available={d.available} /></td>
                    <td><Rating avg={d.averageRating} count={d.ratingCount} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
