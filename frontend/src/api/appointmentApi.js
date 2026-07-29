import api from "./axiosClient";

export const bookAppointment = (data) => api.post("/appointments", data);
export const listAppointments = () => api.get("/appointments");
export const updateAppointmentStatus = (data) => api.put("/appointments/status", data); // { appointmentId, status }
export const cancelAppointment = (id) => api.delete(`/appointments/${id}`);
