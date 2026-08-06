import { useEffect, useState } from 'react';
import client from '../api/client';
import Panel from '../components/Panel';
import { downloadFile } from '../api/download';

export default function PatentsPage() {
  const [clusters, setClusters] = useState(null);
  const [trends, setTrends] = useState(null);
  const [competitors, setCompetitors] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      client.get('/api/patents/clusters'),
      client.get('/api/patents/trends'),
      client.get('/api/patents/competitors'),
    ])
      .then(([c, t, comp]) => {
        setClusters(c.data);
        setTrends(t.data);
        setCompetitors(comp.data);
      })
      .catch((err) => setError(err.response?.data?.detail || 'Could not load patent data.'));
  }, []);

  const maxTrend = trends ? Math.max(...trends.map((t) => t.count), 1) : 1;
  const maxCluster = clusters ? Math.max(...clusters.map((c) => c.patent_count), 1) : 1;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <div className="page-eyebrow">Patent Landscape Analysis</div>
          <h1 className="page-title">Patent intelligence</h1>
          <p className="page-desc">Clustering, filing trends, and competitor activity across the patent database.</p>
        </div>
        <button
          className="btn-ghost btn"
          onClick={() => downloadFile('/api/reports/patents.csv', 'patent_report.csv')}
          style={{ flexShrink: 0 }}
        >
          Export CSV
        </button>
      </div>

      {error && <Panel><p style={{ color: 'var(--text-dim)' }}>{error}</p></Panel>}

      <div className="grid grid-2">
        <Panel label="Technology clusters">
          {clusters?.length === 0 && <p className="empty-state">No patents in the system yet.</p>}
          {clusters?.map((c) => (
            <div key={c.technology_domain} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span>{c.technology_domain}</span>
                <span className="mono" style={{ color: 'var(--text-dim)' }}>{c.patent_count} patents</span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 5 }}>
                <div style={{
                  height: '100%', width: `${(c.patent_count / maxCluster) * 100}%`,
                  background: 'var(--gold)', borderRadius: 2,
                }} />
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 3 }}>
                avg {c.avg_citation_count} citations
              </div>
            </div>
          ))}
        </Panel>

        <Panel label="Filing trend by year">
          {trends?.length === 0 && <p className="empty-state">No dated patents yet.</p>}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
            {trends?.map((t) => (
              <div key={t.year} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  height: `${(t.count / maxTrend) * 110}px`, background: 'var(--teal)',
                  opacity: 0.75, borderRadius: '2px 2px 0 0',
                }} />
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>{t.year}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel label="Top competitors by patent activity" style={{ marginTop: 20 }}>
        {competitors?.length === 0 && <p className="empty-state">No patents in the system yet.</p>}
        {competitors?.map((c, i) => (
          <div className="list-row" key={c.assignee}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span className="mono" style={{ color: 'var(--text-faint)', width: 20 }}>{i + 1}</span>
              <span style={{ fontSize: 13.5 }}>{c.assignee}</span>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>{c.patent_count} patents</span>
              <span className="mono" style={{ fontSize: 12.5, color: 'var(--gold)' }}>{c.total_citations} citations</span>
            </div>
          </div>
        ))}
      </Panel>
    </>
  );
}
