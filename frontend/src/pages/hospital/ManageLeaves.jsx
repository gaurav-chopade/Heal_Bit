import { useEffect, useState } from "react";
import { decideLeave, listHospitalLeaves } from "../../api/leaveApi";
import { getErrorMessage } from "../../utils/error";
export default function ManageLeaves() {
  const [leaves, setLeaves] = useState([]); const [feedback, setFeedback] = useState({ type: "", msg: "" });
  const load = () => listHospitalLeaves().then(({ data }) => setLeaves(data)).catch((e) => setFeedback({ type: "error", msg: getErrorMessage(e) })); useEffect(() => { load(); }, []);
  const decide = async (id, approved) => { try { await decideLeave(id, approved); setFeedback({ type: "success", msg: `Leave request ${approved ? "approved" : "rejected"}.` }); load(); } catch (e) { setFeedback({ type: "error", msg: getErrorMessage(e) }); } };
  return <div><div className="page-head"><div><p className="eyebrow">Hospital</p><h1>Leave requests</h1><p className="sub">Leave only takes effect once you approve it.</p></div></div>{feedback.msg && <div className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}>{feedback.msg}</div>}<div className="card table-wrap"><table><thead><tr><th>Doctor</th><th>Dates</th><th>Reason</th><th>Status</th><th></th></tr></thead><tbody>{leaves.length === 0 ? <tr><td colSpan="5" className="muted">No leave requests yet.</td></tr> : leaves.map((l) => <tr key={l.leaveId}><td>{l.doctorName}</td><td>{l.startDate} to {l.endDate}</td><td>{l.reason || "—"}</td><td>{l.status}</td><td>{l.status === "PENDING" && <div className="actions"><button className="btn btn-primary btn-sm" onClick={() => decide(l.leaveId, true)}>Approve</button><button className="btn btn-outline btn-sm" onClick={() => decide(l.leaveId, false)}>Reject</button></div>}</td></tr>)}</tbody></table></div></div>;
}
