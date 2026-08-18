import { useEffect, useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, BarChart3, Filter } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import client from '../api/client';

const AREA_FILTERS = [
  { value: '', label: 'All Areas' },
  { value: 'AI', label: 'Artificial Intelligence' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Computer Vision', label: 'Computer Vision' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'Blockchain', label: 'Blockchain' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'LLM', label: 'Large Language Models' },
  { value: 'Healthcare', label: 'Healthcare AI' },
];

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">Year {label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: p.color }} />
          <span className="tooltip-value">{p.name}: {p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function PublicationTrends() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState('area'); // 'area' | 'bar' | 'line'

  const fetchData = (area) => {
    setLoading(true);
    const url = area ? `/analytics/publication-trends?area=${encodeURIComponent(area)}` : '/analytics/publication-trends';
    client.get(url)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(filter); }, [filter]);

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p>Analyzing publication trends…</p>
    </div>
  );

  const trends = data?.trends || [];
  const citations = data?.citation_trends || [];
  const maxGrowth = trends.reduce((max, t) => Math.max(max, t.growth_pct || 0), 0);
  const latestTrend = trends[trends.length - 1];
  const prevTrend = trends.length > 1 ? trends[trends.length - 2] : null;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div className="intel-hero">
        <div className="intel-hero-content">
          <div className="intel-badge">
            <TrendingUp size={12} />
            Publication Analytics
          </div>
          <h1>Publication Trends</h1>
          <p>Track research publication growth over time with interactive visualizations and year-over-year analysis.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card-enhanced purple" style={{ animation: 'fadeInUp 0.4s ease backwards' }}>
          <div className="stat-icon-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <BarChart3 size={20} style={{ color: '#6366f1' }} />
          </div>
          <div className="stat-number">{data?.total_papers?.toLocaleString() || 0}</div>
          <div className="stat-title">Total Papers</div>
        </div>
        <div className="stat-card-enhanced cyan" style={{ animation: 'fadeInUp 0.4s ease 0.05s backwards' }}>
          <div className="stat-icon-lg" style={{ background: 'rgba(6,182,212,0.15)' }}>
            <TrendingUp size={20} style={{ color: '#06b6d4' }} />
          </div>
          <div className="stat-number">{data?.total_citations?.toLocaleString() || 0}</div>
          <div className="stat-title">Total Citations</div>
        </div>
        <div className="stat-card-enhanced green" style={{ animation: 'fadeInUp 0.4s ease 0.1s backwards' }}>
          <div className="stat-icon-lg" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <ArrowUpRight size={20} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-number">{data?.avg_citations?.toLocaleString() || 0}</div>
          <div className="stat-title">Avg Citations</div>
        </div>
        <div className="stat-card-enhanced amber" style={{ animation: 'fadeInUp 0.4s ease 0.15s backwards' }}>
          <div className="stat-icon-lg" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <BarChart3 size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-number">{latestTrend?.year || '—'}</div>
          <div className="stat-title">Latest Year</div>
        </div>
      </div>

      {/* Filter & View Controls */}
      <div className="filter-bar">
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        <span className="filter-label">Research Area:</span>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          {AREA_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <div className="tab-nav" style={{ marginBottom: 0, marginLeft: 'auto' }}>
          <button className={`tab-btn ${viewMode === 'area' ? 'active' : ''}`} onClick={() => setViewMode('area')}>Area</button>
          <button className={`tab-btn ${viewMode === 'line' ? 'active' : ''}`} onClick={() => setViewMode('line')}>Line</button>
          <button className={`tab-btn ${viewMode === 'bar' ? 'active' : ''}`} onClick={() => setViewMode('bar')}>Bar</button>
        </div>
      </div>

      {/* Main Chart */}
      <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
        <div className="chart-header">
          <div>
            <div className="chart-title">📈 Papers Published Per Year</div>
            <div className="chart-subtitle">
              {filter ? `Filtered: ${filter}` : 'All research areas'} · {data?.year_range?.min}–{data?.year_range?.max}
            </div>
          </div>
          {latestTrend && prevTrend && (
            <div className={`stat-trend ${latestTrend.growth_pct >= 0 ? 'up' : ''}`}>
              {latestTrend.growth_pct >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {latestTrend.growth_pct}% YoY
            </div>
          )}
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer>
            {viewMode === 'area' ? (
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="gradPapers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradPapers)" name="Papers" />
              </AreaChart>
            ) : viewMode === 'line' ? (
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} name="Papers" />
              </LineChart>
            ) : (
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Papers" radius={[4, 4, 0, 0]}>
                  {trends.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth + Citations Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">📊 Year-over-Year Growth</div>
              <div className="chart-subtitle">Percentage change in publications</div>
            </div>
          </div>
          <div className="chart-wrapper-sm">
            <ResponsiveContainer>
              <BarChart data={trends.filter(t => t.growth_pct !== 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="growth_pct" name="Growth %" radius={[4, 4, 0, 0]}>
                  {trends.filter(t => t.growth_pct !== 0).map((t, i) => (
                    <Cell key={i} fill={t.growth_pct >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">🏆 Citation Trends</div>
              <div className="chart-subtitle">Total citations by year</div>
            </div>
          </div>
          <div className="chart-wrapper-sm">
            <ResponsiveContainer>
              <AreaChart data={citations}>
                <defs>
                  <linearGradient id="gradCite" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="citations" stroke="#f59e0b" strokeWidth={2} fill="url(#gradCite)" name="Citations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <div className="chart-title">📋 Yearly Breakdown</div>
            <div className="chart-subtitle">Detailed statistics per year</div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Papers</th>
              <th>Growth</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {trends.map((t, i) => (
              <tr key={i} style={{ animation: `fadeInUp 0.3s ease ${i * 0.03}s backwards` }}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.year}</td>
                <td>{t.count}</td>
                <td>
                  <span className={`badge ${t.growth_pct >= 0 ? 'badge-green' : 'badge-red'}`}>
                    {t.growth_pct >= 0 ? '+' : ''}{t.growth_pct}%
                  </span>
                </td>
                <td>
                  <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(t.count / (trends.reduce((m, x) => Math.max(m, x.count), 1))) * 100}%`,
                      height: '100%',
                      background: 'var(--gradient-main)',
                      borderRadius: '100px',
                      transition: 'width 1s ease'
                    }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
