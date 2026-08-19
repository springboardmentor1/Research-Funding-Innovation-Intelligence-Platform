import React, { useState, useEffect } from 'react';
import { getManagerExecutiveDashboard } from '../../services/executiveDashboardService';
import { 
  FaBuilding, 
  FaFileContract, 
  FaCoins, 
  FaLightbulb, 
  FaSyncAlt, 
  FaChartBar, 
  FaUserGraduate,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Link } from 'react-router-dom';

export default function InnovationManagerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getManagerExecutiveDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch manager dashboard:', err);
      setError(err.response?.data?.detail || 'Failed to connect to Innovation Manager API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-slate-400 animate-pulse tracking-wider uppercase">Loading Innovation Manager Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 text-center space-y-4">
          <FaExclamationTriangle className="mx-auto text-red-400" size={36} />
          <h2 className="text-xl font-bold text-white">Access Forbidden</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          <button onClick={fetchDashboardData} className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const kpis = data?.summary_kpis || {};
  const pipeline = data?.tech_transfer_pipeline || [];
  const deptData = data?.departmental_readiness || [];
  const topInventors = data?.top_inventors || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <FaBuilding size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Innovation Manager Executive Console</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Institutional Technology Transfer Office (TTO) pipeline, patent disclosures, commercial licensing, and royalties.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/manager/reports"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center gap-2"
          >
            <span>Reports Generator</span>
            <FaArrowRight size={10} />
          </Link>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <FaSyncAlt size={12} />
            Refresh TTO
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Commercial Licenses</span>
            <FaFileContract className="text-emerald-400" size={18} />
          </div>
          <p className="text-3xl font-black text-emerald-400">{kpis.active_licenses}</p>
          <p className="text-[11px] text-slate-500 font-medium">Revenue generating agreements</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Royalties</span>
            <FaCoins className="text-purple-400" size={18} />
          </div>
          <p className="text-3xl font-black text-purple-400">${(kpis.total_royalties_usd / 1000000).toFixed(2)}M</p>
          <p className="text-[11px] text-slate-500 font-medium">Accumulated institutional return</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Disclosure Queue</span>
            <FaLightbulb className="text-amber-400" size={18} />
          </div>
          <p className="text-3xl font-black text-amber-400">{kpis.pending_disclosures}</p>
          <p className="text-[11px] text-slate-500 font-medium">Pending TTO review & audit</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Commercialized Patents</span>
            <FaCheckCircle className="text-amber-400" size={18} />
          </div>
          <p className="text-3xl font-black text-amber-400">{kpis.total_commercialized_patents}</p>
          <p className="text-[11px] text-slate-500 font-medium">Transferred to industry partners</p>
        </div>
      </div>

      {/* Tech Transfer Pipeline Stages */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FaFileContract className="text-emerald-400" />
          <span>Technology Transfer Pipeline Stages</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {pipeline.map((stage, idx) => (
            <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Stage {idx + 1}</div>
              <h3 className="text-sm font-bold text-white">{stage.stage}</h3>
              <p className="text-2xl font-black text-slate-200">{stage.count}</p>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-medium border border-purple-500/20">
                {stage.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Departmental Readiness & Top Inventors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Departmental Readiness Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FaChartBar className="text-amber-400" />
            <span>Departmental Technology Readiness (TRL) & Patent Portfolio</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="department" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Legend />
                <Bar dataKey="patents" name="Patents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="disclosures" name="Disclosures" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Inventors List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FaUserGraduate className="text-amber-400" />
            <span>Top Institutional Inventors</span>
          </h2>
          <div className="space-y-3 pt-2">
            {topInventors.map((inv, idx) => (
              <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{inv.inventor}</h4>
                  <span className="text-[10px] text-amber-400 font-bold">{inv.licenses} Licenses</span>
                </div>
                <p className="text-[11px] text-slate-400">{inv.department}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{inv.patents} Total Patents</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
