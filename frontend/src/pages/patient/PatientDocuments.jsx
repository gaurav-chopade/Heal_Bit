import { useEffect, useRef, useState } from "react";
import { listDocuments, uploadDocument, getDocumentBlob, deleteDocument } from "../../api/documentApi";
import { getErrorMessage } from "../../utils/error";
import Icon from "../../components/icons";
import DocumentList from "../../components/DocumentList";

const MAX_MB = 10;
const ACCEPTED = [
  "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/bmp",
  "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain",
];

export default function PatientDocuments() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await listDocuments();
      setDocs(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const pickFile = () => inputRef.current?.click();

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    const isAllowed = ACCEPTED.includes(file.type) || file.type.startsWith("image/");
    if (!isAllowed) return setError("Unsupported file type. Allowed: images, PDF, Word documents, and text files.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`File is too large. The maximum size is ${MAX_MB} MB.`);

    setUploading(true);
    setProgress(0);
    try {
      await uploadDocument(file, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.name}"?`)) return;
    try {
      await deleteDocument(doc.documentId);
      setDocs((d) => d.filter((x) => x.documentId !== doc.documentId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Patient</p>
          <h1>My documents</h1>
          <p className="sub">Upload and keep your medical records, prescriptions, and reports (up to {MAX_MB} MB each).</p>
        </div>
        <button className="btn btn-primary" onClick={pickFile} disabled={uploading}>
          <Icon name="upload" size={17} /> {uploading ? "Uploading…" : "Upload file"}
        </button>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".png,.jpg,.jpeg,.gif,.webp,.bmp,.pdf,.doc,.docx,.txt,image/*,application/pdf,application/msword,text/plain"
          onChange={onFile}
        />
      </div>

      {uploading && (
        <div className="upload-progress"><div className="upload-progress-bar" style={{ width: `${progress}%` }} /></div>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : docs.length === 0 ? (
        <div className="card empty">No documents yet. Click <strong>Upload file</strong> to add your first record.</div>
      ) : (
        <DocumentList docs={docs} fetchBlob={getDocumentBlob} onDelete={onDelete} />
      )}
    </div>
  );
}
