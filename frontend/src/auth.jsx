import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { STORAGE_KEYS } from "./constants";

const AuthContext = createContext(null);

/** Lightweight JWT expiry check (ported from the old script.js). */
export function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return !payload.exp || payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function readStoredSession() {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    if (!isTokenValid(token)) {
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.user);
      return { token: null, user: null };
    }
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || "{}");
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  const login = useCallback((token, user) => {
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    setSession({ token, user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    sessionStorage.removeItem(STORAGE_KEYS.history);
    setSession({ token: null, user: null });
  }, []);

  const value = useMemo(
    () => ({ ...session, isAuthenticated: !!session.token, login, logout }),
    [session, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
