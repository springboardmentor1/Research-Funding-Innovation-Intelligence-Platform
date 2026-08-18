import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Zap, Sparkles, ArrowRight, CheckCircle, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';

const FEATURES = [
  'AI-powered funding recommendations',
  'Publication trend analytics',
  'Research intelligence dashboard',
];

export default function Register() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm]       = useState({ username: '', email: '', password: '', confirmPassword: '', role: 'RESEARCHER' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const pwdStrength = form.password.length >= 10 ? 'strong' : form.password.length >= 6 ? 'medium' : form.password.length > 0 ? 'weak' : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await client.post('/auth/register', {
        username: form.username,
        email:    form.email,
        password: form.password,
        role:     form.role,
      });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.detail || 'Registration failed.');
      } else if (err.request) {
        setError('Cannot connect to server. Please make sure the backend is running on port 8000.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await client.post('/auth/google', {
        token: credentialResponse.credential
      });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Successfully logged in with Google!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Google authentication failed.');
    }
  };

  return (
    <div className="auth-page">
      {/* Theme toggle */}
      <button
        className="theme-toggle-btn theme-toggle-auth"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        id="theme-toggle-register"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <div className="auth-card" style={{ animation: 'fadeInUp 0.6s ease', maxWidth: '460px' }}>
        <div className="auth-logo">
          <div className="logo-mark">
            <Zap size={30} color="white" />
          </div>
          <h1>Create Account</h1>
          <p>Join the AI Research Funding Platform</p>
        </div>

        {/* Features */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {FEATURES.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <CheckCircle size={13} style={{ color: 'var(--accent-success)', flexShrink: 0 }} />
              {f}
            </div>
          ))}
        </div>

        {error && (
          <div className="alert alert-error" id="register-error">⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              name="username"
              type="text"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-role">Role</label>
            <select
              id="reg-role"
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <option value="RESEARCHER">Researcher</option>
              <option value="STARTUP_FOUNDER">Startup Founder</option>
              <option value="INNOVATION_MANAGER">Innovation Manager</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute', right: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center'
                }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pwdStrength && (
              <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ flex: 1, height: 3, borderRadius: 100, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{
                    width: pwdStrength === 'strong' ? '100%' : pwdStrength === 'medium' ? '60%' : '30%',
                    height: '100%', borderRadius: 100, transition: 'all 0.3s ease',
                    background: pwdStrength === 'strong' ? 'var(--gradient-success)' : pwdStrength === 'medium' ? 'var(--gradient-funding)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  }} />
                </div>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
                  color: pwdStrength === 'strong' ? '#34d399' : pwdStrength === 'medium' ? '#fbbf24' : '#f87171',
                }}>{pwdStrength}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              name="confirmPassword"
              type="password"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: '0.5rem', height: '48px', fontSize: '0.95rem' }}
          >
            {loading ? <span className="loading-spinner" /> : <UserPlus size={18} />}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">
          <span>Already a member?</span>
        </div>

        <Link to="/login" className="btn btn-secondary btn-full" style={{ gap: '0.5rem' }}>
          Sign In <ArrowRight size={15} />
        </Link>
        
        <div className="auth-divider" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <span>OR</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign in failed')}
            useOneTap
          />
        </div>
      </div>
    </div>
  );
}
