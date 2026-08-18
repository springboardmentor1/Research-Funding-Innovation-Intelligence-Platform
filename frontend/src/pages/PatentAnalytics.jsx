import { useEffect, useState } from 'react';
import { BarChart3, Globe, Building2, Calendar, Award, TrendingUp, Users, Cpu, Sparkles } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import client from '../api/client';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#a78bfa', '#fbbf24', '#f472b6', '#22d3ee'];

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

export default function PatentAnalytics() {
  const [landscape, setLandscape] = useState(null);
  const [trends, setTrends] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('technology');

  useEffect(() => {
    Promise.all([
      client.get('/innovation/patent-landscape'),
      client.get('/innovation/patent-trends'),
    ])
      .then(([ls, tr]) => {
        setLandscape(ls.data);
        setTrends(tr.data);
        setAssignees(ls.data.by_assignee || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p>Loading patent analytics…</p>
    </div>
  );

  const techData = (landscape?.by_technology || []).map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }));
  const countryData = (landscape?.by_country || []).map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }));
  const yearData = landscape?.by_year || [];
  const trendData = trends?.trends || [];

  const tabs = [
    { key: 'technology', label: 'By Technology', icon: Cpu },
    { key: 'country', label: 'By Country', icon: Globe },
    { key: 'trends', label: 'Yearly Trends', icon: TrendingUp },
    { key: 'assignees', label: 'Top Companies', icon: Building2 },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Hero */}
      <div className="intel-hero" style={{ marginBottom: '1.5rem' }}>
        <div className="intel-hero-content">
          <div className="intel-badge">
            <BarChart3 size={12} />
            Milestone 3
          </div>
          <h1>Patent Landscape Analysis</h1>
          <p>Comprehensive patent analytics across technologies, countries, and time periods.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Patents', value: landscape?.total_patents || 0, icon: Award, color: '#6366f1' },
          { label: 'Technologies', value: landscape?.total_technologies || 0, icon: Cpu, color: '#8b5cf6' },
          { label: 'Countries', value: landscape?.total_countries || 0, icon: Globe, color: '#06b6d4' },
          { label: 'Assignees', value: landscape?.total_assignees || 0, icon: Building2, color: '#10b981' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: `${color}20` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
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

      {/* Technology Distribution */}
      {activeTab === 'technology' && (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1.2fr 1fr' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={16} style={{ color: 'var(--accent-primary)' }} /> Patents by Technology
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={techData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                <YAxis dataKey="Technology" type="category" width={130} stroke="var(--text-muted)" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Patents" radius={[0, 6, 6, 0]}>
                  {techData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-secondary)' }} /> Technology Share
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie data={techData} dataKey="count" nameKey="Technology" cx="50%" cy="50%" outerRadius={140} label={({ Technology, percent }) => `${Technology} ${(percent * 100).toFixed(0)}%`} labelLine={true} fontSize={10}>
                  {techData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Country Distribution */}
      {activeTab === 'country' && (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={16} style={{ color: '#06b6d4' }} /> Patents by Country
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={countryData} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="Country" stroke="var(--text-muted)" fontSize={11} angle={-45} textAnchor="end" height={70} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Patents" radius={[6, 6, 0, 0]}>
                  {countryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={16} style={{ color: '#10b981' }} /> Country Share
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie data={countryData.slice(0, 8)} dataKey="count" nameKey="Country" cx="50%" cy="50%" outerRadius={140} label={({ Country, percent }) => `${Country} ${(percent * 100).toFixed(0)}%`} labelLine={true} fontSize={10}>
                  {countryData.slice(0, 8).map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Yearly Trends */}
      {activeTab === 'trends' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} style={{ color: '#10b981' }} /> Patent Filing Trends
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="count" name="Patents Filed" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={16} style={{ color: '#f59e0b' }} /> Year-over-Year Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="growth_pct" name="Growth %" radius={[6, 6, 0, 0]}>
                  {trendData.map((entry, i) => (
                    <Cell key={i} fill={entry.growth_pct >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Assignees */}
      {activeTab === 'assignees' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={16} style={{ color: '#8b5cf6' }} /> Top Patent-Holding Companies
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Company</th>
                <th>Patents</th>
              </tr>
            </thead>
            <tbody>
              {assignees.map((a, i) => (
                <tr key={i}>
                  <td>
                    <span className="badge badge-purple">#{i + 1}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <Building2 size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 6, color: COLORS[i % COLORS.length] }} />
                    {a.Assignee}
                  </td>
                  <td style={{ fontWeight: 700, color: COLORS[i % COLORS.length] }}>{a.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
