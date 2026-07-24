import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#f43f5e', '#64748b'];

// Custom Tooltip component for styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="text-sm font-bold" style={{ color: item.color || item.payload.fill }}>
            {item.name}: {item.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PublicationCharts({ data }) {
  if (!data) return null;

  // 1. Publications per Year (Filter from 2000 onwards for display readability)
  const yearlyData = (data.publications_per_year || [])
    .filter((item) => item.year >= 2000)
    .sort((a, b) => a.year - b.year);

  // 2. Research Domain Distribution (Top 8 domains)
  const domainData = [...(data.publications_by_domain || [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 3. Open Access Distribution
  const oaData = data.open_access_distribution || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Publications Per Year */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[400px]">
        <h3 className="text-lg font-bold text-slate-100 mb-6">Publications Per Year (Since 2000)</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pubAreaColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                name="Publications" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#pubAreaColor)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Research Domain Distribution */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[400px]">
        <h3 className="text-lg font-bold text-slate-100 mb-6">Top Research Domains</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={domainData} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis type="category" dataKey="domain" stroke="#64748b" fontSize={11} tickLine={false} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Publications" radius={[0, 4, 4, 0]}>
                {domainData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Open Access Distribution */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[400px]">
        <h3 className="text-lg font-bold text-slate-100 mb-6">Open Access Distribution</h3>
        <div className="flex-1 w-full min-h-[250px] flex flex-col justify-center">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={oaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                >
                  {oaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            {oaData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span 
                  className="w-3.5 h-3.5 rounded-full" 
                  style={{ backgroundColor: idx === 0 ? '#10b981' : '#f43f5e' }}
                />
                <span className="text-xs font-semibold text-slate-300">
                  {item.status}: {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
