import { useEffect, useState } from 'react';
import client from '../api/client';
import Panel from '../components/Panel';

export default function ManagerPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/api/dashboard/innovation-manager')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Could not load portfolio dashboard.'));
  }, []);

  const maxCluster = data ? Math.max(...data.portfolio_patent_clusters.map((c) => c.patent_count), 1) : 1;

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Innovation Manager Dashboard</div>
        <h1 className="page-title">Portfolio overview</h1>
        <p className="page-desc">Platform-wide patent portfolio, technology pipeline, and funding landscape.</p>
      </div>

      {error && <Panel><p style={{ color: 'var(--text-dim)' }}>{error}</p></Panel>}

      {data && (
        <>
          <div className="grid grid-3" style={{ marginBottom: 20 }}>
            <Panel>
              <div className="stat-value">{data.total_researchers_tracked}</div>
              <div className="stat-label">researchers tracked</div>
            </Panel>
            <Panel>
              <div className="stat-value">{data.total_startups_tracked}</div>
              <div className="stat-label">startups tracked</div>
            </Panel>
            <Panel>
              <div className="stat-value">{data.portfolio_patent_clusters.reduce((s, c) => s + c.patent_count, 0)}</div>
              <div className="stat-label">total patents in portfolio</div>
            </Panel>
          </div>

          <div className="grid grid-2">
            <Panel label="Portfolio Patent Clusters">
              {data.portfolio_patent_clusters.length === 0 && <p className="empty-state">No patents yet.</p>}
              {data.portfolio_patent_clusters.map((c) => (
                <div key={c.technology_domain} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                    <span>{c.technology_domain}</span>
                    <span className="mono" style={{ color: 'var(--text-dim)' }}>{c.patent_count}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 5 }}>
                    <div style={{ height: '100%', width: `${(c.patent_count / maxCluster) * 100}%`, background: 'var(--gold)', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </Panel>

            <Panel label="Technology Pipeline">
              {data.technology_pipeline.length === 0 && <p className="empty-state">No technology domains tracked yet.</p>}
              {data.technology_pipeline.map((t) => (
                <div className="list-row" key={t.domain}>
                  <span style={{ fontSize: 13.5 }}>{t.domain}</span>
                  <span className={'tag ' + (t.maturity_stage === 'Mature' ? 'eligible' : t.maturity_stage === 'Declining' ? 'ineligible' : 'gold')}>
                    {t.maturity_stage}
                  </span>
                </div>
              ))}
            </Panel>
          </div>

          <Panel label="Funding Analytics by Category" style={{ marginTop: 20 }}>
            {data.funding_analytics.length === 0 && <p className="empty-state">No funding opportunities yet.</p>}
            {data.funding_analytics.map((f) => (
              <div className="list-row" key={f.source_category}>
                <span style={{ fontSize: 13.5 }}>{f.source_category}</span>
                <span className="mono" style={{ fontSize: 12.5, color: 'var(--gold)' }}>{f.opportunity_count} opportunities</span>
              </div>
            ))}
          </Panel>
        </>
      )}
    </>
  );
}
