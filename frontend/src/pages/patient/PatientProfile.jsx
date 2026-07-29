import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../api/patientApi";
import { getErrorMessage } from "../../utils/error";
import { useFormValidation } from "../../hooks/useFormValidation";
import { vName, vPhone, vAge } from "../../utils/validators";

const initial = { fullName: "", phoneNumber: "", age: "", gender: "", address: "", city: "" };

const validate = (v) => {
  const e = {};
  const put = (k, msg) => { if (msg) e[k] = msg; };
  put("fullName", vName(v.fullName));
  put("phoneNumber", vPhone(v.phoneNumber));
  if (v.age !== "" && v.age != null) put("age", vAge(v.age));
  return e;
};

export default function PatientProfile() {
  const { values, errors, field, reset, handleSubmit } = useFormValidation(initial, validate);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getProfile();
        setEmail(data.email);
        reset({
          fullName: data.fullName || "",
          phoneNumber: data.phoneNumber || "",
          age: data.age ?? "",
          gender: data.gender || "",
          address: data.address || "",
          city: data.city || "",
        });
      } catch (err) {
        setFeedback({ type: "error", msg: getErrorMessage(err) });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (v) => {
    setSaving(true);
    setFeedback({ type: "", msg: "" });
    try {
      await updateProfile({ ...v, age: v.age === "" ? null : Number(v.age) });
      setFeedback({ type: "success", msg: "Profile updated." });
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const cls = (name) => `input${errors[name] ? " input-error" : ""}`;

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Patient</p>
          <h1>My profile</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        {feedback.msg && (
          <div className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}>{feedback.msg}</div>
        )}
        <form onSubmit={handleSubmit(submit)} noValidate>
          <div className="field">
            <label>Email (read-only)</label>
            <input className="input" value={email} disabled />
          </div>
          <div className="field">
            <label>Full name</label>
            <input className={cls("fullName")} {...field("fullName")} />
            {errors.fullName && <p className="err">{errors.fullName}</p>}
          </div>
          <div className="row">
            <div className="field">
              <label>Phone</label>
              <input className={cls("phoneNumber")} {...field("phoneNumber")} placeholder="10 digits" />
              {errors.phoneNumber && <p className="err">{errors.phoneNumber}</p>}
            </div>
            <div className="field">
              <label>Age</label>
              <input className={cls("age")} type="number" {...field("age")} min="1" max="120" />
              {errors.age && <p className="err">{errors.age}</p>}
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Gender</label>
              <select {...field("gender")}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field">
              <label>Address</label>
              <input className="input" {...field("address")} />
            </div>
          </div>
          <div className="field">
            <label>City</label>
            <input className="input" {...field("city")} placeholder="e.g. Pune" />
            <p className="hint">We'll show hospitals in your city first when you browse.</p>
          </div>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
