import { useEffect, useState } from "react";
import Icon from "./icons";
import Modal from "./Modal";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
function extLabel(name = "") {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toUpperCase().slice(0, 4) : "FILE";
}

/**
 * Grid of documents with image thumbnails, view (image lightbox / open in tab), download,
 * and an optional delete. `fetchBlob(id)` returns an axios response whose data is a Blob.
 */
export default function DocumentList({ docs, fetchBlob, onDelete }) {
  const [preview, setPreview] = useState(null); // { url, name }

  return (
    <>
      <div className="doc-grid">
        {docs.map((doc) => (
          <DocumentCard
            key={doc.documentId}
            doc={doc}
            fetchBlob={fetchBlob}
            onDelete={onDelete}
            onPreviewImage={setPreview}
          />
        ))}
      </div>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.name || "Preview"}>
        {preview && <img src={preview.url} alt={preview.name} style={{ width: "100%", borderRadius: 10 }} />}
      </Modal>
    </>
  );
}

function DocumentCard({ doc, fetchBlob, onDelete, onPreviewImage }) {
  const [thumb, setThumb] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let url;
    if (doc.image) {
      fetchBlob(doc.documentId)
        .then(({ data }) => { url = URL.createObjectURL(data); setThumb(url); })
        .catch(() => {});
    }
    return () => { if (url) URL.revokeObjectURL(url); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  const makeUrl = async () => {
    const { data } = await fetchBlob(doc.documentId);
    return URL.createObjectURL(data);
  };

  const view = async () => {
    setBusy(true);
    try {
      if (doc.image && thumb) return onPreviewImage({ url: thumb, name: doc.name });
      const url = await makeUrl();
      if (doc.image) onPreviewImage({ url, name: doc.name });
      else { window.open(url, "_blank", "noopener"); setTimeout(() => URL.revokeObjectURL(url), 60000); }
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    setBusy(true);
    try {
      const url = doc.image && thumb ? thumb : await makeUrl();
      const a = document.createElement("a");
      a.href = url; a.download = doc.name; a.click();
      if (!(doc.image && thumb)) setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="doc-card">
      <button className="doc-thumb" onClick={view} title="View" disabled={busy}>
        {doc.image ? (
          thumb ? <img src={thumb} alt={doc.name} /> : <span className="doc-thumb-icon"><Icon name="image" size={26} /></span>
        ) : (
          <span className="doc-thumb-icon"><Icon name="file" size={26} /><span className="doc-ext">{extLabel(doc.name)}</span></span>
        )}
      </button>
      <div className="doc-meta">
        <div className="doc-name" title={doc.name}>{doc.name}</div>
        <div className="doc-sub">{formatSize(doc.size)} · {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ""}</div>
      </div>
      <div className="doc-actions">
        <button className="icon-btn" onClick={view} title="View" disabled={busy}><Icon name="eye" size={17} /></button>
        <button className="icon-btn" onClick={download} title="Download" disabled={busy}><Icon name="download" size={17} /></button>
        {onDelete && (
          <button className="icon-btn danger" onClick={() => onDelete(doc)} title="Delete"><Icon name="trash" size={17} /></button>
        )}
      </div>
    </div>
  );
}
