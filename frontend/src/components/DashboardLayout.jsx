import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import Icon from "./icons";

// Chrome for all authenticated areas: a persistent sidebar + a slim mobile top bar.
export default function DashboardLayout() {
  const { auth, ready } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!ready) return null;
  if (!auth?.token) return <Navigate to="/" replace state={{ from: location.pathname }} />;

  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="app-content">
        <div className="mobile-topbar">
          <button className="icon-btn" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Icon name="menu" size={22} />
          </button>
          <span className="mobile-brand">Heal<span className="dot">·</span>Bit</span>
        </div>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
