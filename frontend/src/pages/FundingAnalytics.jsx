import { useEffect, useState } from 'react';
import { PieChart as PieIcon, DollarSign, Building2, Calendar, MapPin, Search, Filter, Globe } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import client from '../api/client';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#a78bfa', '#fbbf24'];

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

export default function FundingAnalytics() {
  const [funding, setFunding] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('');

  useEffect(() => {
    Promise.all([
      client.get('/funding'),
      client.get('/analytics/dashboard'),
    ])
      .then(([f, d]) => {
        setFunding(f.data.funding_opportunities || []);
        setDashData(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p>Loading funding analytics…</p>
    </div>
  );

  const areas = [...new Set(funding.map(f => f.Area))].filter(Boolean);

  // Parse amounts for charts
  const amountData = funding.map(f => {
    const amountStr = String(f.Amount || '');
    let numericAmount = 0;
    if (amountStr.includes('Crore')) {
      numericAmount = parseFloat(amountStr.replace(/[^0-9.]/g, '')) * 100;
    } else {
      numericAmount = parseFloat(amountStr.replace(/[^0-9.]/g, '')) || 0;
    }
    return { ...f, numericAmount };
  });

  // Filtered
  const filtered = amountData.filter(f => {
    const matchSearch = !searchTerm || f.Grant?.toLowerCase().includes(searchTerm.toLowerCase())
      || f.Organization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchArea = !areaFilter || f.Area === areaFilter;
    return matchSearch && matchArea;
  });

  // Area distribution
  const areaDistData = areas.map(area => ({
    area,
    count: funding.filter(f => f.Area === area).length,
  })).sort((a, b) => b.count - a.count);

  // Amount by area
  const amountByArea = areas.map(area => ({
    area,
    totalAmount: amountData.filter(f => f.Area === area).reduce((sum, f) => sum + f.numericAmount, 0),
  })).sort((a, b) => b.totalAmount - a.totalAmount);

  // Country distribution
  const countries = {};
  funding.forEach(f => {
    const c = f.Country || 'Unknown';
    countries[c] = (countries[c] || 0) + 1;
  });
  const countryData = Object.entries(countries).map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Hero */}
      <div className="intel-hero">
        <div className="intel-hero-content">
          <div className="intel-badge">
            <PieIcon size={12} />
            Funding Analytics
          </div>
          <h1>Funding Analytics</h1>
          <p>Comprehensive analysis of funding opportunities across agencies, research areas, and funding amounts.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card-enhanced purple" style={{ animation: 'fadeInUp 0.4s ease backwards' }}>
          <div className="stat-icon-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <DollarSign size={20} style={{ color: '#6366f1' }} />
          </div>
          <div className="stat-number">{funding.length}</div>
          <div className="stat-title">Total Grants</div>
        </div>
        <div className="stat-card-enhanced green" style={{ animation: 'fadeInUp 0.4s ease 0.05s backwards' }}>
          <div className="stat-icon-lg" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <Building2 size={20} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-number">{dashData?.agency_distribution?.length || 0}</div>
          <div className="stat-title">Agencies</div>
        </div>
        <div className="stat-card-enhanced cyan" style={{ animation: 'fadeInUp 0.4s ease 0.1s backwards' }}>
          <div className="stat-icon-lg" style={{ background: 'rgba(6,182,212,0.15)' }}>
            <Globe size={20} style={{ color: '#06b6d4' }} />
          </div>
          <div className="stat-number">{areas.length}</div>
          <div className="stat-title">Research Areas</div>
        </div>
        <div className="stat-card-enhanced amber" style={{ animation: 'fadeInUp 0.4s ease 0.15s backwards' }}>
          <div className="stat-icon-lg" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <MapPin size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-number">{countryData.length}</div>
          <div className="stat-title">Countries</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">🎯 Grants by Research Area</div>
              <div className="chart-subtitle">Distribution of funding opportunities</div>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={areaDistData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="area"
                >
                  {areaDistData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">💰 Funding Amount by Area</div>
              <div className="chart-subtitle">Total funding in Lakhs (₹)</div>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer>
              <BarChart data={amountByArea} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="area" type="category" stroke="#64748b" fontSize={11} width={120} tick={{ fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalAmount" name="₹ Lakhs" radius={[0, 6, 6, 0]}>
                  {amountByArea.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Funding Table */}
      <div className="chart-card" style={{ marginTop: '1.5rem' }}>
        <div className="chart-header">
          <div>
            <div className="chart-title">📋 All Funding Opportunities</div>
            <div className="chart-subtitle">{filtered.length} of {funding.length} grants</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="filter-bar" style={{ marginBottom: '1rem' }}>
          <div className="search-input-wrap" style={{ maxWidth: 280 }}>
            <Search size={16} className="search-icon" />
            <input
              placeholder="Search grants…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}>
            <option value="">All Areas</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Grant Name</th>
                <th>Agency</th>
                <th>Area</th>
                <th>Amount</th>
                <th>Deadline</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => (
                <tr key={i} style={{ animation: `fadeInUp 0.3s ease ${i * 0.02}s backwards` }}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 250 }}>{f.Grant}</td>
                  <td><span className="badge badge-cyan">{f.Organization}</span></td>
                  <td><span className="badge badge-purple">{f.Area}</span></td>
                  <td><span className="badge badge-green">{f.Amount}</span></td>
                  <td style={{ fontSize: '0.8rem' }}>
                    <Calendar size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 3 }} />
                    {f.Deadline}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    <MapPin size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 3 }} />
                    {f.Country}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
