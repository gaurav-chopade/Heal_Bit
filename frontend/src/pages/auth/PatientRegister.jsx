import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerPatient } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/error";
import { useFormValidation } from "../../hooks/useFormValidation";
import { vName, vEmail, vPassword, vConfirm, vPhone, vAge } from "../../utils/validators";
import PasswordStrength from "../../components/PasswordStrength";
import Recaptcha from "../../components/Recaptcha";

const initial = {
  fullName: "", email: "", password: "", confirmPassword: "",
  phoneNumber: "", age: "", gender: "", address: "", city: "",
};

const validate = (v) => {
  const e = {};
  const put = (k, msg) => { if (msg) e[k] = msg; };
  put("fullName", vName(v.fullName));
  put("email", vEmail(v.email));
  put("password", vPassword(v.password));
  put("confirmPassword", vConfirm(v.confirmPassword, v.password));
  put("phoneNumber", vPhone(v.phoneNumber));
  put("age", vAge(v.age));
  return e;
};

export default function PatientRegister() {
  const { values, errors, field, handleSubmit } = useFormValidation(initial, validate);
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const resetCaptcha = () => { setCaptcha(""); setCaptchaKey((k) => k + 1); };

  const submit = async (v) => {
    setError("");
    setLoading(true);
    try {
      const { confirmPassword, ...rest } = v;
      const { data } = await registerPatient({ ...rest, age: Number(v.age) }, captcha);
      login(data);
      navigate("/patient");
    } catch (err) {
      setError(getErrorMessage(err));
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const cls = (name) => `input${errors[name] ? " input-error" : ""}`;

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <p className="eyebrow">Patient</p>
        <h1>Create your account</h1>

        {error && <div className="alert alert-error mt-3">{error}</div>}

        <form onSubmit={handleSubmit(submit)} className="mt-3" noValidate>
          <div className="field">
            <label>Full name</label>
            <input className={cls("fullName")} {...field("fullName")} />
            {errors.fullName && <p className="err">{errors.fullName}</p>}
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
          <Recaptcha key={captchaKey} onToken={setCaptcha} />
          <button className="btn btn-primary btn-block" disabled={loading || !captcha}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/patient/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
