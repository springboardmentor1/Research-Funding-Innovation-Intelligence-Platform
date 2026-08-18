import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Zap, Sparkles, ArrowRight, Shield, Brain, TrendingUp, Target, BarChart3, Globe, Lock, ChevronRight, Sun, Moon, UserX, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import client from '../api/client';
import { useTheme } from '../context/ThemeContext';

const FEATURES = [
  { icon: Brain, title: 'AI-Powered Insights', desc: 'Smart funding recommendations tailored to your research profile' },
  { icon: TrendingUp, title: 'Publication Trends', desc: 'Track emerging topics and citation trends in real-time' },
  { icon: Target, title: 'Grant Matching', desc: 'Multi-criteria scoring finds your perfect funding match' },
  { icon: BarChart3, title: 'Research Analytics', desc: 'Interactive dashboards with deep intelligence metrics' },
];

const TYPING_TEXTS = [
  'Discovering funding opportunities...',
  'Analyzing research trends...',
  'Matching grants to your profile...',
  'Powering innovation with AI...',
];

export default function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm]       = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [errorType, setErrorType] = useState(''); // 'not-registered' | 'wrong-password' | 'generic'
  const [showPwd, setShowPwd] = useState(false);
  const [typingIdx, setTypingIdx] = useState(0);
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingIdx(prev => (prev + 1) % TYPING_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorType('');
    if (!form.username || !form.password) {
      setError('Please fill in all fields.');
      setErrorType('generic');
      return;
    }
    setLoading(true);
    try {
      const { data } = await client.post('/auth/login', form);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.username}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || 'Login failed. Please try again.';

      if (status === 404) {
        setErrorType('not-registered');
      } else if (status === 401) {
        setErrorType('wrong-password');
      } else {
        setErrorType('generic');
      }
      setError(detail);
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
      setErrorType('generic');
    }
  };

  const getErrorIcon = () => {
    if (errorType === 'not-registered') return <UserX size={16} className="error-type-icon" />;
    if (errorType === 'wrong-password') return <AlertTriangle size={16} className="error-type-icon" />;
    return <div className="error-dot" />;
  };

  return (
    <div className="login-split">
      {/* ── Left Panel: Showcase ────────────────────────────────── */}
      <div className="login-showcase">
        {/* Animated background elements */}
        <div className="showcase-bg">
          <div className="mesh-gradient" />
          <div className="orbit-ring orbit-ring-1" />
          <div className="orbit-ring orbit-ring-2" />
          <div className="orbit-ring orbit-ring-3" />
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 6}s`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
              }}
            />
          ))}
          <div className="grid-overlay" />
        </div>

        <div className="showcase-content">
          {/* Logo */}
          <div className="showcase-logo">
            <div className="showcase-logo-mark">
              <Zap size={28} color="white" />
              <div className="logo-pulse" />
            </div>
            <span className="showcase-logo-text">AI Research Platform</span>
          </div>

          {/* Hero text */}
          <div className="showcase-hero">
            <h1>
              Unlock the Future of
              <span className="gradient-text"> Research Intelligence</span>
            </h1>
            <div className="typing-container">
              <Sparkles size={14} className="typing-icon" />
              <span className="typing-text" key={typingIdx}>
                {TYPING_TEXTS[typingIdx]}
              </span>
            </div>
          </div>

          {/* Feature cards */}
          <div className="showcase-features">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="feature-card"
                style={{ animationDelay: `${0.8 + i * 0.15}s` }}
              >
                <div className="feature-icon">
                  <Icon size={18} />
                </div>
                <div>
                  <div className="feature-title">{title}</div>
                  <div className="feature-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div className="showcase-stats">
            <div className="showcase-stat">
              <span className="stat-num">139+</span>
              <span className="stat-lbl">Papers Analyzed</span>
            </div>
            <div className="showcase-stat-divider" />
            <div className="showcase-stat">
              <span className="stat-num">30+</span>
              <span className="stat-lbl">Funding Grants</span>
            </div>
            <div className="showcase-stat-divider" />
            <div className="showcase-stat">
              <span className="stat-num">8</span>
              <span className="stat-lbl">Research Domains</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ─────────────────────────────── */}
      <div className="login-form-panel">
        {/* Theme toggle */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          id="theme-toggle-login"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Subtle background effects */}
        <div className="form-panel-orb form-panel-orb-1" />
        <div className="form-panel-orb form-panel-orb-2" />

        <div className="login-form-container">
          {/* Header */}
          <div className="login-form-header">
            <div className="welcome-badge">
              <Shield size={11} />
              Secure Access
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to your research intelligence dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div className={`login-error ${errorType === 'not-registered' ? 'login-error-notfound' : ''} ${errorType === 'wrong-password' ? 'login-error-unauthorized' : ''}`} id="login-error">
              {getErrorIcon()}
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} id="login-form" className="premium-form">
            <div className={`premium-input-group ${focusedField === 'username' ? 'focused' : ''} ${form.username ? 'filled' : ''}`}>
              <label htmlFor="login-username">Username or Email</label>
              <div className="premium-input-wrapper">
                <Globe size={16} className="input-icon" />
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  placeholder="Enter your username or email"
                  value={form.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField('')}
                  autoComplete="username"
                />
                <div className="input-glow" />
              </div>
            </div>

            <div className={`premium-input-group ${focusedField === 'password' ? 'focused' : ''} ${form.password ? 'filled' : ''}`}>
              <label htmlFor="login-password">Password</label>
              <div className="premium-input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="login-password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  className="pwd-toggle"
                  onClick={() => setShowPwd(!showPwd)}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <div className="input-glow" />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="login-btn-premium"
              disabled={loading}
            >
              <span className="btn-bg" />
              <span className="btn-content">
                {loading ? (
                  <>
                    <span className="loading-spinner" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                    <ChevronRight size={16} className="btn-arrow" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <div className="divider-line" />
            <span>OR</span>
            <div className="divider-line" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Google sign in failed');
                setErrorType('generic');
              }}
              useOneTap
            />
          </div>

          {/* Divider */}
          <div className="login-divider">
            <div className="divider-line" />
            <span>New to the platform?</span>
            <div className="divider-line" />
          </div>

          {/* Register link */}
          <Link to="/register" className="register-link-btn">
            Create an Account
            <ArrowRight size={15} />
          </Link>

          {/* Footer */}
          <div className="login-footer">
            <Globe size={11} />
            <span>Trusted by researchers worldwide</span>
          </div>
        </div>
      </div>
    </div>
  );
}
