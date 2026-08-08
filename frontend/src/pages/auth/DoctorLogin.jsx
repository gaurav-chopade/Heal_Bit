import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginDoctor } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/error";
import Recaptcha from "../../components/Recaptcha";

export default function DoctorLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetCaptcha = () => { setCaptcha(""); setCaptchaKey((k) => k + 1); };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await loginDoctor(form, captcha);
      login(data);
      navigate("/doctor");
    } catch (err) {
      setError(getErrorMessage(err));
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <p className="eyebrow">Doctor</p>
        <h1>Welcome back</h1>
        <p className="muted mt-2">Sign in with the credentials your hospital gave you.</p>

        {error && <div className="alert alert-error mt-3">{error}</div>}

        <form onSubmit={onSubmit} className="mt-3">
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={onChange} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={onChange} required />
          </div>
          <Recaptcha key={captchaKey} onToken={setCaptcha} />
          <button className="btn btn-primary btn-block" disabled={loading || !captcha}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          Your account is created by your hospital. Contact them if you can’t sign in.
        </p>
      </div>
    </div>
  );
}
