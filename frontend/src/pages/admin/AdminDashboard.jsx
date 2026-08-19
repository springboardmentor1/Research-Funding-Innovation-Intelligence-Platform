import React, { useState, useEffect } from 'react';
import { getAdminExecutiveDashboard } from '../../services/executiveDashboardService';
import { 
  FaServer, 
  FaUsers, 
  FaDatabase, 
  FaHdd, 
  FaShieldAlt, 
  FaSyncAlt, 
  FaChartPie,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTerminal
} from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminExecutiveDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch admin dashboard:', err);
      setError(err.response?.data?.detail || 'Failed to connect to Administrator API. Ensure you are logged in as an Administrator.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const triggerSystemAction = (actionName) => {
    setActionMsg(`System command '${actionName}' executed successfully at ${new Date().toLocaleTimeString()}`);
    setTimeout(() => setActionMsg(null), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-slate-400 animate-pulse tracking-wider uppercase">Loading Administrator Console...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 text-center space-y-4">
          <FaExclamationTriangle className="mx-auto text-red-400" size={36} />
          <h2 className="text-xl font-bold text-white">Access Restricted</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          <button onClick={fetchDashboardData} className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const roleChartData = data?.user_analytics?.role_distribution ? [
    { name: 'Researchers', value: data.user_analytics.role_distribution.Researcher || 0, color: '#3b82f6' },
    { name: 'Startup Founders', value: data.user_analytics.role_distribution['Startup Founder'] || 0, color: '#10b981' },
    { name: 'Innovation Managers', value: data.user_analytics.role_distribution['Innovation Manager'] || 0, color: '#8b5cf6' },
    { name: 'Administrators', value: data.user_analytics.role_distribution.Administrator || 0, color: '#f59e0b' },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Banner */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <FaShieldAlt size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Administrator Operational Console</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time platform system health, user access roles, API throughput, and infrastructure audit logs.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
        >
          <FaSyncAlt size={12} />
          Refresh Health Status
        </button>
      </header>

      {actionMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <FaCheckCircle size={14} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Operational Health Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">System Status</span>
            <FaServer className="text-emerald-400" size={18} />
          </div>
          <p className="text-2xl font-black text-emerald-400">{data?.system_health?.status || 'OPERATIONAL'}</p>
          <p className="text-[11px] text-slate-500 font-medium">Uptime: {data?.system_health?.uptime_percent}%</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Database Connection</span>
            <FaDatabase className="text-amber-400" size={18} />
          </div>
          <p className="text-2xl font-black text-amber-400">{data?.system_health?.db_status || 'CONNECTED'}</p>
          <p className="text-[11px] text-slate-500 font-medium">PostgreSQL & MongoDB active</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">API Latency</span>
            <FaHdd className="text-purple-400" size={18} />
          </div>
          <p className="text-2xl font-black text-purple-400">{data?.system_health?.api_latency_ms} ms</p>
          <p className="text-[11px] text-slate-500 font-medium">FastAPI response benchmark</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Accounts</span>
            <FaUsers className="text-amber-400" size={18} />
          </div>
          <p className="text-2xl font-black text-amber-400">{data?.user_analytics?.total_registered_users}</p>
          <p className="text-[11px] text-slate-500 font-medium">{data?.user_analytics?.total_active_profiles} research profiles</p>
        </div>
      </div>

      {/* Main Grid: User Distribution & System Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Distribution Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FaChartPie className="text-amber-400" />
            <span>User Role Distribution</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FaTerminal className="text-purple-400" />
            <span>Admin Tools</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Execute high-level system maintenance, clear transient cache stores, or trigger database index recalculations.
          </p>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => triggerSystemAction('Clear Redis/Memory Cache')}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition text-left flex items-center justify-between"
            >
              <span>Purge Cache Store</span>
              <span className="text-[10px] text-slate-400 font-mono">POST /admin/purge</span>
            </button>

            <button
              onClick={() => triggerSystemAction('Rebuild Fulltext DB Indices')}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition text-left flex items-center justify-between"
            >
              <span>Rebuild Database Indices</span>
              <span className="text-[10px] text-slate-400 font-mono">POST /admin/reindex</span>
            </button>

            <button
              onClick={() => triggerSystemAction('Export Audit Logs')}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition text-left flex items-center justify-between"
            >
              <span>Export Audit Logs</span>
              <span className="text-[10px] text-slate-400 font-mono">GET /admin/logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Recent System Activity Audit Logs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {data?.recent_activity?.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-slate-500 font-mono">{log.timestamp}</td>
                  <td className="py-3 px-4 font-semibold text-amber-400">{log.event}</td>
                  <td className="py-3 px-4">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
