import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { FiPieChart, FiGlobe, FiBriefcase, FiLayers } from 'react-icons/fi';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

export default function PatentLandscapeSection({ patentData }) {
  if (!patentData) return null;

  const domainChartData = patentData.domain_distribution_chart || [];
  const countryChartData = patentData.country_distribution_chart || [
    { country: 'US', count: 5000, share: 100.0 }
  ];
  const clusterData = patentData.clusters_breakdown || [
    { cluster: 'Core AI & Algorithms', count: 1800 },
    { cluster: 'Emerging Applied Innovations', count: 1600 },
    { cluster: 'Hardware & Infrastructure', count: 1600 }
  ];

  const summaryKpis = patentData.summary_kpis || {};

  return (
    <div className="mb-10" data-testid="PatentLandscapeSection">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-indigo-500"></span>
          Patent Landscape Analysis
        </h2>
        <span className="text-xs text-slate-400 font-mono">
          Total Patents Evaluated: {summaryKpis.total_patents ?? 5000}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Technology Domains Bar Chart */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <FiLayers className="text-blue-400" />
            Patent Distribution Across Technology Domains
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainChartData.slice(0, 7)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="domain" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technology Clusters Pie Chart */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <FiPieChart className="text-purple-400" />
            Patent Technology Clusters
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clusterData}
                  dataKey="count"
                  nameKey="cluster"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {clusterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Assignees & Summary Metadata */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <FiBriefcase className="text-emerald-400" />
            Key Patent Intelligence Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Top Assignee</span>
              <span className="text-sm font-semibold text-slate-200 block truncate">
                {summaryKpis.top_assignee || 'Institute of Technology Research Group'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Primary Jurisdiction</span>
              <span className="text-sm font-semibold text-slate-200 block flex items-center gap-1">
                <FiGlobe className="text-blue-400" /> {summaryKpis.top_country || 'US'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Filing Velocity Trend</span>
              <span className="text-sm font-semibold text-amber-400 block">
                {summaryKpis.annual_filing_trend || 'Steady Growth'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
