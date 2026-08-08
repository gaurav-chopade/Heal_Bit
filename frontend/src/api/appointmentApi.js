import api from "./axiosClient";

export const bookAppointment = (data) => api.post("/appointments", data);
export const listAppointments = () => api.get("/appointments");
export const updateAppointmentStatus = (data) => api.put("/appointments/status", data); // { appointmentId, status }
export const cancelAppointment = (id) => api.delete(`/appointments/${id}`);
// Hard-remove an unpaid booking (used when an online payment is abandoned).
export const discardBooking = (id) => api.delete(`/appointments/${id}/discard`);
// Move an existing appointment to another slot with the same doctor.
export const rescheduleAppointment = (id, data) => api.put(`/appointments/${id}/reschedule`, data);
