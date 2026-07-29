import { useEffect, useMemo, useState } from "react";
import { getMyDoctorProfile, updateMySchedule } from "../../api/doctorApi";
import { getErrorMessage } from "../../utils/error";
import { WEEK_DAYS } from "../../constants";
import BreakEditor from "../../components/BreakEditor";
import { doctorStatusTag } from "../../utils/doctorStatus";

function countSlots(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return mins > 0 ? Math.floor(mins / 30) : 0;
}

export default function DoctorSchedule() {
  const [profile, setProfile] = useState(null);
  const [days, setDays] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [fee, setFee] = useState("");
  const [breaks, setBreaks] = useState([]);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyDoctorProfile()
      .then(({ data }) => {
        setProfile(data);
        setDays(data.workingDays || []);
        setStart(data.startTime || "");
        setEnd(data.endTime || "");
        setFee(data.consultationFee ?? "");
        setBreaks(data.breaks || []);
      })
      .catch((e) => setFeedback({ type: "error", msg: getErrorMessage(e) }));
  }, []);

  const toggleDay = (value) =>
    setDays((d) => (d.includes(value) ? d.filter((x) => x !== value) : [...d, value]));

  const slots = useMemo(() => countSlots(start, end), [start, end]);

  const validateBreaks = () => {
    for (const b of breaks) {
      if (!b.startTime || !b.endTime) return "Each break needs a start and end time.";
      if (b.startTime >= b.endTime) return "Each break's start time must be before its end time.";
      if (b.startTime < start || b.endTime > end) return "Break times must fall within your working hours.";
    }
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", msg: "" });
    if (days.length === 0) return setFeedback({ type: "error", msg: "Pick at least one working day." });
    if (!start || !end) return setFeedback({ type: "error", msg: "Set both start and end times." });
    if (start >= end) return setFeedback({ type: "error", msg: "Start time must be before end time." });
    const breakErr = validateBreaks();
    if (breakErr) return setFeedback({ type: "error", msg: breakErr });

    setSaving(true);
    try {
      const { data } = await updateMySchedule({
        workingDays: days,
        startTime: start,
        endTime: end,
        consultationFee: fee === "" ? null : Number(fee),
        breaks,
      });
      setProfile(data);
      setBreaks(data.breaks || []);
      setFeedback({ type: "success", msg: "Schedule saved. Patients can now book your open 30-minute slots." });
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <p className="muted">Loading…</p>;

  const tag = doctorStatusTag(profile);

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Doctor</p>
          <h1>My schedule</h1>
          <p className="sub">Appointments run in fixed 30-minute slots within your working window.</p>
        </div>
        <span className={`avail-tag ${tag.cls}`}>
          <span className="dot-ind" /> {tag.label}
        </span>
      </div>

      {feedback.msg && (
        <div className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}>{feedback.msg}</div>
      )}

      <form onSubmit={onSubmit} className="card" style={{ maxWidth: 620 }}>
        <div className="field">
          <label>Working days</label>
          <div className="day-picker">
            {WEEK_DAYS.map((d) => (
              <button
                type="button"
                key={d.value}
                className={`day-chip${days.includes(d.value) ? " active" : ""}`}
                onClick={() => toggleDay(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>Start time</label>
            <input className="input" type="time" step="1800" value={start} onChange={(e) => setStart(e.target.value)} required />
          </div>
          <div className="field">
            <label>End time</label>
            <input className="input" type="time" step="1800" value={end} onChange={(e) => setEnd(e.target.value)} required />
          </div>
        </div>

        <div className="field">
          <label>Consultation fee (₹)</label>
          <input className="input" type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} />
        </div>

        {slots > 0 && (
          <p className="hint">That’s <strong>{slots}</strong> slots of 30 minutes per working day.</p>
        )}

        <BreakEditor breaks={breaks} onChange={setBreaks} />
        <p className="hint">Patients won’t be able to book slots that fall inside a break, and you’ll show as “On break now” while one is active.</p>

        <div className="actions mt-2">
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save schedule"}</button>
        </div>
      </form>
    </div>
  );
}
