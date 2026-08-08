import api from "./axiosClient";

// Create a Razorpay order for one of the patient's appointments.
export const createPaymentOrder = (appointmentId) =>
  api.post(`/payments/appointments/${appointmentId}/order`);

// Verify the checkout result server-side (marks the appointment PAID if the signature is valid).
export const verifyPayment = (appointmentId, data) =>
  api.post(`/payments/appointments/${appointmentId}/verify`, data);
