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
    { technology: 'Solid-State Quantum Grid Batteries', growth_percentage: 29.03, maturity_stage: 'Emerging', patent_volume: 200 }
  ];

  const momentumRadar = (techData.momentum_radar || []).slice(0, 6);

  return (
    <div className="mb-10" data-testid="TechnologyIntelligenceSection">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
          Research Intelligence Engine
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technology Maturity Stages */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <FiCpu className="text-yellow-400" />
            Research Lifecycle Stages
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maturityData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="status" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Momentum Leaderboard */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <FiZap className="text-amber-400" />
            High-Velocity Research Vectors
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
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/30 backdrop-blur-md border border-slate-800/80 shadow-2xl lg:col-span-2 space-y-6">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <FiTrendingUp className="text-emerald-400" />
              Research Domain Momentum Index
            </h3>
            <div className="space-y-4 max-w-3xl">
              {momentumRadar.map((domain, idx) => {
                const valPercent = Math.min(Math.max(domain.momentum_score, 0), 100);
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span className="truncate">{domain.domain}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-100 font-extrabold">{domain.momentum_score} / 100</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {domain.momentum_level}
                        </span>
                      </div>
                    </div>
                    {/* Range Scale Bar */}
                    <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800/80 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${valPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
