import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Panel from '../components/Panel';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="page-eyebrow">Research & Innovation Intelligence</div>
        <h1 className="page-title" style={{ marginBottom: 24 }}>Sign in</h1>

        <Panel>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <button className="btn" type="submit" disabled={busy} style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </Panel>

        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 18, textAlign: 'center' }}>
          New here? <Link to="/register" style={{ color: 'var(--gold)' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
