import { createContext, useState, useCallback } from "react";
import client, { setAuthToken } from "../api/client";

export const AuthContext = createContext(null);

const ROLES = ["RESEARCHER", "STARTUP_FOUNDER", "INNOVATION_MANAGER", "ADMINISTRATOR"];

export function AuthProvider({ children }) {
  // Token lives in memory only — no localStorage, no XSS risk.
  // Trade-off: user must re-login on page refresh.
  // To fix that, add an HttpOnly refresh-token cookie on the backend.
  const [user, setUser] = useState(null);

  const login = useCallback(async (email, password) => {
    const body = new URLSearchParams({ username: email, password });
    const { data } = await client.post("/auth/login", body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    setAuthToken(data.access_token);
    setUser({ email, role: data.role, token: data.access_token });
  }, []);

  const register = useCallback(async (email, password, fullName, role) => {
    const { data } = await client.post("/auth/register", {
      email,
      password,
      full_name: fullName,
      role,
    });
    setAuthToken(data.access_token);
    setUser({ email, role: data.role, token: data.access_token });
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles) => !!user && roles.includes(user.role),
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, login, register, logout, hasRole, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}
