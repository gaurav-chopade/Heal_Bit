import api from "./axiosClient";

// Attaches the reCAPTCHA token as a header the backend verifies (X-Captcha-Token).
const withCaptcha = (captcha) => ({ headers: captcha ? { "X-Captcha-Token": captcha } : {} });

export const registerPatient = (data, captcha) => api.post("/auth/patient/register", data, withCaptcha(captcha));
export const loginPatient = (data, captcha) => api.post("/auth/patient/login", data, withCaptcha(captcha));
export const registerHospital = (data, captcha) => api.post("/auth/hospital/register", data, withCaptcha(captcha));
export const loginHospital = (data, captcha) => api.post("/auth/hospital/login", data, withCaptcha(captcha));
export const loginDoctor = (data, captcha) => api.post("/auth/doctor/login", data, withCaptcha(captcha));
export const loginAdmin = (data, captcha) => api.post("/auth/admin/login", data, withCaptcha(captcha));
