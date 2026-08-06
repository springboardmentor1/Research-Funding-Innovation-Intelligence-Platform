import { useEffect, useState } from 'react';
import client from '../api/client';
import Panel from '../components/Panel';
import { downloadFile } from '../api/download';

export default function FundingPage() {
  const [recs, setRecs] = useState(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/api/funding/recommendations')
      .then((res) => setRecs(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Could not load recommendations.'));
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    const res = await client.get('/api/funding/search', { params: { q: query } });
    setSearchResults(res.data);
  }

  function formatAmount(opp) {
    if (!opp.min_funding_amount && !opp.max_funding_amount) return null;
    const fmt = (n) => new Intl.NumberFormat('en-US').format(n);
    return `${opp.currency} ${fmt(opp.min_funding_amount || 0)} – ${fmt(opp.max_funding_amount || 0)}`;
  }

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <div className="page-eyebrow">Funding Discovery</div>
          <h1 className="page-title">Matches for your profile</h1>
          <p className="page-desc">Ranked by domain and keyword overlap with your research profile.</p>
        </div>
        <button
          className="btn-ghost btn"
          onClick={() => downloadFile('/api/reports/funding.csv', 'funding_report.csv')}
          style={{ flexShrink: 0 }}
        >
          Export CSV
        </button>
      </div>

      <Panel label="Search all opportunities" style={{ marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input placeholder="e.g. NLP, biotech, startup…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="btn" type="submit">Search</button>
        </form>
        {searchResults && (
          <div style={{ marginTop: 14 }}>
            {searchResults.length === 0 && <p className="empty-state">No matches for "{query}".</p>}
            {searchResults.map((opp) => (
              <div className="list-row" key={opp.id}>
                <div>
                  <div style={{ fontSize: 13.5 }}>{opp.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{opp.source}</div>
                </div>
                <span className="tag">{opp.source_category}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {error && <Panel><p style={{ color: 'var(--text-dim)' }}>{error}</p></Panel>}

      {recs && recs.length === 0 && !error && (
        <Panel><p className="empty-state">No funding opportunities in the system yet.</p></Panel>
      )}

      {recs && recs.map((rec) => (
        <Panel key={rec.opportunity.id} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 17 }}>{rec.opportunity.title}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>{rec.opportunity.source}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="mono" style={{ fontSize: 22, color: 'var(--gold)' }}>{rec.match_score}%</div>
              <span className={'tag ' + (rec.eligible ? 'eligible' : 'ineligible')}>
                {rec.eligible ? 'Eligible' : 'Not eligible'}
              </span>
            </div>
          </div>

          {rec.opportunity.description && (
            <p style={{ fontSize: 13.5, color: 'var(--text-dim)', marginTop: 12 }}>{rec.opportunity.description}</p>
          )}

          <div style={{ marginTop: 12 }}>
            {rec.matched_domains.map((d) => <span key={d} className="tag gold">{d}</span>)}
            {rec.matched_keywords.map((k) => <span key={k} className="tag">{k}</span>)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 12.5, color: 'var(--text-faint)' }}>
            <span>{formatAmount(rec.opportunity) || 'Amount not specified'}</span>
            {rec.opportunity.application_url && (
              <a href={rec.opportunity.application_url} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>
                Apply →
              </a>
            )}
          </div>
        </Panel>
      ))}
    </>
  );
}
