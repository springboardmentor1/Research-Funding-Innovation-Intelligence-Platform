// Admin dashboard: user management + platform statistics.
// Route-gated to role "admin" in App.jsx; the backend enforces it too.

import { api } from "../api/client";
import { useApi } from "../lib/useApi";
import { Spinner, ErrorBox, StatCard } from "../components/common";

export default function Admin() {
  const stats = useApi(() => api.admin.stats(), []);
  const users = useApi(() => api.admin.users(), []);

  return (
    <div>
      <h1 className="page-title">Admin</h1>
      <p className="page-sub">Platform overview and user management.</p>

      {/* platform stats */}
      {stats.loading ? <Spinner /> :
       stats.error ? <ErrorBox error={stats.error} onRetry={stats.reload} /> :
       (
        <>
          <div className="grid grid-4" style={{ marginBottom: 20 }}>
            <StatCard label="Total Users" value={stats.data.users.total} />
            <StatCard label="Patents" value={stats.data.data.patents.toLocaleString()} />
            <StatCard label="Publications" value={stats.data.data.publications.toLocaleString()} />
            <StatCard label="Funding Opps" value={stats.data.data.funding_opportunities.toLocaleString()} />
          </div>

          <div className="card">
            <div className="card-title">Users by Role</div>
            <div className="grid grid-4">
              {Object.entries(stats.data.users.by_role).map(([role, count]) => (
                <StatCard key={role} label={role.replace(/_/g, " ")} value={count} />
              ))}
            </div>
          </div>
        </>
       )}

      {/* user table */}
      <div className="card">
        <div className="card-title">All Users</div>
        {users.loading ? <Spinner /> :
         users.error ? <ErrorBox error={users.error} onRetry={users.reload} /> :
         (
          <table className="data">
            <thead>
              <tr><th>ID</th><th>Email</th><th>Name</th><th>Role</th><th>Status</th></tr>
            </thead>
            <tbody>
              {users.data.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.full_name || "-"}</td>
                  <td><span className="role-badge">{u.role}</span></td>
                  <td style={{ color: u.is_active ? "#22d3aa" : "#f87171" }}>
                    {u.is_active ? "active" : "inactive"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         )}
      </div>
    </div>
  );
}
