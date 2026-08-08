import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allow, children }) {
  const { auth, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null; // wait for session rehydration

  if (!auth?.token) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  if (allow && !allow.includes(auth.user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
