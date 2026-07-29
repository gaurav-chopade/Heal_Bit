import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { doctorListPatientDocuments, doctorGetPatientDocumentBlob } from "../../api/documentApi";
import { getErrorMessage } from "../../utils/error";
import DocumentList from "../../components/DocumentList";

export default function DoctorPatientDocuments() {
  const { patientId } = useParams();
  const location = useLocation();
  const patientName = location.state?.patientName;
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    doctorListPatientDocuments(patientId)
      .then(({ data }) => setDocs(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [patientId]);

  const fetchBlob = (id) => doctorGetPatientDocumentBlob(patientId, id);

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Doctor</p>
          <h1>Patient documents{patientName ? ` — ${patientName}` : ""}</h1>
          <p className="sub">Medical records shared by your patient. Read-only.</p>
        </div>
        <Link to="/doctor/appointments" className="btn btn-outline btn-sm">Back to appointments</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : docs.length === 0 ? (
        <div className="card empty">This patient hasn’t uploaded any documents.</div>
      ) : (
        <DocumentList docs={docs} fetchBlob={fetchBlob} />
      )}
    </div>
  );
}
