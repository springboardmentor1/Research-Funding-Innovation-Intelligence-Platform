import { useEffect, useState } from 'react';
import {
  BookOpen, DollarSign, Award, TrendingUp,
  ExternalLink, User, Sparkles
} from 'lucide-react';
import client from '../api/client';

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id) { setLoading(false); return; }
    client.get(`/dashboard/${user.id}`)
      .then(r => setData(r.data))
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p>Loading your dashboard…</p>
    </div>
  );

  const profile = data?.profile;
  const stats   = data?.stats || {};

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Hero */}
      <div className="dashboard-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Research Dashboard</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          Welcome back, {user.username} 👋
        </h1>
        <p style={{ fontSize: '0.9rem' }}>
          {profile
            ? `${profile.name} · ${profile.university} · ${profile.department}`
            : 'Complete your research profile to get personalized recommendations.'}
        </p>
        {profile?.research_area && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {profile.keywords?.split(',').map(k => k.trim()).filter(Boolean).map(k => (
              <span key={k} className="badge badge-purple">{k}</span>
            ))}
          </div>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <BookOpen size={22} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <div className="stat-value">{stats.total_papers_saved ?? '—'}</div>
            <div className="stat-label">Papers Saved</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <DollarSign size={22} style={{ color: 'var(--accent-warning)' }} />
          </div>
          <div>
            <div className="stat-value">{data?.funding_opportunities?.length ?? '—'}</div>
            <div className="stat-label">Funding Matches</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)' }}>
            <Award size={22} style={{ color: 'var(--accent-tertiary)' }} />
          </div>
          <div>
            <div className="stat-value">{data?.patents?.length ?? '—'}</div>
            <div className="stat-label">Patents Found</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <TrendingUp size={22} style={{ color: 'var(--accent-success)' }} />
          </div>
          <div>
            <div className="stat-value">{stats.total_users ?? '—'}</div>
            <div className="stat-label">Platform Users</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Recent Papers */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📄 Recent Papers</span>
            <span className="badge badge-purple">{data?.recent_papers?.length ?? 0}</span>
          </div>
          {data?.recent_papers?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.recent_papers.map((p, i) => (
                <div key={i} style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--accent-primary)'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem', lineHeight: 1.4 }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {p.publication_year} · {typeof p.authors === 'string' ? p.authors.split(',')[0] : p.authors?.[0]}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <p>Search for research papers to see them here</p>
            </div>
          )}
        </div>

        {/* Funding */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">💰 Funding Opportunities</span>
            <span className="badge badge-amber">{data?.funding_opportunities?.length ?? 0}</span>
          </div>
          {data?.funding_opportunities?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.funding_opportunities.slice(0, 5).map((f, i) => (
                <div key={i} style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--accent-warning)'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                    {f.Grant}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-green">{f.Amount}</span>
                    <span className="badge badge-cyan">{f.Organization}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💸</div>
              <p>Funding opportunities will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
