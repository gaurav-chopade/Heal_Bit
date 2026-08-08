import api from "./axiosClient";

// params: { city } | { name } | { pincode } (all optional)
export const browseHospitals = (params) => api.get("/hospitals", { params });
export const getHospital = (id) => api.get(`/hospitals/${id}`);
export const updateHospital = (data) => api.put("/hospitals", data);
export const deleteHospital = () => api.delete("/hospitals");
export const getHospitalDashboard = () => api.get("/hospitals/dashboard");
