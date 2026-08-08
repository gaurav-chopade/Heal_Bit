import { useEffect, useState } from "react";
import { listMyLeaves, requestLeave } from "../../api/leaveApi";
import { getErrorMessage } from "../../utils/error";

export default function DoctorLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [feedback, setFeedback] = useState({ type: "", msg: "" });
  const today = new Date().toISOString().slice(0, 10);
  const load = () => listMyLeaves().then(({ data }) => setLeaves(data)).catch((e) => setFeedback({ type: "error", msg: getErrorMessage(e) }));
  useEffect(() => { load(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    try {
      await requestLeave(form);
      setForm({ startDate: "", endDate: "", reason: "" });
      setFeedback({ type: "success", msg: "Leave request sent for hospital approval." });
      load();
    } catch (err) { setFeedback({ type: "error", msg: getErrorMessage(err) }); }
  };
  return <div>
    <div className="page-head"><div><p className="eyebrow">Doctor</p><h1>Leave requests</h1><p className="sub">Use the calendar to choose any future leave date range. Leave starts only after hospital approval.</p></div></div>
    {feedback.msg && <div className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}>{feedback.msg}</div>}
    <form className="card" style={{ maxWidth: 620 }} onSubmit={submit}>
      <div className="row">
        <div className="field"><label>Start date</label><input className="input" type="date" min={today} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
        <div className="field"><label>End date</label><input className="input" type="date" min={form.startDate || today} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required /></div>
      </div>
      <div className="field"><label>Reason (optional)</label><textarea className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
      <button className="btn btn-primary">Submit request</button>
    </form>
    <div className="card mt-3"><h3>My requests</h3>{leaves.length === 0 ? <p className="muted">No leave requests yet.</p> : <div className="table-wrap"><table><thead><tr><th>Dates</th><th>Reason</th><th>Status</th></tr></thead><tbody>{leaves.map((l) => <tr key={l.leaveId}><td>{l.startDate} to {l.endDate}</td><td>{l.reason || "—"}</td><td>{l.status}</td></tr>)}</tbody></table></div>}</div>
  </div>;
}
