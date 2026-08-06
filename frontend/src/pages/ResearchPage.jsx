import { useState } from 'react';
import client from '../api/client';
import Panel from '../components/Panel';

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/api/research/trends', { params: { query } });
      setTrend(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not fetch trend data.');
    } finally {
      setLoading(false);
    }
  }

  const maxCount = trend ? Math.max(...trend.publications_by_year.map((y) => y.count), 1) : 1;

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Research Trend Intelligence</div>
        <h1 className="page-title">Publication trends</h1>
        <p className="page-desc">Live data from OpenAlex. Search any topic to see publication volume and citation impact over time.</p>
      </div>

      <Panel style={{ marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input placeholder="e.g. retrieval augmented generation" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Searching…' : 'Analyze'}</button>
        </form>
      </Panel>

      {error && <Panel><p style={{ color: 'var(--text-dim)' }}>{error}</p></Panel>}

      {trend && (
        <div className="grid grid-2">
          <Panel label="Publication volume by year">
            {trend.publications_by_year.length === 0 && <p className="empty-state">No dated results found.</p>}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140, marginTop: 8 }}>
              {trend.publications_by_year.map((y) => (
                <div key={y.year} style={{ textAlign: 'center', flex: 1 }}>
                  <div
                    style={{
                      height: `${(y.count / maxCount) * 110}px`,
                      background: 'var(--gold)',
                      opacity: 0.75,
                      borderRadius: '2px 2px 0 0',
                    }}
                  />
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>{y.year}</div>
                </div>
              ))}
            </div>
            <span className={'tag ' + (trend.is_emerging_trend ? 'eligible' : '')} style={{ marginTop: 16, display: 'inline-block' }}>
              {trend.is_emerging_trend ? 'Emerging trend' : 'Steady / declining'}
            </span>
          </Panel>

          <Panel label="Summary">
            <div className="stat-value">{trend.total_publications_sampled}</div>
            <div className="stat-label">publications sampled</div>

            <div className="stat-value" style={{ marginTop: 20 }}>{trend.avg_citations_per_paper}</div>
            <div className="stat-label">avg citations per paper</div>

            {trend.top_venues.length > 0 && (
              <>
                <div className="panel-label" style={{ marginTop: 20 }}>Top venues</div>
                {trend.top_venues.map((v) => (
                  <div className="list-row" key={v.venue}>
                    <span style={{ fontSize: 13.5 }}>{v.venue}</span>
                    <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>{v.count}</span>
                  </div>
                ))}
              </>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
