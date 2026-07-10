import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';
import api from '../services/api';

const ROLES = [
  { id: 'Researcher', label: 'Researcher', desc: 'Discover funding & matching works' },
  { id: 'Startup Founder', label: 'Startup Founder', desc: 'Evaluate IP landscapes & patents' },
  { id: 'Innovation Manager', label: 'Innovation Manager', desc: 'Tech transfer analytics' },
  { id: 'Administrator', label: 'Administrator', desc: 'Manage datasets & ingestion' },
];

export default function Register({ onLoginSuccess, onToggleLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Researcher');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Register User
      await api.post('/auth/register', {
        email,
        full_name: fullName,
        password,
        role,
      });

      // 2. Automate Login
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      localStorage.setItem('auth_token', data.access_token);
      onLoginSuccess({
        user_id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try using another email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      background: '#0B0E17',
      color: '#F3F4F6',
      overflow: 'hidden'
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
        top: '10%',
        left: '20%',
        filter: 'blur(60px)',
        zIndex: 0
      }} />

      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '3rem',
        position: 'relative',
        zIndex: 1,
        borderRadius: '24px',
        background: 'rgba(17, 24, 39, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.2rem',
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={30} color="#fff" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.5rem', color: '#fff' }}>
            Get Started
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.95rem' }}>
            Create your account to access innovation intelligence
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#F87171',
            padding: '0.85rem 1.2rem',
            borderRadius: '12px',
            fontSize: '0.9rem',
            marginBottom: '1.5rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#D1D5DB' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} size={18} />
              <input
                type="text"
                required
                placeholder="Dr. Evelyn Parker"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  borderRadius: '12px',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#D1D5DB' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} size={18} />
              <input
                type="email"
                required
                placeholder="eparker@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  borderRadius: '12px',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#D1D5DB' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} size={18} />
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  borderRadius: '12px',
                  background: 'rgba(31, 41, 55, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#D1D5DB' }}>Your Professional Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {ROLES.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: role === r.id ? '2px solid #6366F1' : '1px solid rgba(255,255,255,0.08)',
                    background: role === r.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(31, 41, 55, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: role === r.id ? '#fff' : '#D1D5DB' }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '0.2rem', lineHeight: '1.2' }}>
                    {r.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.9rem',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
            }}
          >
            {loading ? 'Creating Account...' : 'Register'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#9CA3AF' }}>
          Already have an account?{' '}
          <span
            onClick={onToggleLogin}
            style={{
              color: '#818CF8',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
}
