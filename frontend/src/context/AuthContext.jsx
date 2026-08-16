// Authentication state, shared across the whole app via React Context.
//
// WHY CONTEXT: without it, the logged-in user object would have to be passed
// down through every component as a prop ("prop drilling"). Context lets any
// component call useAuth() and get { user, login, logout } directly.
//
// This holds the ONE source of truth for "who is logged in". The navbar reads
// it to show the user's name, ProtectedRoute reads it to allow/deny, the login
// page writes it.

import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, try to restore a session. The token lives in memory and is
  // gone after a refresh, so in practice this just resolves to "not logged in"
  // on a fresh page load - which is correct and safe. If you later move the
  // token to an httpOnly cookie, this is where you'd re-validate it.
  useEffect(() => {
    setLoading(false);
  }, []);

  async function login(email, password) {
    // 1. exchange credentials for a token
    const { access_token } = await api.auth.login(email, password);
    // 2. store it so every subsequent request carries it
    setToken(access_token);
    // 3. fetch the user record the token represents
    const me = await api.auth.me();
    setUser(me);
    return me;
  }

  async function register(data) {
    await api.auth.register(data);
    // auto-login after registering so the user isn't asked to type it twice
    return login(data.email, data.password);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  const value = { user, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The hook every component uses. Throwing if used outside the provider turns
// a silent null-reference bug into a clear error at the point of misuse.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
