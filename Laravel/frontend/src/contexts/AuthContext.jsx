import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiJson, setApiOnUnauthorized } from "../api/client";

const STORAGE_TOKEN = "gjj_token";
const STORAGE_USER = "gjj_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!!localStorage.getItem(STORAGE_TOKEN));
  const navigate = useNavigate();

  const logout = useCallback(() => {
    const token = localStorage.getItem(STORAGE_TOKEN);
    if (token) {
      apiRequestLogout().catch(() => {});
    }
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    setApiOnUnauthorized(logout);
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN);
    if (!token) {
      setLoading(false);
      return;
    }
    apiJson("/auth/me")
      .then((res) => {
        const u = res?.data ?? res;
        if (u) {
          setUser(u);
          localStorage.setItem(STORAGE_USER, JSON.stringify(u));
        }
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_TOKEN);
        localStorage.removeItem(STORAGE_USER);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((token, userData) => {
    localStorage.setItem(STORAGE_TOKEN, token);
    const u = userData ?? null;
    setUser(u);
    if (u) localStorage.setItem(STORAGE_USER, JSON.stringify(u));
  }, []);

  const setUserData = useCallback((data) => {
    setUser(data);
    if (data) localStorage.setItem(STORAGE_USER, JSON.stringify(data));
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    setUserData,
    isAuthenticated: !!localStorage.getItem(STORAGE_TOKEN),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function apiRequestLogout() {
  const base = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "") + "/api/v1";
  const token = localStorage.getItem(STORAGE_TOKEN);
  await fetch(`${base}/auth/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
