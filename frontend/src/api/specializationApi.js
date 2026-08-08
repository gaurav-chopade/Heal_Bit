import api from "./axiosClient";

// Public: dynamic list of specializations for dropdowns (master table, no hardcoded values).
export const getSpecializations = () => api.get("/specializations");

// Admin: manage the specialization master table.
export const adminListSpecializations = () => api.get("/admin/specializations");
export const adminAddSpecialization = (name) => api.post("/admin/specializations", { name });
export const adminUpdateSpecialization = (id, name) => api.put(`/admin/specializations/${id}`, { name });
export const adminDeleteSpecialization = (id) => api.delete(`/admin/specializations/${id}`);
