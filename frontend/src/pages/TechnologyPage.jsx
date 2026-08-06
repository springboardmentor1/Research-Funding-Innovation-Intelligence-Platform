import { useState } from 'react';
import client from '../api/client';
import Panel from '../components/Panel';

const MATURITY_TAG = { Emerging: 'gold', Growing: 'eligible', Mature: 'eligible', Declining: 'ineligible' };

export default function TechnologyPage() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/api/technology/maturity', { params: { domain } });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not analyze this technology domain.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Technology Intelligence</div>
        <h1 className="page-title">Technology maturity lookup</h1>
        <p className="page-desc">
          Combines live publication trends with patent volume to classify a technology domain as
          Emerging, Growing, Mature, or Declining.
        </p>
      </div>

      <Panel style={{ marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input placeholder="e.g. NLP, Quantum Computing, Edge AI…" value={domain} onChange={(e) => setDomain(e.target.value)} />
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Analyzing…' : 'Analyze'}</button>
        </form>
      </Panel>

      {error && <Panel><p style={{ color: 'var(--text-dim)' }}>{error}</p></Panel>}

      {result && (
        <>
          <Panel style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="page-eyebrow" style={{ marginBottom: 6 }}>{result.domain}</div>
                <div className="stat-value">{result.maturity_stage}</div>
              </div>
              <span className={'tag ' + (MATURITY_TAG[result.maturity_stage] || '')} style={{ fontSize: 13, padding: '6px 14px' }}>
                {result.is_emerging_opportunity ? 'Emerging opportunity' : 'Established space'}
              </span>
            </div>
          </Panel>

          <div className="grid grid-2">
            <Panel label="Patent signal">
              <div className="stat-value">{result.patent_count}</div>
              <div className="stat-label">patents tracked in this domain</div>
              <div className="stat-value" style={{ marginTop: 18 }}>{result.avg_patent_citations}</div>
              <div className="stat-label">avg citations per patent</div>
            </Panel>

            <Panel label="Publication signal (live OpenAlex data)">
              <div className="stat-value">{result.publication_trend.total_publications_sampled}</div>
              <div className="stat-label">publications sampled</div>
              <div className="stat-value" style={{ marginTop: 18 }}>{result.publication_trend.avg_citations_per_paper}</div>
              <div className="stat-label">avg citations per paper</div>
              <span className={'tag ' + (result.publication_trend.is_emerging_trend ? 'eligible' : '')} style={{ marginTop: 14, display: 'inline-block' }}>
                {result.publication_trend.is_emerging_trend ? 'Rising publication trend' : 'Flat / declining publication trend'}
              </span>
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
