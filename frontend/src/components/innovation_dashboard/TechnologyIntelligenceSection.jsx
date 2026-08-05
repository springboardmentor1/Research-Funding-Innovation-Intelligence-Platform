import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { FiCpu, FiTrendingUp, FiZap } from 'react-icons/fi';

export default function TechnologyIntelligenceSection({ techData }) {
  if (!techData) return null;

  const maturityData = techData.maturity_distribution_chart || [
    { status: 'Emerging', count: 1 },
    { status: 'Growing', count: 0 },
    { status: 'Mature', count: 2 },
    { status: 'Declining', count: 22 }
  ];

  const leaderboard = techData.emerging_technology_leaderboard || [
    { technology: 'Natural Language Processing', growth_percentage: 29.03, maturity_stage: 'Emerging', patent_volume: 200 }
  ];

  const momentumRadar = (techData.momentum_radar || []).slice(0, 6);

  return (
    <div className="mb-10" data-testid="TechnologyIntelligenceSection">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-cyan-500"></span>
          Technology Intelligence Engine
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technology Maturity Stages */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <FiCpu className="text-cyan-400" />
            Technology Lifecycle Stages
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maturityData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="status" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Momentum Leaderboard */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <FiZap className="text-amber-400" />
            Emerging & Momentum Leaderboard
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {leaderboard.length > 0 ? (
              leaderboard.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">{item.technology}</span>
                    <span className="text-xs text-slate-400">Patent Volume: {item.patent_volume}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      +{item.growth_percentage}% Growth
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">{item.maturity_stage}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic">No emerging technologies detected.</div>
            )}
          </div>
        </div>

        {/* Momentum Scores */}
        {momentumRadar.length > 0 && (
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-emerald-400" />
              Technology Domain Momentum Index
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {momentumRadar.map((domain, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  <span className="text-xs text-slate-400 block truncate">{domain.domain}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-slate-200">{domain.momentum_score}/100</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {domain.momentum_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
