import { Navigate } from "react-router-dom";
import { useAuth, roleHome } from "../context/AuthContext";

// Wraps public pages (home, login, register). If the user is already signed in,
// they are redirected to their role's dashboard instead of seeing these pages.
export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, role, ready } = useAuth();
  if (!ready) return null; // wait for session rehydration to avoid a flash
  if (isAuthenticated) return <Navigate to={roleHome(role)} replace />;
  return children;
}
