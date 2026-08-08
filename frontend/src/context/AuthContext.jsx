import { createContext, useContext, useEffect, useState } from "react";
import { isTokenExpired } from "../utils/jwt";

const AuthContext = createContext(null);
const KEY = "healbit_auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [ready, setReady] = useState(false);

  const clearSession = () => {
    localStorage.removeItem(KEY);
    setAuth(null);
  };

  // Rehydrate on first load — but only if the stored token is still valid.
  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.token && !isTokenExpired(parsed.token)) {
          setAuth(parsed);
        } else {
          localStorage.removeItem(KEY); // expired or malformed -> treat as logged out
        }
      } catch {
        localStorage.removeItem(KEY);
      }
    }
    setReady(true);
  }, []);

  // Keep the UI in sync when the token is rejected (axios 401) or another tab logs out.
  useEffect(() => {
    const onLogout = () => clearSession();
    const onStorage = (e) => {
      if (e.key === KEY && !e.newValue) setAuth(null);
    };
    window.addEventListener("healbit:logout", onLogout);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("healbit:logout", onLogout);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // data is the LoginResponse from the backend: { token, userId, name, email, role }
  const login = (data) => {
    const session = {
      token: data.token,
      user: { id: data.userId, name: data.name, email: data.email, role: data.role },
    };
    localStorage.setItem(KEY, JSON.stringify(session));
    setAuth(session);
    return session;
  };

  const logout = () => clearSession();

  const value = {
    auth,
    ready,
    login,
    logout,
    isAuthenticated: !!auth?.token,
    role: auth?.user?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// Where each role should land after signing in.
export function roleHome(role) {
  switch (role) {
    case "PATIENT":
      return "/patient";
    case "HOSPITAL":
      return "/hospital";
    case "DOCTOR":
      return "/doctor";
    case "ADMIN":
      return "/admin";
    default:
      return "/";
  }
}
