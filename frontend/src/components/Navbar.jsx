import React from 'react';
import { Sparkles, User, Database, LogOut } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2.5rem',
      background: 'rgba(11, 14, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
        }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#fff' }}>
            Fund<span style={{ color: '#06B6D4', fontWeight: 600 }}>Hive</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Innovation & Funding Intelligence
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'profile' ? '#6366F1' : 'transparent',
            color: activeTab === 'profile' ? '#fff' : '#9CA3AF',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <User size={16} />
          Research Profile
        </button>

        <button
          onClick={() => setActiveTab('research')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'research' ? '#6366F1' : 'transparent',
            color: activeTab === 'research' ? '#fff' : '#9CA3AF',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Database size={16} />
          Intelligence Datasets
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{user.full_name}</div>
              <span className="badge badge-indigo" style={{
                fontSize: '0.7rem',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#A5B4FC',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginTop: '0.15rem'
              }}>
                {user.role}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="btn-secondary"
              style={{
                padding: '0.5rem 0.8rem',
                fontSize: '0.82rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: '#F87171',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
