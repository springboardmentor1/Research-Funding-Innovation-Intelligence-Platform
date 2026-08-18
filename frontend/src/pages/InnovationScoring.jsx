import { useEffect, useState } from 'react';
import { Award, Star, Sparkles, Rocket, Handshake, Users, Lightbulb, FlaskConical, Filter, ArrowUpDown, Cpu, Target } from 'lucide-react';
import {
  BarChart, Bar, Cell, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import client from '../api/client';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

const REC_ICONS = {
  'Commercialize': Rocket,
  'License': Handshake,
  'Industry Collaboration': Users,
  'Startup Potential': Lightbulb,
  'Continue Research': FlaskConical,
};

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

export default function InnovationScoring() {
  const [scores, setScores] = useState(null);
  const [commerc, setCommerc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scores');
  const [techFilter, setTechFilter] = useState('');
  const [selectedPatent, setSelectedPatent] = useState(null);

  useEffect(() => {
    Promise.all([
      client.get('/innovation/scores'),
      client.get('/innovation/commercialization'),
    ])
      .then(([sc, co]) => {
        setScores(sc.data);
        setCommerc(co.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p>Loading innovation scores…</p>
    </div>
  );

  const patents = scores?.patents || [];
  const distribution = scores?.distribution?.distribution || [];
  const distColors = ['#ef4444', '#f59e0b', '#06b6d4', '#8b5cf6', '#10b981'];
  const commercDist = commerc?.distribution || [];
  const allTechs = [...new Set(patents.map(p => p.technology))].sort();

  const filtered = techFilter ? patents.filter(p => p.technology === techFilter) : patents;
  const top20 = filtered.slice(0, 20);

  const radarData = selectedPatent ? [
    { subject: 'Novelty', value: selectedPatent.breakdown.research_novelty, fullMark: 100 },
    { subject: 'Strength', value: selectedPatent.breakdown.patent_strength, fullMark: 100 },
    { subject: 'Maturity', value: selectedPatent.breakdown.technology_maturity, fullMark: 100 },
    { subject: 'Market', value: selectedPatent.breakdown.market_potential, fullMark: 100 },
    { subject: 'Funding', value: selectedPatent.breakdown.funding_relevance, fullMark: 100 },
  ] : [];

  const tabs = [
    { key: 'scores', label: 'Patent Ranking', icon: ArrowUpDown },
    { key: 'distribution', label: 'Score Distribution', icon: Target },
    { key: 'commercialization', label: 'Commercialization', icon: Rocket },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Hero */}
      <div className="intel-hero" style={{ marginBottom: '1.5rem' }}>
        <div className="intel-hero-content">
          <div className="intel-badge">
            <Star size={12} />
            Innovation Scoring
          </div>
          <h1>Innovation Scoring & Commercialization</h1>
          <p>Weighted scoring engine ranks patents by novelty, strength, maturity, market potential, and funding relevance.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Patents', value: scores?.distribution?.total_patents || 0, icon: Award, color: '#6366f1' },
          { label: 'Highest Score', value: scores?.distribution?.max_score || 0, icon: Star, color: '#10b981' },
          { label: 'Average Score', value: scores?.distribution?.avg_score || 0, icon: Target, color: '#f59e0b' },
          { label: 'Commercializable', value: commercDist.find(d => d.action === 'Commercialize')?.count || 0, icon: Rocket, color: '#8b5cf6' },
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

      {/* Patent Ranking */}
      {activeTab === 'scores' && (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: selectedPatent ? '1fr 380px' : '1fr' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowUpDown size={16} style={{ color: 'var(--accent-primary)' }} /> Top 20 Patents by Innovation Score
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <select value={techFilter} onChange={e => setTechFilter(e.target.value)} style={{ width: 'auto', minWidth: 140, padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}>
                  <option value="">All Technologies</option>
                  {allTechs.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Patent</th>
                  <th>Technology</th>
                  <th>Assignee</th>
                  <th>Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {top20.map((p, i) => {
                  const rec = commerc?.patents?.find(cp => cp.patent_id === p.patent_id)?.recommendation;
                  return (
                    <tr
                      key={p.patent_id}
                      onClick={() => setSelectedPatent(p)}
                      style={{ cursor: 'pointer', background: selectedPatent?.patent_id === p.patent_id ? 'rgba(99,102,241,0.08)' : undefined }}
                    >
                      <td><span className="badge badge-purple">#{i + 1}</span></td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                      <td><span className="badge badge-cyan">{p.technology}</span></td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.assignee}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden', minWidth: 60 }}>
                            <div style={{
                              width: `${p.innovation_score}%`, height: '100%', borderRadius: 100,
                              background: p.innovation_score >= 80 ? 'var(--gradient-success)' : p.innovation_score >= 60 ? 'var(--gradient-main)' : 'var(--gradient-funding)',
                            }} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: p.innovation_score >= 80 ? '#10b981' : p.innovation_score >= 60 ? '#6366f1' : '#f59e0b' }}>
                            {p.innovation_score}
                          </span>
                        </div>
                      </td>
                      <td>
                        {rec && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: rec.color, textTransform: 'uppercase' }}>
                            {rec.action}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Radar Detail Panel */}
          {selectedPatent && (
            <div className="card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{selectedPatent.title}</h3>
              <p style={{ fontSize: '0.78rem', marginBottom: '1rem' }}>{selectedPatent.assignee} · {selectedPatent.year} · {selectedPatent.citations} citations</p>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--text-muted)" fontSize={10} />
                  <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="breakdown-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.5rem' }}>
                {Object.entries(selectedPatent.breakdown).map(([key, val]) => (
                  <div key={key} className="breakdown-item" style={{ textAlign: 'left' }}>
                    <div className="breakdown-label">{key.replace(/_/g, ' ')}</div>
                    <div className="breakdown-value">{val.toFixed(1)}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(99,102,241,0.05)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Innovation Score</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: selectedPatent.innovation_score >= 80 ? '#10b981' : '#6366f1' }}>
                  {selectedPatent.innovation_score}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Score Distribution */}
      {activeTab === 'distribution' && (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={16} style={{ color: 'var(--accent-primary)' }} /> Score Distribution
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="range" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Patents" radius={[6, 6, 0, 0]}>
                  {distribution.map((_, i) => (
                    <Cell key={i} fill={distColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-secondary)' }} /> Score Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {distribution.map((d, i) => (
                <div key={d.range}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Score {d.range}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: distColors[i] }}>{d.count} patents</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(d.count / (scores?.distribution?.total_patents || 1)) * 100}%`,
                      height: '100%', borderRadius: 100, background: distColors[i], transition: 'width 1s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Commercialization */}
      {activeTab === 'commercialization' && (
        <div>
          {/* Recommendation Cards */}
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', marginBottom: '1.5rem' }}>
            {commercDist.map((d) => {
              const Icon = REC_ICONS[d.action] || FlaskConical;
              return (
                <div key={d.action} className="stat-card" style={{ borderLeft: `3px solid ${d.color}` }}>
                  <div className="stat-icon" style={{ background: `${d.color}20` }}>
                    <Icon size={20} style={{ color: d.color }} />
                  </div>
                  <div>
                    <div className="stat-value">{d.count}</div>
                    <div className="stat-label">{d.action}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Rocket size={16} style={{ color: '#10b981' }} /> Commercialization Distribution
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={commercDist} dataKey="count" nameKey="action" cx="50%" cy="50%" outerRadius={130} label={({ action, percent }) => `${action} ${(percent * 100).toFixed(0)}%`} labelLine={true} fontSize={10}>
                    {commercDist.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Rocket size={16} style={{ color: '#10b981' }} /> Top Commercializable Patents
              </h3>
              {(commerc?.top_commercializable || []).slice(0, 8).map((p, i) => (
                <div key={p.patent_id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.technology} · {p.assignee}</div>
                  </div>
                  <span style={{ fontWeight: 800, fontFamily: 'Outfit', color: '#10b981', marginLeft: '0.75rem' }}>
                    {p.innovation_score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
