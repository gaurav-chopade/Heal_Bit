import api from "./axiosClient";

// params: { hospitalId } for a specific hospital, or { mine: true } for the logged-in hospital
export const listDoctors = (params) => api.get("/doctors", { params });
export const getDoctor = (id) => api.get(`/doctors/${id}`);
export const addDoctor = (data) => api.post("/doctors", data);
export const updateDoctor = (data) => api.put("/doctors", data); // data must include doctorId
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`);

// Free 30-minute slot start times ("HH:mm") for a doctor on a date (yyyy-MM-dd)
export const getSlots = (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } });

// Doctor self-service
export const getMyDoctorProfile = () => api.get("/doctors/me");
export const updateMySchedule = (data) => api.put("/doctors/me/schedule", data);
export const getDoctorDashboard = () => api.get("/doctors/dashboard");
