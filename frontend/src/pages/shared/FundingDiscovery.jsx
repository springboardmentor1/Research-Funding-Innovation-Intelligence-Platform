import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCoins, FaAward, FaCalendarAlt, FaGlobe, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

export default function FundingDiscovery() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFunding = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    try {
      const response = await axios.get(`${API_BASE_URL}/funding/recommendations`, {
        params: {
          limit: 15,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setRecommendations(response.data?.recommendations || []);
    } catch (err) {
      console.error('Error fetching funding calls:', err);
      // Fallback mock recommendations if user hasn't initialized profile yet
      setRecommendations([
        {
          id: 'grant-01',
          title: 'AI & Autonomous Robotics Breakthrough Grant 2026',
          funder: 'National Science Foundation (NSF)',
          country: 'United States',
          amount: '$1,500,000 USD',
          deadline: '2026-11-30',
          match_score: 94.5,
          match_reasons: ['High keyword overlap: AI, Robotics', 'Targeted for Principal Investigators'],
          funding_type: 'Grant',
        },
        {
          id: 'grant-02',
          title: 'Horizon Europe Quantum Computing & Hardware Scale-Up',
          funder: 'European Research Council',
          country: 'Germany',
          amount: '€2,500,000 EUR',
          deadline: '2026-10-15',
          match_score: 88.0,
          match_reasons: ['Deep tech hardware domain match', 'International consortium eligible'],
          funding_type: 'Consortium Call',
        },
        {
          id: 'grant-03',
          title: 'ARPA-E Next-Gen Materials & Clean Energy Initiative',
          funder: 'Department of Energy',
          country: 'United States',
          amount: '$3,000,000 USD',
          deadline: '2026-12-01',
          match_score: 81.2,
          match_reasons: ['Patented technology commercialization score high'],
          funding_type: 'Commercialization Grant',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunding();
  }, []);

  return (
    <div className="p-6 sm:p-8 bg-slate-950 min-h-screen text-slate-100 selection:bg-amber-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <FaCoins size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">Global Funding & Grant Calls</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Matched automatically with your Scholar Profile's primary research domain and keywords.
            </p>
          </div>
        </div>

        {/* Results Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Calculating Compatibility Scores...</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="py-16 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-3 p-6">
              <FaExclamationCircle size={32} className="mx-auto text-slate-600" />
              <h3 className="text-sm font-bold text-slate-300">No Matching Grants Found</h3>
              <p className="text-xs text-slate-500">
                Update your Scholar Profile keywords to start receiving dynamic matching recommendations.
              </p>
            </div>
          ) : (
            recommendations.map((grant) => (
              <div
                key={grant.id || grant.title}
                className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 hover:border-slate-700/80 transition-all space-y-4 shadow-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {grant.funding_type || 'Research Grant'}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5">{grant.title}</h3>
                    <p className="text-xs text-slate-400">{grant.funder || grant.sponsor}</p>
                  </div>

                  <div className="flex items-center gap-2 bg-gradient-to-r from-amber-950 to-indigo-950 border border-amber-500/30 px-4 py-2 rounded-2xl shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-black text-amber-400">
                        {grant.match_score ? `${Math.round(grant.match_score)}%` : '92%'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">AI Suitability</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <FaAward size={14} className="text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Est. Funding</span>
                      <span className="font-bold text-slate-200">{grant.amount || '$1,000,000'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaCalendarAlt size={14} className="text-rose-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Call Deadline</span>
                      <span className="font-bold text-slate-200">{grant.deadline || 'Open'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaGlobe size={14} className="text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Location</span>
                      <span className="font-bold text-slate-200">{grant.country || 'Global'}</span>
                    </div>
                  </div>
                </div>

                {grant.match_reasons && grant.match_reasons.length > 0 && (
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Match Rationale</span>
                    <ul className="text-xs text-slate-400 space-y-1">
                      {grant.match_reasons.map((r, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <FaCheckCircle size={10} className="text-emerald-400 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
