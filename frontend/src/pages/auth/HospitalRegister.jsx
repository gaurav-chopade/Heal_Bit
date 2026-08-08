import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerHospital } from "../../api/authApi";
import { getErrorMessage } from "../../utils/error";
import { useFormValidation } from "../../hooks/useFormValidation";
import { vRequired, vEmail, vPassword, vConfirm, vPhone, isPincode6 } from "../../utils/validators";
import PasswordStrength from "../../components/PasswordStrength";
import ImagePicker from "../../components/ImagePicker";
import Recaptcha from "../../components/Recaptcha";

const initial = {
  hospitalName: "", email: "", password: "", confirmPassword: "",
  phone: "", address: "", city: "", state: "", pincode: "", description: "", image: "",
};

const validate = (v) => {
  const e = {};
  const put = (k, msg) => { if (msg) e[k] = msg; };
  put("hospitalName", vRequired(v.hospitalName, "Hospital name"));
  put("email", vEmail(v.email));
  put("password", vPassword(v.password));
  put("confirmPassword", vConfirm(v.confirmPassword, v.password));
  put("phone", vPhone(v.phone));
  if (v.pincode && !isPincode6(v.pincode)) put("pincode", "Pincode must be exactly 6 digits.");
  return e;
};

export default function HospitalRegister() {
  const { values, errors, field, setValue, handleSubmit } = useFormValidation(initial, validate);
  const [error, setError] = useState("");
  const [regNo, setRegNo] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const navigate = useNavigate();

  const resetCaptcha = () => { setCaptcha(""); setCaptchaKey((k) => k + 1); };

  const submit = async (v) => {
    setError("");
    setLoading(true);
    try {
      const { confirmPassword, ...rest } = v;
      const { data } = await registerHospital(rest, captcha);
      setRegNo(data.registrationNumber || "");
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const cls = (name) => `input${errors[name] ? " input-error" : ""}`;

  if (done) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <p className="eyebrow">Hospital</p>
          <h1>Registration received</h1>
          {regNo && (
            <div className="reg-callout mt-3">
              <span className="reg-callout-label">Your registration number</span>
              <span className="reg-callout-value">{regNo}</span>
            </div>
          )}
          <div className="alert alert-success mt-3">
            Your hospital is now pending administrator approval. You can sign in once it is approved.
          </div>
          <button className="btn btn-primary btn-block" onClick={() => navigate("/hospital/login")}>
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <p className="eyebrow">Hospital</p>
        <h1>Register your hospital</h1>
        <p className="muted mt-2">A registration number is generated for you automatically.</p>

        {error && <div className="alert alert-error mt-3">{error}</div>}

        <form onSubmit={handleSubmit(submit)} className="mt-3" noValidate>
          <div className="field">
            <label>Hospital name</label>
            <input className={cls("hospitalName")} {...field("hospitalName")} />
            {errors.hospitalName && <p className="err">{errors.hospitalName}</p>}
          </div>
          <div className="field">
            <label>Email</label>
            <input className={cls("email")} type="email" {...field("email")} />
            {errors.email && <p className="err">{errors.email}</p>}
          </div>
          <div className="row">
            <div className="field">
              <label>Password</label>
              <input className={cls("password")} type="password" {...field("password")} />
              <PasswordStrength value={values.password} />
              {errors.password && <p className="err">{errors.password}</p>}
            </div>
            <div className="field">
              <label>Confirm password</label>
              <input className={cls("confirmPassword")} type="password" {...field("confirmPassword")} />
              {errors.confirmPassword && <p className="err">{errors.confirmPassword}</p>}
            </div>
          </div>
          <div className="field">
            <label>Phone</label>
            <input className={cls("phone")} {...field("phone")} placeholder="10 digits" />
            {errors.phone && <p className="err">{errors.phone}</p>}
          </div>
          <div className="field">
            <label>Address</label>
            <input className="input" {...field("address")} />
          </div>
          <div className="row">
            <div className="field">
              <label>City</label>
              <input className="input" {...field("city")} />
            </div>
            <div className="field">
              <label>State</label>
              <input className="input" {...field("state")} />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Pincode</label>
              <input className={cls("pincode")} {...field("pincode")} placeholder="6 digits" />
              {errors.pincode && <p className="err">{errors.pincode}</p>}
            </div>
            <div className="field">
              <label>Description</label>
              <input className="input" {...field("description")} />
            </div>
          </div>
          <ImagePicker
            value={values.image}
            onChange={(dataUrl) => setValue("image", dataUrl)}
            onError={(msg) => setError(msg)}
            label="Hospital photo (optional)"
          />
          <Recaptcha key={captchaKey} onToken={setCaptcha} />
          <button className="btn btn-primary btn-block" disabled={loading || !captcha}>
            {loading ? "Submitting…" : "Register hospital"}
          </button>
        </form>

        <p className="auth-switch">
          Already approved? <Link to="/hospital/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
