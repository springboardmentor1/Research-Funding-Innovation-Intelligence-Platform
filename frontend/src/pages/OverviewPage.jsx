import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Panel from '../components/Panel';
import { useAuth } from '../context/AuthContext';

export default function OverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/api/dashboard/researcher')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Could not load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Overview</div>
        <h1 className="page-title">Welcome back, {user?.full_name?.split(' ')[0]}</h1>
        <p className="page-desc">
          A snapshot of funding matches and research trends for your profile.
        </p>
      </div>

      {loading && <p className="loading-dots">Loading dashboard…</p>}

      {error && !loading && (
        <Panel>
          <p style={{ color: 'var(--text-dim)' }}>{error}</p>
          <Link to="/profile" className="btn" style={{ marginTop: 12, display: 'inline-flex' }}>
            Set up your research profile
          </Link>
        </Panel>
      )}

      {data && (
        <div className="grid grid-2" style={{ marginTop: 4 }}>
          <Panel label="Top Funding Matches">
            {data.funding_recommendations.length === 0 && (
              <p className="empty-state">No funding opportunities matched yet. Add research domains to your profile.</p>
            )}
            {data.funding_recommendations.map((rec) => (
              <div className="list-row" key={rec.opportunity.id}>
                <div>
                  <div style={{ fontSize: 13.5 }}>{rec.opportunity.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{rec.opportunity.source}</div>
                </div>
                <span className="mono" style={{ color: 'var(--gold)', fontSize: 13 }}>{rec.match_score}%</span>
              </div>
            ))}
            <Link to="/funding" style={{ fontSize: 12.5, color: 'var(--gold)', display: 'inline-block', marginTop: 12 }}>
              View all funding →
            </Link>
          </Panel>

          <Panel label="Research Domains Tracked">
            {data.profile.research_domains.length === 0 && (
              <p className="empty-state">No research domains set yet.</p>
            )}
            {data.research_trends.map((t) => (
              <div className="list-row" key={t.query}>
                <div>
                  <div style={{ fontSize: 13.5, textTransform: 'capitalize' }}>{t.query}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                    {t.total_publications_sampled} recent publications sampled
                  </div>
                </div>
                <span className={'tag ' + (t.is_emerging_trend ? 'eligible' : '')}>
                  {t.is_emerging_trend ? 'Emerging' : 'Steady'}
                </span>
              </div>
            ))}
            <Link to="/research" style={{ fontSize: 12.5, color: 'var(--gold)', display: 'inline-block', marginTop: 12 }}>
              Explore research trends →
            </Link>
          </Panel>
        </div>
      )}
    </>
  );
}
