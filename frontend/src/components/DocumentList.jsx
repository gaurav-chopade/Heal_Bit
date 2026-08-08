import { useEffect, useState } from "react";
import Icon from "./icons";
import Modal from "./Modal";
import { getBlobErrorMessage } from "../utils/error";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
function extLabel(name = "") {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toUpperCase().slice(0, 4) : "FILE";
}
const isPdf = (doc) =>
  doc.contentType === "application/pdf" || (doc.name || "").toLowerCase().endsWith(".pdf");

/**
 * Grid of documents with image thumbnails, in-app preview (images and PDFs), download,
 * and an optional delete. `fetchBlob(id)` returns an axios response whose data is a Blob.
 */
export default function DocumentList({ docs, fetchBlob, onDelete }) {
  const [preview, setPreview] = useState(null); // { url, name, pdf }
  const [error, setError] = useState("");

  // Release the object URL when the preview closes.
  const closePreview = () => {
    if (preview?.revoke) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  return (
    <>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="doc-grid">
        {docs.map((doc) => (
          <DocumentCard
            key={doc.documentId}
            doc={doc}
            fetchBlob={fetchBlob}
            onDelete={onDelete}
            onPreview={setPreview}
            onError={setError}
          />
        ))}
      </div>

      <Modal
        open={!!preview}
        onClose={closePreview}
        title={preview?.name || "Preview"}
        size={preview?.pdf ? "lg" : undefined}
      >
        {preview && (preview.pdf ? (
          <>
            <iframe className="doc-preview-frame" src={preview.url} title={preview.name} />
            <div className="actions mt-2">
              <a className="btn btn-outline btn-sm" href={preview.url} target="_blank" rel="noreferrer">
                Open in a new tab
              </a>
            </div>
          </>
        ) : (
          <img src={preview.url} alt={preview.name} style={{ width: "100%", borderRadius: 10 }} />
        ))}
      </Modal>
    </>
  );
}

function DocumentCard({ doc, fetchBlob, onDelete, onPreview, onError }) {
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
    onError("");
    try {
      if (doc.image) {
        // Reuse the thumbnail blob when we already have it.
        if (thumb) return onPreview({ url: thumb, name: doc.name, pdf: false, revoke: false });
        return onPreview({ url: await makeUrl(), name: doc.name, pdf: false, revoke: true });
      }
      if (isPdf(doc)) {
        // Shown in-app: opening a blob in a new tab after an await gets blocked as a popup.
        return onPreview({ url: await makeUrl(), name: doc.name, pdf: true, revoke: true });
      }
      // Word/text files can't be previewed in the browser — hand them over as a download.
      await download();
    } catch (err) {
      onError(await getBlobErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    setBusy(true);
    onError("");
    let url;
    try {
      const reuse = doc.image && thumb;
      url = reuse ? thumb : await makeUrl();
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (!reuse) setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      onError(await getBlobErrorMessage(err));
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
