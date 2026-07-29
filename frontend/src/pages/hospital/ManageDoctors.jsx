import { useEffect, useState } from "react";
import { listDoctors, addDoctor, updateDoctor, deleteDoctor } from "../../api/doctorApi";
import { getSpecializations } from "../../api/specializationApi";
import { getErrorMessage } from "../../utils/error";
import { WEEK_DAYS } from "../../constants";
import { vName } from "../../utils/validators";
import Pagination from "../../components/Pagination";
import BreakEditor from "../../components/BreakEditor";
import StarRating from "../../components/StarRating";
import { doctorStatusTag } from "../../utils/doctorStatus";

const PAGE_SIZE = 5;

const empty = {
  doctorId: null, doctorName: "", email: "", password: "", specialization: "",
  qualification: "", experience: "", consultationFee: "",
  workingDays: [], startTime: "", endTime: "", breaks: [],
};

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await listDoctors({ mine: true });
      setDoctors(data);
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    // Specialization list now comes from the database-backed master table, not a hardcoded array.
    getSpecializations()
      .then(({ data }) => setSpecializations(data))
      .catch(() => setSpecializations([]));
  }, []);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(doctors.length / PAGE_SIZE) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [doctors, page]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleDay = (v) =>
    setForm((f) => ({ ...f, workingDays: f.workingDays.includes(v)
      ? f.workingDays.filter((x) => x !== v) : [...f.workingDays, v] }));
  const setBreaks = (breaks) => setForm((f) => ({ ...f, breaks }));

  const startAdd = () => { setForm(empty); setShowForm(true); setFeedback({ type: "", msg: "" }); };
  const startEdit = (d) => {
    setForm({
      doctorId: d.doctorId, doctorName: d.doctorName, email: d.email || "", password: "",
      specialization: d.specialization || "", qualification: d.qualification || "",
      experience: d.experience ?? "", consultationFee: d.consultationFee ?? "",
      workingDays: d.workingDays || [], startTime: d.startTime || "", endTime: d.endTime || "",
      breaks: d.breaks || [],
    });
    setShowForm(true);
    setFeedback({ type: "", msg: "" });
  };

  const validate = () => {
    const nameErr = vName(form.doctorName);
    if (nameErr) return nameErr;
    if (!form.email.trim()) return "Login email is required.";
    if (!form.doctorId && !form.password) return "Set an initial password for the doctor's login.";
    if (form.password && form.password.length < 6) return "Password must be at least 6 characters.";
    if (!form.specialization) return "Please choose a specialization.";
    if (form.experience === "" || Number(form.experience) < 0) return "Enter valid years of experience.";
    if (form.startTime && form.endTime && form.startTime >= form.endTime) return "Start time must be before end time.";
    for (const b of form.breaks) {
      if (!b.startTime || !b.endTime) return "Each break needs a start and end time.";
      if (b.startTime >= b.endTime) return "Each break's start time must be before its end time.";
      if (form.startTime && form.endTime && (b.startTime < form.startTime || b.endTime > form.endTime)) {
        return "Break times must fall within the doctor's working hours.";
      }
    }
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setFeedback({ type: "error", msg: err });

    setSaving(true);
    setFeedback({ type: "", msg: "" });
    const payload = {
      ...form,
      experience: Number(form.experience),
      consultationFee: form.consultationFee === "" ? null : Number(form.consultationFee),
      startTime: form.startTime || null,
      endTime: form.endTime || null,
    };
    try {
      if (form.doctorId) {
        if (!payload.password) delete payload.password; // keep existing password
        await updateDoctor(payload);
        setFeedback({ type: "success", msg: "Doctor updated." });
      } else {
        const { doctorId, ...rest } = payload;
        await addDoctor(rest);
        setFeedback({ type: "success", msg: "Doctor added. They can now sign in at the Doctor login." });
      }
      setShowForm(false);
      load();
    } catch (err2) {
      setFeedback({ type: "error", msg: getErrorMessage(err2) });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Remove this doctor?")) return;
    try {
      await deleteDoctor(id);
      load();
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>Doctors</h1>
        </div>
        {!showForm && <button className="btn btn-primary" onClick={startAdd}>Add doctor</button>}
      </div>

      {feedback.msg && (
        <div className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}>{feedback.msg}</div>
      )}

      {showForm && (
        <div className="card mt-2">
          <h3>{form.doctorId ? "Edit doctor" : "New doctor"}</h3>
          <form onSubmit={onSubmit} className="mt-2">
            <div className="row">
              <div className="field">
                <label>Full name</label>
                <input className="input" name="doctorName" value={form.doctorName} onChange={onChange} required />
              </div>
              <div className="field">
                <label>Specialization</label>
                <select name="specialization" value={form.specialization} onChange={onChange} required>
                  <option value="">Select a specialty</option>
                  {specializations.map((s) => (
                    <option key={s.specializationId} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Login email</label>
                <input className="input" type="email" name="email" value={form.email} onChange={onChange} required />
              </div>
              <div className="field">
                <label>{form.doctorId ? "New password (optional)" : "Initial password"}</label>
                <input className="input" type="password" name="password" value={form.password} onChange={onChange}
                  placeholder={form.doctorId ? "Leave blank to keep current" : "Min 6 characters"} />
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Qualification</label>
                <input className="input" name="qualification" value={form.qualification} onChange={onChange} placeholder="e.g. MBBS, MD" />
              </div>
              <div className="field">
                <label>Experience (years)</label>
                <input className="input" type="number" name="experience" value={form.experience} onChange={onChange} min="0" max="50" required />
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Consultation fee (₹)</label>
                <input className="input" type="number" name="consultationFee" value={form.consultationFee} onChange={onChange} min="0" />
              </div>
              <div className="field" />
            </div>

            <div className="field">
              <label>Working days</label>
              <div className="day-picker">
                {WEEK_DAYS.map((d) => (
                  <button type="button" key={d.value}
                    className={`day-chip${form.workingDays.includes(d.value) ? " active" : ""}`}
                    onClick={() => toggleDay(d.value)}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Start time</label>
                <input className="input" type="time" step="1800" name="startTime" value={form.startTime} onChange={onChange} />
              </div>
              <div className="field">
                <label>End time</label>
                <input className="input" type="time" step="1800" name="endTime" value={form.endTime} onChange={onChange} />
              </div>
            </div>
            <p className="hint">Appointments are booked as fixed 30-minute slots within these hours. If you add a break, the next slot opens up right when the break ends — not at the next half-hour mark.</p>

            <BreakEditor breaks={form.breaks} onChange={setBreaks} />

            <div className="actions mt-2">
              <button className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : form.doctorId ? "Update doctor" : "Add doctor"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-3">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : doctors.length === 0 ? (
          <div className="card empty">No doctors yet. Add your first doctor above.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Specialization</th><th>Experience</th><th>Fee</th><th>Rating</th><th>Schedule</th><th>Availability</th><th></th></tr>
              </thead>
              <tbody>
                {doctors.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((d) => {
                  const tag = doctorStatusTag(d);
                  return (
                    <tr key={d.doctorId}>
                      <td>{d.doctorName}</td>
                      <td>{d.specialization}</td>
                      <td>{d.experience} yrs</td>
                      <td>{d.consultationFee != null ? `₹${d.consultationFee}` : "—"}</td>
                      <td><StarRating value={d.averageRating || 0} count={d.ratingCount} size={13} /></td>
                      <td>
                        {d.workingDays?.length
                          ? <>{d.workingDays.join(", ")}<br /><span className="muted">{d.startTime}–{d.endTime}</span>
                            {d.breaks?.length > 0 && (
                              <><br /><span className="muted">
                                Break: {d.breaks.map((b) => `${b.startTime}–${b.endTime}`).join(", ")}
                              </span></>
                            )}
                          </>
                          : <span className="muted">Not set</span>}
                      </td>
                      <td>
                        <span className={`avail-tag ${tag.cls}`}>
                          <span className="dot-ind" /> {tag.label}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-outline btn-sm" onClick={() => startEdit(d)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => onDelete(d.doctorId)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              page={page}
              totalPages={Math.ceil(doctors.length / PAGE_SIZE)}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
