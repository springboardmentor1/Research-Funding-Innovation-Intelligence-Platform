import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, Star, Cpu, Building2, TrendingUp, Rocket, Sparkles, ChevronRight,
  BarChart3, Brain, Zap, Target, ArrowUpRight, Globe
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, Cell, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import client from '../api/client';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label || payload[0]?.name}</div>
      {payload.map((p, i) => (
        <div key={i} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: p.payload?.fill || p.color }} />
          <span className="tooltip-value">{p.name}: {p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const QuickLink = ({ icon: Icon, label, to, color, navigate }) => (
  <button
    onClick={() => navigate(to)}
    className="card"
    style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
      padding: '1rem 1.25rem', width: '100%', textAlign: 'left',
      border: '1px solid var(--border-color)', background: 'var(--bg-card)',
    }}
  >
    <div style={{
      width: 38, height: 38, borderRadius: 'var(--radius-sm)',
      background: `${color}20`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
    </div>
    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
  </button>
);

export default function InnovationDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    client.get('/innovation/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p>Loading innovation dashboard…</p>
    </div>
  );

  if (!data) return (
    <div className="empty-state">
      <div className="empty-state-icon">⚡</div>
      <h3>Unable to load dashboard</h3>
      <p>Please check that the backend is running.</p>
    </div>
  );

  const summary = data.summary || {};
  const trendData = data.patent_trends || [];
  const techRanking = (data.technology_ranking || []).map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }));
  const emerging = data.emerging_technologies || [];
  const topPatents = data.top_scored_patents || [];
  const scoreDist = (data.score_distribution || []).map((d, i) => ({ ...d, fill: ['#ef4444', '#f59e0b', '#06b6d4', '#8b5cf6', '#10b981'][i] }));
  const commercDist = data.commercialization_distribution || [];
  const topCommerc = data.top_commercializable || [];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Hero */}
      <div className="intel-hero" style={{ marginBottom: '1.5rem' }}>
        <div className="intel-hero-content">
          <div className="intel-badge">
            <Zap size={12} />
            Innovation Intelligence
          </div>
          <h1>Innovation Dashboard</h1>
          <p>Complete overview of patent analytics, innovation scores, technology trends, and commercialization readiness.</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Patents', value: summary.total_patents, icon: Award, color: '#6366f1' },
          { label: 'Highest Score', value: summary.highest_score, icon: Star, color: '#10b981' },
          { label: 'Top Technology', value: summary.top_technology, icon: Cpu, color: '#8b5cf6', subtitle: `${summary.top_technology_count} patents` },
          { label: 'Top Company', value: summary.top_company, icon: Building2, color: '#06b6d4', subtitle: `${summary.top_company_count} patents` },
        ].map(({ label, value, icon: Icon, color, subtitle }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: `${color}20` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: typeof value === 'string' ? '0.95rem' : undefined }}>{value}</div>
              <div className="stat-label">{label}</div>
              {subtitle && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{subtitle}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Trend + Tech Ranking */}
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1.2fr 1fr', marginBottom: '1.5rem' }}>
        {/* Patent Trends */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <TrendingUp size={16} style={{ color: '#10b981' }} /> Patent Filing Trends
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="Patents" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Technology Ranking */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <BarChart3 size={16} style={{ color: '#8b5cf6' }} /> Top Technologies
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={techRanking} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
              <YAxis dataKey="technology" type="category" width={120} stroke="var(--text-muted)" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Patents" radius={[0, 6, 6, 0]}>
                {techRanking.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Emerging Tech + Score Distribution + Commercialization */}
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '1.5rem' }}>
        {/* Emerging Technologies */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <Zap size={16} style={{ color: '#f59e0b' }} /> Emerging Technologies
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {emerging.slice(0, 5).map((tech, i) => (
              <div key={tech.technology} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${COLORS[i % COLORS.length]}`,
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{tech.technology}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{tech.total_count} patents</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ArrowUpRight size={14} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: tech.growth_rate >= 30 ? '#10b981' : '#f59e0b' }}>
                    +{tech.growth_rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score Distribution */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <Target size={16} style={{ color: '#6366f1' }} /> Score Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="range" stroke="var(--text-muted)" fontSize={10} />
              <YAxis stroke="var(--text-muted)" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Patents" radius={[6, 6, 0, 0]}>
                {scoreDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Commercialization Pie */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <Rocket size={16} style={{ color: '#10b981' }} /> Commercialization
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={commercDist} dataKey="count" nameKey="action" cx="50%" cy="50%" outerRadius={85} label={({ action, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {commercDist.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Top Scored Patents + Quick Links */}
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1.5fr 1fr', marginBottom: '1.5rem' }}>
        {/* Top Scored Patents */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <Star size={16} style={{ color: '#10b981' }} /> Top Innovation-Scored Patents
          </h3>
          {topPatents.map((p, i) => (
            <div key={p.patent_id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.65rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span className="badge badge-purple" style={{ minWidth: 28, textAlign: 'center' }}>#{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {p.technology} · {p.assignee} · {p.year}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Outfit', color: p.innovation_score >= 80 ? '#10b981' : '#6366f1' }}>
                  {p.innovation_score}
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Navigation */}
        <div>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} /> Explore Innovation
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <QuickLink icon={BarChart3} label="Patent Landscape Analysis" to="/patent-analytics" color="#6366f1" navigate={navigate} />
            <QuickLink icon={Brain} label="Technology Intelligence" to="/technology-intelligence" color="#8b5cf6" navigate={navigate} />
            <QuickLink icon={Star} label="Innovation Scoring" to="/innovation-scoring" color="#10b981" navigate={navigate} />
            <QuickLink icon={Award} label="Patent Search" to="/patents" color="#06b6d4" navigate={navigate} />
            <QuickLink icon={Globe} label="Research Intelligence" to="/research-intelligence" color="#f59e0b" navigate={navigate} />
          </div>

          {/* Top Commercializable */}
          {topCommerc.length > 0 && (
            <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Rocket size={14} style={{ color: '#10b981' }} /> Ready to Commercialize
              </h4>
              {topCommerc.slice(0, 3).map(p => (
                <div key={p.patent_id} style={{ fontSize: '0.78rem', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{p.technology} · Score: <span style={{ color: '#10b981', fontWeight: 700 }}>{p.innovation_score}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
