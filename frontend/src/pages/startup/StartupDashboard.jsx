import React, { useState, useEffect } from 'react';
import { getStartupExecutiveDashboard } from '../../services/executiveDashboardService';
import { 
  FaRocket, 
  FaRegCopyright, 
  FaCoins, 
  FaChartLine, 
  FaSyncAlt, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaShieldAlt,
  FaSlidersH
} from 'react-icons/fa';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';

export default function StartupDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStartupExecutiveDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch startup dashboard:', err);
      setError(err.response?.data?.detail || 'Failed to connect to Startup Founder API.');
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
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-slate-400 animate-pulse tracking-wider uppercase">Loading Startup Founder Console...</p>
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

  const standing = data?.startup_standing || {};
  const radarObj = data?.commercialization_radar || {};
  const competitorWatch = data?.ip_competitor_watch || [];
  const fundingPipeline = data?.funding_pipeline || [];

  const radarData = [
    { subject: 'Tech Readiness (TRL)', value: radarObj.technology_readiness || 85 },
    { subject: 'Market Size Fit', value: radarObj.market_size_fit || 92 },
    { subject: 'IP Strength', value: radarObj.ip_strength || 88 },
    { subject: 'Regulatory Clearance', value: radarObj.regulatory_clearance || 78 },
    { subject: 'Team Capability', value: radarObj.team_capability || 90 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <FaRocket size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{standing.company_name || 'Startup Founder Console'}</h1>
              <p className="text-xs text-emerald-400 font-semibold">Technology Readiness & IP Commercialization Standing</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/startup/patents"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center gap-2"
          >
            <FaRegCopyright size={12} />
            <span>IP Landscape & Patents</span>
          </Link>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <FaSyncAlt size={12} />
            Refresh Standing
          </button>
        </div>
      </header>

      {/* Startup KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Technology Readiness Level</span>
            <FaSlidersH className="text-emerald-400" size={18} />
          </div>
          <p className="text-3xl font-black text-emerald-400">TRL {standing.trl_level} / 9</p>
          <p className="text-[11px] text-slate-400 truncate">{standing.trl_description}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Innovation Standing Score</span>
            <FaChartLine className="text-amber-400" size={18} />
          </div>
          <p className="text-3xl font-black text-amber-400">{standing.innovation_rank_score} / 100</p>
          <p className="text-[11px] text-slate-500 font-medium">Top 5% sector benchmark</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Investment Readiness Rating</span>
            <FaShieldAlt className="text-purple-400" size={18} />
          </div>
          <p className="text-3xl font-black text-purple-400">{standing.investment_rating}</p>
          <p className="text-[11px] text-slate-500 font-medium">Institutional VCs & Grants Target</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Patent Portfolio Watch</span>
            <FaRegCopyright className="text-amber-400" size={18} />
          </div>
          <p className="text-3xl font-black text-amber-400">{competitorWatch.length} Patents</p>
          <p className="text-[11px] text-slate-500 font-medium">Monitored Lens application filings</p>
        </div>
      </div>

      {/* Grid: Commercialization Radar & Competitor Watch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commercialization Radar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FaChartLine className="text-emerald-400" />
            <span>Commercialization Readiness Assessment Radar</span>
          </h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Startup Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competitor IP & Patent Timeline Watch */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FaRegCopyright className="text-purple-400" />
            <span>IP Competitor & Application Timeline Watch</span>
          </h2>
          <div className="space-y-3 pt-2">
            {competitorWatch.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-extrabold text-white leading-tight">{item.patent_title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                    item.status === 'Granted' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Assignee: <strong className="text-slate-200">{item.assignee}</strong></span>
                  <span>Filing Year: <strong className="text-slate-300">{item.filing_year}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Capital Grant Pipeline Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FaCoins className="text-amber-400" />
          <span>Non-Dilutive Grant Funding Application Pipeline</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Grant Name</th>
                <th className="py-3 px-4">Capital Amount</th>
                <th className="py-3 px-4">Application Status</th>
                <th className="py-3 px-4">Success Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {fundingPipeline.map((fund, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-bold text-white">{fund.grant}</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">${(fund.amount_usd / 1000).toFixed(0)}k USD</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                      {fund.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-purple-400">{fund.probability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
