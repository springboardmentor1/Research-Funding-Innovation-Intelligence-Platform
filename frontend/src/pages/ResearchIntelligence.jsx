import { useEffect, useState } from 'react';
import { Brain, TrendingUp, Hash, Users, Sparkles } from 'lucide-react';
import {
  BarChart, Bar, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import client from '../api/client';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#a78bfa', '#fbbf24'];
const LINE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ef4444'];

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

export default function ResearchIntelligence() {
  const [keywords, setKeywords] = useState([]);
  const [keywordTrends, setKeywordTrends] = useState({});
  const [authors, setAuthors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('keywords');

  useEffect(() => {
    Promise.all([
      client.get('/analytics/top-keywords?limit=20'),
      client.get('/analytics/keyword-trends'),
      client.get('/analytics/top-authors?limit=10'),
      client.get('/analytics/area-distribution'),
    ])
      .then(([kw, kt, au, ar]) => {
        setKeywords(kw.data.topics || []);
        setKeywordTrends(kt.data.keyword_trends || {});
        setAuthors(au.data.authors || []);
        setAreas(ar.data.areas || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p>Detecting emerging research topics…</p>
    </div>
  );

  // Build trend chart data
  const trendKeywords = Object.keys(keywordTrends);
  const allYears = new Set();
  trendKeywords.forEach(kw => keywordTrends[kw].forEach(d => allYears.add(d.year)));
  const sortedYears = [...allYears].sort();
  const trendChartData = sortedYears.map(year => {
    const row = { year };
    trendKeywords.forEach(kw => {
      const entry = keywordTrends[kw].find(d => d.year === year);
      row[kw] = entry ? entry.count : 0;
    });
    return row;
  });

  const maxKeywordCount = keywords.length ? keywords[0].count : 1;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Hero */}
      <div className="intel-hero">
        <div className="intel-hero-content">
          <div className="intel-badge">
            <Brain size={12} />
            Emerging Topics
          </div>
          <h1>Research Intelligence</h1>
          <p>Discover trending research topics, emerging keywords, and influential authors across the academic landscape.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button className={`tab-btn ${activeTab === 'keywords' ? 'active' : ''}`} onClick={() => setActiveTab('keywords')}>
          <Hash size={14} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} />
          Keywords
        </button>
        <button className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`} onClick={() => setActiveTab('trends')}>
          <TrendingUp size={14} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} />
          Keyword Trends
        </button>
        <button className={`tab-btn ${activeTab === 'authors' ? 'active' : ''}`} onClick={() => setActiveTab('authors')}>
          <Users size={14} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} />
          Top Authors
        </button>
      </div>

      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Keyword Cloud */}
          <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
            <div className="chart-header">
              <div>
                <div className="chart-title">☁️ Research Keyword Cloud</div>
                <div className="chart-subtitle">Size reflects frequency across publications</div>
              </div>
              <span className="badge badge-purple">{keywords.length} topics</span>
            </div>
            <div className="keyword-cloud">
              {keywords.map((kw, i) => {
                const ratio = kw.count / maxKeywordCount;
                const sizeClass = ratio > 0.6 ? 'size-lg' : ratio > 0.3 ? 'size-md' : 'size-sm';
                return (
                  <span
                    key={kw.keyword}
                    className={`keyword-tag ${sizeClass}`}
                    style={{ animationDelay: `${i * 0.03}s`, animation: 'fadeInUp 0.4s ease backwards' }}
                  >
                    {kw.keyword}
                    <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>({kw.count})</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">🔥 Top 10 Research Keywords</div>
                <div className="chart-subtitle">Most mentioned topics across all papers</div>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer>
                <BarChart data={keywords.slice(0, 10)} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis dataKey="keyword" type="category" stroke="#64748b" fontSize={11} width={140} tick={{ fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Mentions" radius={[0, 6, 6, 0]}>
                    {keywords.slice(0, 10).map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">📈 Keyword Popularity Over Time</div>
                <div className="chart-subtitle">Top 5 keywords tracked across publication years</div>
              </div>
            </div>
            <div className="chart-wrapper" style={{ height: 380 }}>
              <ResponsiveContainer>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{value}</span>} />
                  {trendKeywords.map((kw, i) => (
                    <Line
                      key={kw}
                      type="monotone"
                      dataKey={kw}
                      stroke={LINE_COLORS[i % LINE_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Authors Tab */}
      {activeTab === 'authors' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">👩‍🔬 Most Prolific Authors</div>
                <div className="chart-subtitle">Researchers with the most publications in dataset</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Author</th>
                  <th>Papers</th>
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((a, i) => (
                  <tr key={i} style={{ animation: `fadeInUp 0.3s ease ${i * 0.04}s backwards` }}>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: '50%',
                        background: i < 3 ? 'var(--gradient-main)' : 'rgba(255,255,255,0.05)',
                        fontSize: '0.75rem', fontWeight: 700
                      }}>
                        {i + 1}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.author}</td>
                    <td>
                      <span className="badge badge-purple">{a.paper_count} papers</span>
                    </td>
                    <td>
                      <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${(a.paper_count / (authors[0]?.paper_count || 1)) * 100}%`,
                          height: '100%',
                          background: COLORS[i % COLORS.length],
                          borderRadius: '100px'
                        }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
