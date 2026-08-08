import { useEffect, useState } from "react";
import {
  adminListSpecializations,
  adminAddSpecialization,
  adminUpdateSpecialization,
  adminDeleteSpecialization,
} from "../../api/specializationApi";
import { getErrorMessage } from "../../utils/error";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 12;

export default function ManageSpecializations() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [feedback, setFeedback] = useState({ type: "", msg: "" });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminListSpecializations();
      setItems(data);
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(items.length / PAGE_SIZE) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [items, page]);

  const onAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setFeedback({ type: "", msg: "" });
    try {
      await adminAddSpecialization(newName.trim());
      setNewName("");
      setFeedback({ type: "success", msg: "Specialization added." });
      load();
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.specializationId);
    setEditingName(item.name);
  };

  const saveEdit = async (id) => {
    if (!editingName.trim()) return;
    try {
      await adminUpdateSpecialization(id, editingName.trim());
      setEditingId(null);
      load();
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Remove this specialization? Doctors already using it keep their existing value.")) return;
    try {
      await adminDeleteSpecialization(id);
      load();
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Administrator</p>
          <h1>Specializations</h1>
          <p className="sub">
            Manage the master list of specializations shown in the "Add doctor" dropdown —
            changes here apply platform-wide without touching any frontend code.
          </p>
        </div>
      </div>

      {feedback.msg && (
        <div className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}>{feedback.msg}</div>
      )}

      <div className="card mt-2">
        <h3>Add a specialization</h3>
        <form onSubmit={onAdd} className="row mt-2">
          <div className="field">
            <label>Name</label>
            <input
              className="input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Rheumatology"
              maxLength={100}
            />
          </div>
          <div className="field" style={{ alignSelf: "flex-end" }}>
            <button className="btn btn-primary" disabled={saving || !newName.trim()}>
              {saving ? "Adding…" : "Add"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-3">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : items.length === 0 ? (
          <div className="card empty">No specializations yet. Add the first one above.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th></th></tr>
              </thead>
              <tbody>
                {items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((item) => (
                  <tr key={item.specializationId}>
                    <td>
                      {editingId === item.specializationId ? (
                        <input
                          className="input"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          maxLength={100}
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        {editingId === item.specializationId ? (
                          <>
                            <button className="btn btn-primary btn-sm" onClick={() => saveEdit(item.specializationId)}>Save</button>
                            <button className="btn btn-outline btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-outline btn-sm" onClick={() => startEdit(item)}>Rename</button>
                            <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.specializationId)}>Remove</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={Math.ceil(items.length / PAGE_SIZE)} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
