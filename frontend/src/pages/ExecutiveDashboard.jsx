import { useState, useEffect } from 'react';
import {
  Sparkles, FileText, DollarSign, Shield, Cpu, TrendingUp,
  Award, Target, Rocket, BarChart3, Loader2, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
  RadialBarChart, RadialBar
} from 'recharts';
import client from '../api/client';

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'
];

const COMMERC_COLORS = {
  'Commercialize': '#10b981',
  'License': '#6366f1',
  'Industry Collaboration': '#f59e0b',
  'Startup Potential': '#06b6d4',
  'Continue Research': '#94a3b8',
};

export default function ExecutiveDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get('/dashboard/executive');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load executive dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Loader2 className="spinner" size={40} />
        <p>Loading Executive Dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <AlertTriangle size={40} />
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboard}>Retry</button>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="executive-dashboard">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={28} style={{ color: '#f59e0b' }} />
            Research Funding & Innovation Intelligence
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Executive Dashboard — Aggregated platform overview
          </p>
        </div>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────────────────── */}
      <div className="exec-cards-grid">
        <SummaryCard
          icon={<FileText size={22} />}
          label="Total Research Papers"
          value={s.total_papers.toLocaleString()}
          accent="#6366f1"
        />
        <SummaryCard
          icon={<DollarSign size={22} />}
          label="Funding Opportunities"
          value={s.total_funding.toLocaleString()}
          accent="#10b981"
        />
        <SummaryCard
          icon={<Shield size={22} />}
          label="Total Patents"
          value={s.total_patents.toLocaleString()}
          accent="#f59e0b"
        />
        <SummaryCard
          icon={<TrendingUp size={22} />}
          label="Top Research Topic"
          value={s.top_research_topic}
          accent="#06b6d4"
          isText
        />
        <SummaryCard
          icon={<Cpu size={22} />}
          label="Top Technology"
          value={s.top_technology}
          accent="#8b5cf6"
          isText
        />
        <SummaryCard
          icon={<Award size={22} />}
          label="Avg Innovation Score"
          value={s.average_innovation_score}
          accent="#ec4899"
          suffix="/ 100"
        />
      </div>

      {/* ── Row 1: Publication Trends + Funding Distribution ──────────────── */}
      <div className="exec-charts-row">
        <div className="chart-card">
          <h3><TrendingUp size={18} /> Publication Trends</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.publication_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Papers"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3><BarChart3 size={18} /> Funding by Research Area</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.funding_by_area} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                <YAxis
                  dataKey="area"
                  type="category"
                  stroke="var(--text-muted)"
                  fontSize={11}
                  width={120}
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="count" name="Opportunities" radius={[0, 6, 6, 0]}>
                  {(data.funding_by_area || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 2: Patent Trends + Emerging Technologies ──────────────────── */}
      <div className="exec-charts-row">
        <div className="chart-card">
          <h3><Shield size={18} /> Patent Trends</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.patent_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Patents"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3><Cpu size={18} /> Emerging Technologies</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(data.emerging_technologies || []).slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis
                  dataKey="technology"
                  stroke="var(--text-muted)"
                  fontSize={10}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="growth_rate" name="Growth Rate %" radius={[6, 6, 0, 0]}>
                  {(data.emerging_technologies || []).slice(0, 8).map((item, i) => (
                    <Cell
                      key={i}
                      fill={item.trend === 'rising' ? '#10b981' : item.trend === 'stable' ? '#f59e0b' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 3: Innovation Score + Commercialization ────────────────────── */}
      <div className="exec-charts-row">
        <div className="chart-card">
          <h3><Award size={18} /> Innovation Score Overview</h3>
          <div className="innovation-score-display">
            <div className="score-gauge">
              <div className="score-circle" style={{
                background: `conic-gradient(
                  #6366f1 0% ${s.average_innovation_score}%,
                  rgba(99,102,241,0.15) ${s.average_innovation_score}% 100%
                )`
              }}>
                <div className="score-inner">
                  <span className="score-value">{s.average_innovation_score}</span>
                  <span className="score-label">AVG</span>
                </div>
              </div>
              <div className="score-meta">
                <div className="score-meta-item">
                  <span className="meta-label">Max Score</span>
                  <span className="meta-value" style={{ color: '#10b981' }}>{s.max_innovation_score}</span>
                </div>
                <div className="score-meta-item">
                  <span className="meta-label">Top Technology</span>
                  <span className="meta-value">{s.top_technology}</span>
                </div>
              </div>
            </div>

            {/* Top Scored Patents mini-table */}
            <div className="mini-table-wrapper" style={{ marginTop: '1rem' }}>
              <table className="exec-mini-table">
                <thead>
                  <tr>
                    <th>Patent</th>
                    <th>Technology</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.top_scored_patents || []).slice(0, 5).map((p, i) => (
                    <tr key={i}>
                      <td className="ellipsis-cell">{p.title}</td>
                      <td><span className="tech-badge">{p.technology}</span></td>
                      <td>
                        <span className={`score-pill ${p.innovation_score >= 80 ? 'high' : p.innovation_score >= 60 ? 'mid' : 'low'}`}>
                          {p.innovation_score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3><Rocket size={18} /> Commercialization Recommendations</h3>
          <div className="commerc-section">
            {/* Distribution Pie */}
            <div className="chart-container" style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.commercialization_distribution}
                    dataKey="count"
                    nameKey="action"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {(data.commercialization_distribution || []).map((entry, i) => (
                      <Cell key={i} fill={COMMERC_COLORS[entry.action] || COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Opportunities table */}
            <table className="exec-mini-table" style={{ marginTop: '0.5rem' }}>
              <thead>
                <tr>
                  <th>Technology</th>
                  <th>Score</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {(data.top_commercializable || []).slice(0, 5).map((p, i) => (
                  <tr key={i}>
                    <td>{p.technology}</td>
                    <td>
                      <span className={`score-pill ${p.innovation_score >= 80 ? 'high' : p.innovation_score >= 60 ? 'mid' : 'low'}`}>
                        {p.innovation_score}
                      </span>
                    </td>
                    <td>
                      <span
                        className="commerc-badge"
                        style={{ background: COMMERC_COLORS[p.recommendation?.action] || '#6366f1' }}
                      >
                        {p.recommendation?.action || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ── Summary Card sub-component ──────────────────────────────────────────────── */
function SummaryCard({ icon, label, value, accent, isText, suffix }) {
  return (
    <div className="exec-summary-card" style={{ '--accent': accent }}>
      <div className="exec-card-icon" style={{ background: `${accent}22`, color: accent }}>
        {icon}
      </div>
      <div className="exec-card-body">
        <span className="exec-card-label">{label}</span>
        <span className={`exec-card-value ${isText ? 'text-val' : ''}`}>
          {value}
          {suffix && <span className="exec-card-suffix">{suffix}</span>}
        </span>
      </div>
    </div>
  );
}
