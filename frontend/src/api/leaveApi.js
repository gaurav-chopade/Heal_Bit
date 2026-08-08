import api from "./axiosClient";

export const requestLeave = (data) => api.post("/doctor-leaves", data);
export const listMyLeaves = () => api.get("/doctor-leaves/mine");
export const listHospitalLeaves = () => api.get("/doctor-leaves");
export const decideLeave = (id, approved) => api.put(`/doctor-leaves/${id}/decision`, { approved });
