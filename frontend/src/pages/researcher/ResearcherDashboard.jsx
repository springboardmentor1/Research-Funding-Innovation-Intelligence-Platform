import React, { useState, useEffect } from 'react';
import { getResearcherExecutiveDashboard } from '../../services/executiveDashboardService';
import { 
  FaUserGraduate, 
  FaBookOpen, 
  FaAward, 
  FaHandshake, 
  FaSyncAlt, 
  FaCoins, 
  FaSearch, 
  FaArrowRight,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function ResearcherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getResearcherExecutiveDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch researcher dashboard:', err);
      setError(err.response?.data?.detail || 'Failed to connect to Researcher API.');
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
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-slate-400 animate-pulse tracking-wider uppercase">Loading Researcher Dashboard...</p>
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

  const info = data?.researcher_info || {};
  const metrics = data?.bibliometrics || {};
  const grants = data?.grant_matches || [];
  const collaborators = data?.collaborator_recommendations || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Profile Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <FaUserGraduate size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{info.name || 'Researcher Dashboard'}</h1>
              <p className="text-xs text-amber-400 font-semibold">{info.organization} • {info.domain}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/publications"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center gap-2"
          >
            <FaSearch size={12} />
            <span>Sync OpenAlex Papers</span>
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

      {/* Bibliometric Standing KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">h-Index</span>
            <FaAward className="text-purple-400" size={18} />
          </div>
          <p className="text-3xl font-black text-purple-400">h-{metrics.h_index}</p>
          <p className="text-[11px] text-slate-500 font-medium">i10-index: {metrics.i10_index}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Citations</span>
            <FaBookOpen className="text-amber-400" size={18} />
          </div>
          <p className="text-3xl font-black text-amber-400">{metrics.total_citations?.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 font-medium">{metrics.publications_count} Published Works</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Annual Citation Velocity</span>
            <FaAward className="text-emerald-400" size={18} />
          </div>
          <p className="text-3xl font-black text-emerald-400">+{metrics.citation_velocity_annual}</p>
          <p className="text-[11px] text-slate-500 font-medium">Citations added past 12 months</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Grant Match</span>
            <FaCoins className="text-amber-400" size={18} />
          </div>
          <p className="text-3xl font-black text-amber-400">{grants.length} Calls</p>
          <p className="text-[11px] text-slate-500 font-medium">Top call: {grants[0]?.match_percentage}% match</p>
        </div>
      </div>

      {/* Grid: AI Grant Matches & Collaborator Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top AI Grant Opportunity Matches */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FaCoins className="text-purple-400" />
              <span>AI-Matched Grant Opportunities</span>
            </h2>
            <Link to="/funding" className="text-xs text-purple-400 font-bold hover:underline flex items-center gap-1">
              <span>View All</span>
              <FaArrowRight size={10} />
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            {grants.map((grant, idx) => (
              <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-extrabold text-white leading-tight">{grant.title}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 whitespace-nowrap">
                    {grant.match_percentage}% Match
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sponsor: <strong className="text-slate-200">{grant.sponsor}</strong></span>
                  <span>Pool: <strong className="text-emerald-400">${(grant.amount_usd / 1000000).toFixed(2)}M</strong></span>
                </div>
                <div className="text-[10px] text-slate-500">Deadline: {grant.deadline}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Collaborator Network */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FaHandshake className="text-amber-400" />
            <span>Recommended Collaborator Network</span>
          </h2>
          <div className="space-y-3 pt-2">
            {collaborators.map((collab, idx) => (
              <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-white">{collab.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                    {collab.alignment_score}% Match
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{collab.institution}</p>
                <div className="text-[10px] text-slate-500">
                  Overlap: <strong className="text-slate-300">{collab.shared_topics}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
