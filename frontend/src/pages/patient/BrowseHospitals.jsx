import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { browseHospitals } from "../../api/hospitalApi";
import { getErrorMessage } from "../../utils/error";
import Icon from "../../components/icons";
import Pagination from "../../components/Pagination";
import StarRating from "../../components/StarRating";

const PAGE_SIZE = 5;

export default function BrowseHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [meta, setMeta] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  const [mode, setMode] = useState("city"); // city | pincode | name
  const [q, setQ] = useState("");
  const [activeQuery, setActiveQuery] = useState({}); // query in effect (drives page changes)
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (query, page) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await browseHospitals({ ...query, page, size: PAGE_SIZE });
      setHospitals(data.content || []);
      setMeta({ page: data.page, totalPages: data.totalPages, totalElements: data.totalElements });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load({}, 0); }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const query = q ? { [mode]: q } : {};
    setActiveQuery(query);
    load(query, 0);
  };

  const clear = () => {
    setQ("");
    setActiveQuery({});
    load({}, 0);
  };

  const goToPage = (p) => load(activeQuery, p);

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Patient</p>
          <h1>Find hospitals</h1>
          {meta.totalElements > 0 && (
            <p className="sub">{meta.totalElements} hospital{meta.totalElements === 1 ? "" : "s"} found</p>
          )}
        </div>
        <form onSubmit={onSearch} className="search-bar">
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="search-mode">
            <option value="city">City</option>
            <option value="pincode">Pincode</option>
            <option value="name">Name</option>
          </select>
          <input
            className="input"
            placeholder={mode === "pincode" ? "e.g. 411001" : mode === "name" ? "Hospital name" : "e.g. Pune"}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            inputMode={mode === "pincode" ? "numeric" : "text"}
          />
          <button className="btn btn-primary">Search</button>
          {q && <button type="button" className="btn btn-outline" onClick={clear}>Clear</button>}
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="muted">Loading hospitals…</p>
      ) : hospitals.length === 0 ? (
        <div className="card empty">No hospitals found. Try a different {mode}.</div>
      ) : (
        <>
          <div className="grid grid-2">
            {hospitals.map((h) => (
              <div key={h.hospitalId} className="card hospital-card">
                <div className="hospital-thumb">
                  {h.imageUrl
                    ? <img src={h.imageUrl} alt={h.hospitalName} />
                    : <span className="hospital-thumb-fallback"><Icon name="hospital" size={30} /></span>}
                </div>
                <div className="flex-between">
                  <h3>{h.hospitalName}</h3>
                  <span className="badge badge-active">Active</span>
                </div>
                <p className="muted mt-2">
                  <Icon name="pin" size={15} />{" "}
                  {[h.city, h.state].filter(Boolean).join(", ") || "Location not specified"}
                  {h.pincode ? ` · ${h.pincode}` : ""}
                </p>
                {h.description && <p className="mt-2">{h.description}</p>}
                <div className="mt-2">
                  <StarRating value={h.averageRating || 0} count={h.ratingCount} size={14} />
                </div>
                <div className="actions mt-3">
                  <Link to={`/patient/hospitals/${h.hospitalId}`} className="btn btn-primary btn-sm">
                    View doctors &amp; book
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={meta.page} totalPages={meta.totalPages} onChange={goToPage} />
        </>
      )}
    </div>
  );
}
