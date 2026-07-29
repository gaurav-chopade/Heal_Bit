import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../../api/adminApi";
import { getErrorMessage } from "../../utils/error";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 5;

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(users.length / PAGE_SIZE) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [users, page]);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await deleteUser(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Administrator</p>
          <h1>Patients</h1>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : users.length === 0 ? (
        <div className="card empty">No patients registered yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Age</th><th>Gender</th><th></th></tr>
            </thead>
            <tbody>
              {users.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((u) => (
                <tr key={u.patientId}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.phoneNumber}</td>
                  <td>{u.age}</td>
                  <td>{u.gender || "—"}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(u.patientId)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={Math.ceil(users.length / PAGE_SIZE)}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
