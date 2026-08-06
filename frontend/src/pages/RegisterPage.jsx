import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Panel from '../components/Panel';

const ROLES = [
  { value: 'researcher', label: 'Researcher' },
  { value: 'startup_founder', label: 'Startup Founder' },
  { value: 'innovation_manager', label: 'Innovation Manager' },
  { value: 'administrator', label: 'Administrator' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'researcher' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="page-eyebrow">Research & Innovation Intelligence</div>
        <h1 className="page-title" style={{ marginBottom: 24 }}>Create account</h1>

        <Panel>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="full_name">Full name</label>
            <input id="full_name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />

            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />

            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={6} />

            <label>Role</label>
            <div className="chip-select">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  className={form.role === r.value ? 'selected' : ''}
                  onClick={() => update('role', r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button className="btn" type="submit" disabled={busy} style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
              {busy ? 'Creating…' : 'Create account'}
            </button>
          </form>
        </Panel>

        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 18, textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--gold)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
