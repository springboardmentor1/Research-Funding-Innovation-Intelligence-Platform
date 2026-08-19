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
import { FiAward, FiPieChart, FiStar } from 'react-icons/fi';

export default function InnovationScoringSection({ innovData }) {
  if (!innovData) return null;

  const scoreDist = innovData.score_distribution_chart || [
    { classification: 'Excellent', count: 0 },
    { classification: 'Strong', count: 0 },
    { classification: 'Moderate', count: 3 },
    { classification: 'Weak', count: 22 }
  ];

  const investCat = innovData.investment_category_breakdown || [
    { category: 'Immediate Investment', count: 0 },
    { category: 'Strategic Monitoring', count: 0 },
    { category: 'Future Research', count: 3 },
    { category: 'Maintain Baseline', count: 22 }
  ];

  const summaryKpis = innovData.summary_kpis || {};

  return (
    <div className="mb-10" data-testid="InnovationScoringSection">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-violet-500"></span>
          Innovation Scoring Workflow
        </h2>
        <span className="text-xs text-slate-400 font-mono">
          Top Domain: {summaryKpis.highest_scoring_domain || 'Natural Language Processing'} ({summaryKpis.highest_overall_score || 55.4}/100)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Innovation Score Distribution */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <FiAward className="text-violet-400" />
            Innovation Score Classification
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDist} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="classification" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investment Category Breakdown */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <FiPieChart className="text-indigo-400" />
            Investment Readiness Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={investCat} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} angle={-10} textAnchor="end" />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Metric Callouts */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <FiStar className="text-yellow-400" />
            Innovation Evaluation Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Evaluated Technology Domains</span>
              <span className="text-lg font-extrabold text-slate-100 block">
                {summaryKpis.total_domains_evaluated ?? 25}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Low Risk Technology Count</span>
              <span className="text-lg font-extrabold text-emerald-400 block">
                {summaryKpis.low_risk_domains_count ?? 0}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Immediate Investment Opportunities</span>
              <span className="text-lg font-extrabold text-amber-400 block">
                {summaryKpis.immediate_investment_count ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
