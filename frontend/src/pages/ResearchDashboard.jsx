import { useEffect, useState } from 'react';
import {
  BarChart3, TrendingUp, Zap, Award, BookOpen, DollarSign,
  Activity, ArrowUpRight, Sparkles, Globe
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts';
import client from '../api/client';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

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

export default function ResearchDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/analytics/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p>Loading research intelligence…</p>
    </div>
  );

  if (!data) return (
    <div className="empty-state">
      <div className="empty-state-icon">📊</div>
      <h3>Unable to load dashboard data</h3>
      <p>Please ensure the backend server is running.</p>
    </div>
  );

  const { summary, publication_trends, top_keywords, agency_distribution, funding_by_area, research_area_distribution } = data;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Hero */}
      <div className="intel-hero">
        <div className="intel-hero-content">
          <div className="intel-badge">
            <Sparkles size={12} />
            Research Intelligence Platform
          </div>
          <h1>Research Intelligence Dashboard</h1>
          <p>Real-time analytics across publications, funding opportunities, and emerging research trends powered by AI.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid-5">
        <div className="stat-card-enhanced purple" style={{ animationDelay: '0.05s', animation: 'fadeInUp 0.5s ease backwards' }}>
          <div className="stat-icon-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <BookOpen size={22} style={{ color: '#6366f1' }} />
          </div>
          <div className="stat-number">{summary.total_papers?.toLocaleString()}</div>
          <div className="stat-title">Total Papers</div>
          <div className="stat-trend up"><ArrowUpRight size={11} /> Research Dataset</div>
        </div>
        <div className="stat-card-enhanced amber" style={{ animationDelay: '0.1s', animation: 'fadeInUp 0.5s ease backwards' }}>
          <div className="stat-icon-lg" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <DollarSign size={22} style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-number">{summary.total_grants}</div>
          <div className="stat-title">Funding Grants</div>
          <div className="stat-trend up"><ArrowUpRight size={11} /> Active Opportunities</div>
        </div>
        <div className="stat-card-enhanced green" style={{ animationDelay: '0.15s', animation: 'fadeInUp 0.5s ease backwards' }}>
          <div className="stat-icon-lg" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <Zap size={22} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-number" style={{ fontSize: '1.1rem' }}>{summary.trending_topic}</div>
          <div className="stat-title">Trending Topic</div>
          <div className="stat-trend up"><TrendingUp size={11} /> Most Researched</div>
        </div>
        <div className="stat-card-enhanced cyan" style={{ animationDelay: '0.2s', animation: 'fadeInUp 0.5s ease backwards' }}>
          <div className="stat-icon-lg" style={{ background: 'rgba(6,182,212,0.15)' }}>
            <Award size={22} style={{ color: '#06b6d4' }} />
          </div>
          <div className="stat-number">{summary.top_agency}</div>
          <div className="stat-title">Top Agency</div>
          <div className="stat-trend neutral"><Globe size={11} /> {summary.top_agency_count} grants</div>
        </div>
        <div className="stat-card-enhanced red" style={{ animationDelay: '0.25s', animation: 'fadeInUp 0.5s ease backwards' }}>
          <div className="stat-icon-lg" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <Activity size={22} style={{ color: '#ef4444' }} />
          </div>
          <div className="stat-number">{summary.most_active_year}</div>
          <div className="stat-title">Most Active Year</div>
          <div className="stat-trend up"><ArrowUpRight size={11} /> Peak Research</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid-3">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">📈 Publication Trends</div>
              <div className="chart-subtitle">Papers published per year</div>
            </div>
            <span className="badge badge-purple">{summary.total_papers} total</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer>
              <AreaChart data={publication_trends}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorCount)" name="Papers" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">🏛️ Top Agencies</div>
              <div className="chart-subtitle">Funding distribution</div>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={agency_distribution?.slice(0, 8)}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="agency"
                >
                  {agency_distribution?.slice(0, 8).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">🔥 Top Research Keywords</div>
              <div className="chart-subtitle">Most frequent topics across papers</div>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer>
              <BarChart data={top_keywords?.slice(0, 10)} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="keyword" type="category" stroke="#64748b" fontSize={11} width={120} tick={{ fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Mentions" radius={[0, 4, 4, 0]}>
                  {top_keywords?.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">🧬 Research Areas</div>
              <div className="chart-subtitle">Paper distribution by domain</div>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer>
              <BarChart data={research_area_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="area" stroke="#64748b" fontSize={10} angle={-30} textAnchor="end" height={80} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Papers" radius={[4, 4, 0, 0]}>
                  {research_area_distribution?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
