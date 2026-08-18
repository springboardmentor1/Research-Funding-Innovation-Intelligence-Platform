import { useEffect, useState } from 'react';
import { Brain, TrendingUp, Sparkles, Cpu, ArrowUpRight, ArrowDownRight, Minus, Zap, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import client from '../api/client';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#a78bfa', '#fbbf24'];
const LINE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: p.color }} />
          <span className="tooltip-value">{p.name}: {p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const TrendIcon = ({ trend }) => {
  if (trend === 'rising') return <ArrowUpRight size={16} style={{ color: '#10b981' }} />;
  if (trend === 'declining') return <ArrowDownRight size={16} style={{ color: '#ef4444' }} />;
  return <Minus size={16} style={{ color: '#f59e0b' }} />;
};

export default function TechnologyIntelligence() {
  const [techData, setTechData] = useState(null);
  const [emerging, setEmerging] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ranking');

  useEffect(() => {
    Promise.all([
      client.get('/innovation/technology-intelligence'),
      client.get('/innovation/emerging-technologies?top_n=10'),
    ])
      .then(([tech, em]) => {
        setTechData(tech.data);
        setEmerging(em.data.emerging || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p>Loading technology intelligence…</p>
    </div>
  );

  const technologies = techData?.technologies || [];
  const matrix = techData?.growth_matrix?.matrix || [];
  const topTechs = techData?.growth_matrix?.technologies?.slice(0, 8) || [];

  const tabs = [
    { key: 'ranking', label: 'Technology Ranking', icon: BarChart3 },
    { key: 'emerging', label: 'Emerging Technologies', icon: Zap },
    { key: 'trends', label: 'Growth Trends', icon: TrendingUp },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Hero */}
      <div className="intel-hero" style={{ marginBottom: '1.5rem' }}>
        <div className="intel-hero-content">
          <div className="intel-badge">
            <Brain size={12} />
            Technology Intelligence
          </div>
          <h1>Technology Intelligence Engine</h1>
          <p>Discover top technologies, detect emerging trends, and analyze growth patterns across the patent landscape.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {technologies.slice(0, 4).map((t, i) => (
          <div key={t.technology} className="stat-card">
            <div className="stat-icon" style={{ background: `${COLORS[i]}20` }}>
              <Cpu size={20} style={{ color: COLORS[i] }} />
            </div>
            <div>
              <div className="stat-value">{t.count}</div>
              <div className="stat-label">{t.technology}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`btn ${activeTab === key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(key)}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Technology Ranking */}
      {activeTab === 'ranking' && (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={16} style={{ color: 'var(--accent-primary)' }} /> Patent Count by Technology
            </h3>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={technologies} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                <YAxis dataKey="technology" type="category" width={130} stroke="var(--text-muted)" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Patents" radius={[0, 6, 6, 0]}>
                  {technologies.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-secondary)' }} /> Technology Details
            </h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Technology</th>
                  <th>Patents</th>
                  <th>Share</th>
                  <th>Avg Citations</th>
                  <th>Top Assignee</th>
                </tr>
              </thead>
              <tbody>
                {technologies.map((t, i) => (
                  <tr key={i}>
                    <td><span className="badge badge-purple">{i + 1}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.technology}</td>
                    <td style={{ fontWeight: 700, color: COLORS[i % COLORS.length] }}>{t.count}</td>
                    <td>{t.percentage}%</td>
                    <td>{t.avg_citations}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.top_assignee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Emerging Technologies */}
      {activeTab === 'emerging' && (
        <div>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {emerging.map((tech, i) => (
              <div key={tech.technology} className="rec-card" style={{
                animationDelay: `${i * 0.05}s`,
                borderLeft: `3px solid ${tech.trend === 'rising' ? '#10b981' : tech.trend === 'stable' ? '#f59e0b' : '#ef4444'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div className="rec-title">
                    <Cpu size={15} style={{ display: 'inline', marginRight: 6, color: COLORS[i % COLORS.length], verticalAlign: -3 }} />
                    {tech.technology}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <TrendIcon trend={tech.trend} />
                    <span style={{
                      fontSize: '0.85rem', fontWeight: 700,
                      color: tech.growth_rate >= 30 ? '#10b981' : tech.growth_rate >= 0 ? '#f59e0b' : '#ef4444',
                    }}>
                      {tech.growth_rate > 0 ? '+' : ''}{tech.growth_rate}%
                    </span>
                  </div>
                </div>
                <div className="rec-details" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <div className="rec-detail-item">
                    <span className="rec-detail-label">Early Period</span>
                    <span className="rec-detail-value">{tech.early_count}</span>
                  </div>
                  <div className="rec-detail-item">
                    <span className="rec-detail-label">Recent Period</span>
                    <span className="rec-detail-value" style={{ color: '#10b981' }}>{tech.recent_count}</span>
                  </div>
                  <div className="rec-detail-item">
                    <span className="rec-detail-label">Total</span>
                    <span className="rec-detail-value">{tech.total_count}</span>
                  </div>
                </div>
                {/* Mini sparkline */}
                <div style={{ marginTop: '0.75rem' }}>
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={tech.yearly_data}>
                      <Line type="monotone" dataKey="count" stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Growth Trends Multi-Line */}
      {activeTab === 'trends' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} style={{ color: '#10b981' }} /> Technology Growth Over Time
          </h3>
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={matrix}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {topTechs.map((tech, i) => (
                <Line
                  key={tech}
                  type="monotone"
                  dataKey={tech}
                  name={tech}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
