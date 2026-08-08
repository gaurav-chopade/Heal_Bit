import api from "./axiosClient";

export const getProfile = () => api.get("/patients/profile");
export const updateProfile = (data) => api.put("/patients/profile", data);
