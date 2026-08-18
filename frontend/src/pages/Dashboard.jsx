import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, DollarSign, Award, TrendingUp, Sparkles, ArrowUpRight,
  Target, BarChart3, Brain, ChevronRight, ExternalLink, Calendar
} from 'lucide-react';
import client from '../api/client';

const QuickLink = ({ icon: Icon, label, to, color, navigate }) => (
  <button
    onClick={() => navigate(to)}
    className="card"
    style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
      padding: '1rem 1.25rem', width: '100%', textAlign: 'left', border: '1px solid var(--border-color)',
      background: 'var(--bg-card)'
    }}
  >
    <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
    </div>
    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
  </button>
);

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

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
      <div className="intel-hero">
        <div className="intel-hero-content">
          <div className="intel-badge">
            <Sparkles size={12} />
            Personal Dashboard
          </div>
          <h1 style={{ fontSize: '2rem' }}>
            Welcome back, {user.username} 👋
          </h1>
          <p style={{ fontSize: '0.95rem', maxWidth: 600 }}>
            {profile
              ? `${profile.name} · ${profile.university} · ${profile.department}`
              : 'Complete your research profile to get personalized AI-powered recommendations.'}
          </p>
          {profile?.research_area && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-green" style={{ padding: '0.3rem 0.7rem' }}>{profile.research_area}</span>
              {profile.keywords?.split(',').map(k => k.trim()).filter(Boolean).slice(0, 4).map(k => (
                <span key={k} className="badge badge-purple" style={{ padding: '0.25rem 0.6rem' }}>{k}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      <div className="stats-grid-5" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { icon: BookOpen, value: stats.total_papers_saved ?? '—', label: 'Papers Saved', color: '#6366f1', cls: 'purple' },
          { icon: DollarSign, value: data?.funding_opportunities?.length ?? '—', label: 'Funding Matches', color: '#f59e0b', cls: 'amber' },
          { icon: Award, value: data?.patents?.length ?? '—', label: 'Patents Found', color: '#06b6d4', cls: 'cyan' },
          { icon: TrendingUp, value: stats.total_users ?? '—', label: 'Platform Users', color: '#10b981', cls: 'green' },
        ].map((s, i) => (
          <div key={i} className={`stat-card-enhanced ${s.cls}`} style={{ animation: `fadeInUp 0.5s ease ${i * 0.06}s backwards` }}>
            <div className="stat-icon-lg" style={{ background: `${s.color}20` }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div className="stat-number">{s.value}</div>
            <div className="stat-title">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Navigation */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>
          🚀 Quick Access
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          <QuickLink icon={BarChart3} label="Research Dashboard" to="/research-dashboard" color="#6366f1" navigate={navigate} />
          <QuickLink icon={Target} label="Grant Recommendations" to="/grant-recommendations" color="#f59e0b" navigate={navigate} />
          <QuickLink icon={TrendingUp} label="Publication Trends" to="/publication-trends" color="#10b981" navigate={navigate} />
          <QuickLink icon={Brain} label="Research Intelligence" to="/research-intelligence" color="#06b6d4" navigate={navigate} />
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {data.recent_papers.map((p, i) => (
                <div key={i} style={{
                  padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                  borderLeft: '3px solid var(--accent-primary)', transition: 'all 0.2s ease',
                }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem', lineHeight: 1.4 }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Calendar size={11} /> {p.publication_year} · {typeof p.authors === 'string' ? p.authors.split(',')[0] : p.authors?.[0]}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {data.funding_opportunities.slice(0, 5).map((f, i) => (
                <div key={i} style={{
                  padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                  borderLeft: '3px solid var(--accent-warning)', transition: 'all 0.2s ease',
                }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {f.Grant}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-green">{f.Amount}</span>
                    <span className="badge badge-cyan">{f.Organization}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon">💸</div>
              <p>Funding opportunities will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
