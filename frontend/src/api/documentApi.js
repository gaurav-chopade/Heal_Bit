import api from "./axiosClient";

// Multipart upload; axios sets the multipart boundary automatically for FormData.
export const uploadDocument = (file, onUploadProgress) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post("/patients/documents", fd, { onUploadProgress });
};

export const listDocuments = () => api.get("/patients/documents");

// Fetch the raw file bytes (auth header is attached by the axios interceptor).
export const getDocumentBlob = (id) => api.get(`/patients/documents/${id}`, { responseType: "blob" });

export const deleteDocument = (id) => api.delete(`/patients/documents/${id}`);

// --- Doctor viewing a patient's documents (only patients they share an appointment with) ---
export const doctorListPatientDocuments = (patientId) => api.get(`/doctors/patients/${patientId}/documents`);
export const doctorGetPatientDocumentBlob = (patientId, id) =>
  api.get(`/doctors/patients/${patientId}/documents/${id}`, { responseType: "blob" });
