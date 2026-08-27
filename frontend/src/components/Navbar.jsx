import React from 'react';
import { Sparkles, User, Database, LogOut, LayoutDashboard, History, Briefcase } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <nav style={{
      display: 'flex',
      flexDirection: 'column',
      width: '280px',
      height: '100vh',
      padding: '2rem 1.5rem',
      background: 'rgba(11, 14, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '2.5rem' }} onClick={() => setActiveTab('dashboard')}>
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
            Innovation Intelligence
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'dashboard' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'dashboard' ? '#818CF8' : '#9CA3AF',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%',
            justifyContent: 'flex-start'
          }}
        >
          <LayoutDashboard size={18} />
          Intelligence Dashboard
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'profile' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'profile' ? '#818CF8' : '#9CA3AF',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%',
            justifyContent: 'flex-start'
          }}
        >
          <User size={18} />
          Research Profile
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'history' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'history' ? '#818CF8' : '#9CA3AF',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%',
            justifyContent: 'flex-start'
          }}
        >
          <History size={18} />
          Research History
        </button>

        <button
          onClick={() => setActiveTab('research')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'research' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'research' ? '#818CF8' : '#9CA3AF',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%',
            justifyContent: 'flex-start'
          }}
        >
          <Database size={18} />
          Intelligence Datasets
        </button>

        <button
          onClick={() => setActiveTab('patents')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'patents' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'patents' ? '#818CF8' : '#9CA3AF',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%',
            justifyContent: 'flex-start'
          }}
        >
          <Briefcase size={18} />
          Patent Landscape
        </button>
      </div>

      {user ? (
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <div style={{ textAlign: 'left', overflow: 'hidden' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user.full_name}
            </div>
            <span className="badge badge-indigo" style={{
              fontSize: '0.7rem',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#A5B4FC',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginTop: '0.25rem'
            }}>
              {user.role}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="btn-secondary"
            style={{
              padding: '0.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              color: '#F87171',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : null}
    </nav>
  );
}
