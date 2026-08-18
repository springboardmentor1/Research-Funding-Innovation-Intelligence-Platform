import { useEffect, useState } from 'react';
import { Target, TrendingUp, Calendar, DollarSign, Building2, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import client from '../api/client';

const getScoreClass = (score) => score >= 40 ? 'high' : score >= 25 ? 'medium' : 'low';
const getRankClass = (i) => i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-default';

export default function FundingRecommendation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topN, setTopN] = useState(10);
  const [expandedCard, setExpandedCard] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id) { setLoading(false); setError('Please log in to see recommendations.'); return; }
    setLoading(true);
    client.get(`/recommendations?user_id=${user.id}&top_n=${topN}`)
      .then(r => setData(r.data))
      .catch(err => {
        const msg = err.response?.data?.detail || 'Could not load recommendations. Please create a research profile first.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [topN]);

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p>Analyzing your profile and matching grants…</p>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div className="intel-hero">
        <div className="intel-hero-content">
          <div className="intel-badge">
            <Target size={12} />
            AI-Powered Matching
          </div>
          <h1>Grant Recommendations</h1>
          <p>Personalized funding recommendations based on your research profile, using multi-criteria similarity analysis.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {data && (
        <>
          {/* Profile Banner */}
          {data.profile_summary && (
            <div className="profile-banner">
              <div className="profile-avatar-lg">
                {(data.profile_summary.name || 'R')[0].toUpperCase()}
              </div>
              <div className="profile-info">
                <h3>{data.profile_summary.name || 'Researcher'}</h3>
                <p>{data.profile_summary.university} · {data.profile_summary.research_area}</p>
                <div className="profile-tags">
                  {data.profile_summary.keywords?.split(',').map(k => k.trim()).filter(Boolean).slice(0, 5).map(k => (
                    <span key={k} className="badge badge-purple">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="filter-bar">
            <span className="filter-label">Show top</span>
            <select value={topN} onChange={e => setTopN(Number(e.target.value))}>
              <option value={5}>5 grants</option>
              <option value={10}>10 grants</option>
              <option value={15}>15 grants</option>
              <option value={20}>20 grants</option>
            </select>
            <span className="badge badge-green" style={{ marginLeft: 'auto' }}>
              <Sparkles size={11} style={{ marginRight: 4 }} />
              {data.count} matches found
            </span>
          </div>

          {/* Recommendation Cards */}
          <div className="rec-grid">
            {data.recommendations?.map((rec, i) => (
              <div
                key={i}
                className="rec-card"
                style={{ animationDelay: `${i * 0.06}s` }}
                onClick={() => setExpandedCard(expandedCard === i ? null : i)}
              >
                <div className={`rec-rank ${getRankClass(i)}`}>#{i + 1}</div>

                <div className="rec-title">{rec.grant_name}</div>
                <div className="rec-agency">
                  <Building2 size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} />
                  {rec.agency}
                </div>

                <div className="rec-details">
                  <div className="rec-detail-item">
                    <span className="rec-detail-label">Research Area</span>
                    <span className="rec-detail-value">{rec.area}</span>
                  </div>
                  <div className="rec-detail-item">
                    <span className="rec-detail-label">Funding Amount</span>
                    <span className="rec-detail-value">{rec.amount}</span>
                  </div>
                  <div className="rec-detail-item">
                    <span className="rec-detail-label">Deadline</span>
                    <span className="rec-detail-value">
                      <Calendar size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 3 }} />
                      {rec.deadline}
                    </span>
                  </div>
                  <div className="rec-detail-item">
                    <span className="rec-detail-label">Country</span>
                    <span className="rec-detail-value">
                      <MapPin size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 3 }} />
                      {rec.country}
                    </span>
                  </div>
                </div>

                {/* Similarity Score Bar */}
                <div className="score-bar-container">
                  <div className="score-bar-header">
                    <span className="score-bar-label">Match Score</span>
                    <span className={`score-bar-value ${getScoreClass(rec.similarity_score)}`}>
                      {rec.similarity_score}%
                    </span>
                  </div>
                  <div className="score-bar-track">
                    <div
                      className={`score-bar-fill ${getScoreClass(rec.similarity_score)}`}
                      style={{ width: `${Math.min(rec.similarity_score, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Breakdown (Expandable) */}
                {rec.breakdown && expandedCard === i && (
                  <div className="breakdown-grid" style={{ animation: 'fadeInUp 0.3s ease' }}>
                    <div className="breakdown-item">
                      <div className="breakdown-value">{rec.breakdown.keyword_match}%</div>
                      <div className="breakdown-label">Keywords</div>
                    </div>
                    <div className="breakdown-item">
                      <div className="breakdown-value">{rec.breakdown.area_match}%</div>
                      <div className="breakdown-label">Area</div>
                    </div>
                    <div className="breakdown-item">
                      <div className="breakdown-value">{rec.breakdown.country_match}%</div>
                      <div className="breakdown-label">Country</div>
                    </div>
                    <div className="breakdown-item">
                      <div className="breakdown-value">{rec.breakdown.eligibility_match}%</div>
                      <div className="breakdown-label">Eligibility</div>
                    </div>
                    <div className="breakdown-item">
                      <div className="breakdown-value">{rec.breakdown.org_match}%</div>
                      <div className="breakdown-label">Org Match</div>
                    </div>
                  </div>
                )}

                {rec.breakdown && (
                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <button
                      className="btn-ghost"
                      style={{ border: 'none', fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', padding: '0.25rem' }}
                      onClick={(e) => { e.stopPropagation(); setExpandedCard(expandedCard === i ? null : i); }}
                    >
                      <ChevronDown size={14} style={{ transform: expandedCard === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      {expandedCard === i ? ' Hide' : ' View'} score breakdown
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
