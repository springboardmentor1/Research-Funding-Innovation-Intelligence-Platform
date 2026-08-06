import { useEffect, useState } from 'react';
import client from '../api/client';
import Panel from '../components/Panel';

const SEVERITY_TAG = { high: 'ineligible', medium: 'gold', low: 'eligible' };

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/api/notifications/alerts')
      .then((res) => setAlerts(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Could not load alerts.'));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Notification & Alert System</div>
        <h1 className="page-title">Alerts</h1>
        <p className="page-desc">Funding, patent, and technology alerts computed from your research profile.</p>
      </div>

      {error && <Panel><p style={{ color: 'var(--text-dim)' }}>{error}</p></Panel>}

      <Panel>
        {alerts?.length === 0 && <p className="empty-state">No alerts right now.</p>}
        {alerts?.map((a, i) => (
          <div key={i} style={{ padding: '14px 0', borderBottom: i < alerts.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ fontSize: 14 }}>{a.title}</div>
              <span className={'tag ' + (SEVERITY_TAG[a.severity] || '')}>{a.severity}</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-faint)', marginTop: 4 }}>{a.detail}</div>
          </div>
        ))}
      </Panel>
    </>
  );
}
