import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./icons";

const LINKS = {
  PATIENT: [
    { to: "/patient", label: "Dashboard", icon: "grid", end: true },
    { to: "/patient/hospitals", label: "Find hospitals", icon: "hospital" },
    { to: "/patient/appointments", label: "My appointments", icon: "calendar" },
    { to: "/patient/documents", label: "My documents", icon: "file" },
    { to: "/patient/profile", label: "Profile", icon: "user" },
  ],
  HOSPITAL: [
    { to: "/hospital", label: "Dashboard", icon: "grid", end: true },
    { to: "/hospital/doctors", label: "Doctors", icon: "stethoscope" },
    { to: "/hospital/appointments", label: "Appointments", icon: "calendar" },
    { to: "/hospital/profile", label: "Profile", icon: "hospital" },
  ],
  DOCTOR: [
    { to: "/doctor", label: "Dashboard", icon: "grid", end: true },
    { to: "/doctor/appointments", label: "Appointments", icon: "calendar" },
    { to: "/doctor/schedule", label: "My schedule", icon: "clock" },
  ],
  ADMIN: [
    { to: "/admin", label: "Dashboard", icon: "grid", end: true },
    { to: "/admin/hospitals", label: "Hospitals", icon: "hospital" },
    { to: "/admin/doctors", label: "Doctors", icon: "stethoscope" },
    { to: "/admin/users", label: "Patients", icon: "users" },
    { to: "/admin/specializations", label: "Specializations", icon: "clipboard" },
  ],
};

const ROLE_LABEL = { PATIENT: "Patient", HOSPITAL: "Hospital", DOCTOR: "Doctor", ADMIN: "Administrator" };

export default function Sidebar({ open, onClose }) {
  const { auth, role, logout } = useAuth();
  const navigate = useNavigate();
  const links = (role && LINKS[role]) || [];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <div className={`sidebar-scrim${open ? " show" : ""}`} onClick={onClose} />
      <aside className={`sidebar${open ? " open" : ""}`}>
        <Link to={`/${role?.toLowerCase()}`} className="sidebar-brand" onClick={onClose}>
          <svg className="nav-ecg" viewBox="0 0 52 36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 18 H14 L19 8 L27 28 L33 18 H50" />
          </svg>
          Heal<span className="dot">·</span>Bit
        </Link>

        <div className="sidebar-role">{ROLE_LABEL[role] || "Menu"}</div>

        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="sidebar-link" onClick={onClose}>
              <Icon name={l.icon} size={19} />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <span className="sidebar-avatar">{(auth?.user?.name || "?").charAt(0).toUpperCase()}</span>
            <span className="sidebar-user-meta">
              <strong>{auth?.user?.name}</strong>
              <span>{auth?.user?.email}</span>
            </span>
          </div>
          <button className="btn btn-outline btn-sm btn-block" onClick={handleLogout}>
            <Icon name="logout" size={16} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
