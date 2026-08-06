import { useEffect, useState } from 'react';
import client from '../api/client';
import Panel from '../components/Panel';
import ScoreGauge from '../components/ScoreGauge';
import { downloadFile } from '../api/download';

export default function InnovationPage() {
  const [score, setScore] = useState(null);
  const [recs, setRecs] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      client.get('/api/innovation/score'),
      client.get('/api/innovation/commercialization'),
    ])
      .then(([s, r]) => {
        setScore(s.data);
        setRecs(r.data);
      })
      .catch((err) => setError(err.response?.data?.detail || 'Could not compute innovation score.'));
  }, []);

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <div className="page-eyebrow">Innovation Scoring Engine</div>
          <h1 className="page-title">Your innovation score</h1>
          <p className="page-desc">
            Weighted across research novelty, patent strength, technology maturity, market potential, and funding relevance.
          </p>
        </div>
        <button
          className="btn-ghost btn"
          onClick={() => downloadFile('/api/reports/innovation.pdf', 'innovation_report.pdf')}
          style={{ flexShrink: 0 }}
        >
          Download PDF report
        </button>
      </div>

      {error && (
        <Panel><p style={{ color: 'var(--text-dim)' }}>{error}</p></Panel>
      )}

      {score && (
        <Panel label={`Domain: ${score.domain} · ${score.maturity_stage}`} style={{ marginBottom: 24 }}>
          <ScoreGauge score={score.innovation_score} breakdown={score.breakdown} />
        </Panel>
      )}

      {recs && (
        <Panel label="Commercialization recommendations">
          {recs.map((r, i) => (
            <div key={i} style={{ padding: '14px 0', borderBottom: i < recs.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span className="tag gold">{r.category}</span>
              <div style={{ fontSize: 14.5, marginTop: 8 }}>{r.recommendation}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-faint)', marginTop: 4 }}>{r.rationale}</div>
            </div>
          ))}
        </Panel>
      )}
    </>
  );
}
