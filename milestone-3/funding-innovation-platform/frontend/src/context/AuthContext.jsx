import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((data) => {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const register = useCallback(
    async ({ email, username, fullName, password, role }) => {
      const { data } = await axiosClient.post("/auth/register", {
        email,
        username,
        full_name: fullName,
        password,
        role,
      });
      persistSession(data);
      return data;
    },
    [persistSession]
  );

  const login = useCallback(
    async ({ email, password }) => {
      const { data } = await axiosClient.post("/auth/login", { email, password });
      persistSession(data);
      return data;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    try {
      const { data } = await axiosClient.get("/auth/me");
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      logout();
      throw err;
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      refreshCurrentUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ user, loading, register, login, logout, refreshCurrentUser, isAuthenticated: !!user }),
    [user, loading, register, login, logout, refreshCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
