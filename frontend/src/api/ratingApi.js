import api from "./axiosClient";

// Patient rates a doctor/hospital (requires a completed appointment). Upserts their own rating.
export const rateDoctor = (doctorId, data) => api.post(`/ratings/doctors/${doctorId}`, data);
export const rateHospital = (hospitalId, data) => api.post(`/ratings/hospitals/${hospitalId}`, data);

// Public: read reviews.
export const getDoctorRatings = (doctorId) => api.get(`/ratings/doctors/${doctorId}`);
export const getHospitalRatings = (hospitalId) => api.get(`/ratings/hospitals/${hospitalId}`);
