import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('rfip_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await client.get('/api/auth/me');
      setUser(res.data);
    } catch {
      localStorage.removeItem('rfip_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  async function login(email, password) {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    const res = await client.post('/api/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    localStorage.setItem('rfip_token', res.data.access_token);
    await loadMe();
  }

  async function register({ email, password, full_name, role }) {
    await client.post('/api/auth/register', { email, password, full_name, role });
    await login(email, password);
  }

  function logout() {
    localStorage.removeItem('rfip_token');
    setUser(null);
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
