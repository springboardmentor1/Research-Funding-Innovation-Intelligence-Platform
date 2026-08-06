import { useEffect, useState } from 'react';
import client from '../api/client';
import Panel from '../components/Panel';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');

  function load() {
    Promise.all([
      client.get('/api/admin/platform-stats'),
      client.get('/api/admin/users'),
    ])
      .then(([s, u]) => {
        setStats(s.data);
        setUsers(u.data);
      })
      .catch((err) => setError(err.response?.data?.detail || 'Could not load admin data.'));
  }

  useEffect(load, []);

  async function toggleActive(user) {
    const action = user.is_active ? 'deactivate' : 'activate';
    await client.patch(`/api/admin/users/${user.id}/${action}`);
    load();
  }

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Admin Dashboard</div>
        <h1 className="page-title">Platform administration</h1>
        <p className="page-desc">User management and platform-wide analytics.</p>
      </div>

      {error && <Panel><p style={{ color: 'var(--text-dim)' }}>{error}</p></Panel>}

      {stats && (
        <div className="grid grid-3" style={{ marginBottom: 20 }}>
          <Panel>
            <div className="stat-value">{stats.total_users}</div>
            <div className="stat-label">total users</div>
          </Panel>
          <Panel>
            <div className="stat-value">{stats.total_funding_opportunities}</div>
            <div className="stat-label">funding opportunities</div>
          </Panel>
          <Panel>
            <div className="stat-value">{stats.total_patents}</div>
            <div className="stat-label">patents tracked</div>
          </Panel>
        </div>
      )}

      {stats && (
        <Panel label="Users by role" style={{ marginBottom: 20 }}>
          {Object.entries(stats.users_by_role).map(([role, count]) => (
            <div className="list-row" key={role}>
              <span style={{ fontSize: 13.5, textTransform: 'capitalize' }}>{role.replace('_', ' ')}</span>
              <span className="mono" style={{ color: 'var(--gold)', fontSize: 13 }}>{count}</span>
            </div>
          ))}
        </Panel>
      )}

      <Panel label="User management">
        {users?.length === 0 && <p className="empty-state">No users found.</p>}
        {users?.map((u) => (
          <div className="list-row" key={u.id}>
            <div>
              <div style={{ fontSize: 13.5 }}>{u.full_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{u.email} · {u.role.replace('_', ' ')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={'tag ' + (u.is_active ? 'eligible' : 'ineligible')}>{u.is_active ? 'Active' : 'Inactive'}</span>
              <button className="btn-ghost btn" onClick={() => toggleActive(u)}>
                {u.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </Panel>
    </>
  );
}
