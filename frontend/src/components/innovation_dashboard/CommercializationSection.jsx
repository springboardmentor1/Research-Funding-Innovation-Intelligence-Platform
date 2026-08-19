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
import { FiBriefcase, FiDollarSign, FiClock } from 'react-icons/fi';

export default function CommercializationSection({ commData }) {
  if (!commData) return null;

  const strategyDist = commData.strategy_distribution || [
    { strategy: 'Startup Incubation', count: 1 },
    { strategy: 'Strategic Partnership', count: 2 },
    { strategy: 'Continue R&D', count: 22 }
  ];

  const priorityDist = commData.investment_priority_chart || [
    { priority: 'High Priority', count: 1 },
    { priority: 'Medium Priority', count: 2 },
    { priority: 'Low Priority', count: 22 }
  ];

  const summaryKpis = commData.summary_kpis || {};

  return (
    <div className="mb-10" data-testid="CommercializationSection">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
          Commercialization Recommendations
        </h2>
        <span className="text-xs text-slate-400 font-mono">
          Top Commercial Domain: {summaryKpis.top_commercialization_domain || 'Natural Language Processing'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commercialization Strategies Bar Chart */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <FiBriefcase className="text-emerald-400" />
            Recommended Pathway Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyDist} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="strategy" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} angle={-10} textAnchor="end" />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investment Priority Distribution */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <FiDollarSign className="text-yellow-400" />
            Investment Priority Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityDist} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="priority" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commercialization Summary Highlights */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <FiClock className="text-orange-400" />
            Technology Transfer & Deployment Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">High Investment Priority Count</span>
              <span className="text-lg font-extrabold text-amber-400 block">
                {summaryKpis.high_investment_priority_count ?? 1}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Ready for Technology Transfer</span>
              <span className="text-lg font-extrabold text-emerald-400 block">
                {summaryKpis.ready_for_transfer_count ?? 2}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Short-Term Deployment Timeline</span>
              <span className="text-lg font-extrabold text-yellow-400 block">
                {summaryKpis.short_term_timeline_count ?? 2}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
