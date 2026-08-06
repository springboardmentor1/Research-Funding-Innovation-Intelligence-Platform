import { useEffect, useState } from 'react';
import client from '../api/client';
import Panel from '../components/Panel';
import ScoreGauge from '../components/ScoreGauge';

export default function StartupPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/api/dashboard/startup')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Could not load startup dashboard.'));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Startup Dashboard</div>
        <h1 className="page-title">Opportunities for your venture</h1>
        <p className="page-desc">Funding, emerging technology, and patent intelligence relevant to building a startup here.</p>
      </div>

      {error && <Panel><p style={{ color: 'var(--text-dim)' }}>{error}</p></Panel>}

      {data && (
        <>
          {data.innovation_score && (
            <Panel label={`Innovation Score · ${data.innovation_score.domain}`} style={{ marginBottom: 20 }}>
              <ScoreGauge score={data.innovation_score.innovation_score} breakdown={data.innovation_score.breakdown} />
            </Panel>
          )}

          <div className="grid grid-2">
            <Panel label="Funding Opportunities">
              {data.funding_opportunities.length === 0 && <p className="empty-state">No matches yet.</p>}
              {data.funding_opportunities.map((rec) => (
                <div className="list-row" key={rec.opportunity.id}>
                  <div>
                    <div style={{ fontSize: 13.5 }}>{rec.opportunity.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{rec.opportunity.source}</div>
                  </div>
                  <span className="mono" style={{ color: 'var(--gold)', fontSize: 13 }}>{rec.match_score}%</span>
                </div>
              ))}
            </Panel>

            <Panel label="Emerging Technology Opportunities">
              {data.technology_opportunities.length === 0 && <p className="empty-state">No emerging/growing tech domains detected yet.</p>}
              {data.technology_opportunities.map((t) => (
                <div className="list-row" key={t.domain}>
                  <div>
                    <div style={{ fontSize: 13.5 }}>{t.domain}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{t.patent_count} patents tracked</div>
                  </div>
                  <span className="tag eligible">{t.maturity_stage}</span>
                </div>
              ))}
            </Panel>
          </div>

          <Panel label="Patent Intelligence" style={{ marginTop: 20 }}>
            {data.patent_intelligence.length === 0 && <p className="empty-state">No patents in the system yet.</p>}
            {data.patent_intelligence.map((c) => (
              <div className="list-row" key={c.technology_domain}>
                <span style={{ fontSize: 13.5 }}>{c.technology_domain}</span>
                <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>{c.patent_count} patents · avg {c.avg_citation_count} citations</span>
              </div>
            ))}
          </Panel>

          {data.commercialization_insights.length > 0 && (
            <Panel label="Commercialization Insights" style={{ marginTop: 20 }}>
              {data.commercialization_insights.map((r, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < data.commercialization_insights.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span className="tag gold">{r.category}</span>
                  <div style={{ fontSize: 14, marginTop: 6 }}>{r.recommendation}</div>
                </div>
              ))}
            </Panel>
          )}
        </>
      )}
    </>
  );
}
