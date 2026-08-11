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
import { FaInfoCircle } from 'react-icons/fa';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#f43f5e', '#64748b'];

// Custom Tooltip component with high contrast
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl z-50">
        <p className="text-xs font-bold text-slate-300 mb-1 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="text-xs font-extrabold flex items-center justify-between gap-4 mt-1" style={{ color: item.color || item.payload.fill || '#3b82f6' }}>
            <span>{item.name}:</span>
            <span>{item.value?.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PublicationCharts({ data }) {
  if (!data) return null;

  // 1. Publications per Year (Filter from 2000 onwards)
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
      
      {/* 1. Publications Per Year */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[420px] shadow-xl">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-100">Annual Publication Velocity</h3>
            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">
              OpenAlex Index
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <FaInfoCircle size={11} className="text-slate-500 shrink-0" />
            <span>Volume of peer-reviewed papers published per year.</span>
          </p>
        </div>

        <div className="flex-1 w-full min-h-[250px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pubAreaColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="year" stroke="#cbd5e1" fontSize={11} fontWeight={600} tickLine={false} />
              <YAxis stroke="#cbd5e1" fontSize={11} fontWeight={600} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                name="Publications" 
                stroke="#60a5fa" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#pubAreaColor)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Research Domain Distribution */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[420px] shadow-xl">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-100">Top Research Domains</h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
              Field Density
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <FaInfoCircle size={11} className="text-slate-500 shrink-0" />
            <span>Distribution of papers across key scientific disciplines.</span>
          </p>
        </div>

        <div className="flex-1 w-full min-h-[250px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={domainData} layout="vertical" margin={{ top: 0, right: 15, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#cbd5e1" fontSize={11} fontWeight={600} tickLine={false} />
              <YAxis 
                type="category" 
                dataKey="domain" 
                stroke="#e2e8f0" 
                fontSize={11} 
                fontWeight={600} 
                tickLine={false} 
                width={170}
                tickFormatter={(val) => (val && val.length > 22 ? `${val.substring(0, 22)}...` : val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Papers" radius={[0, 6, 6, 0]}>
                {domainData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Open Access Distribution */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[420px] shadow-xl">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-100">Open Access Availability</h3>
            <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full font-bold border border-purple-500/20">
              License Breakdown
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <FaInfoCircle size={11} className="text-slate-500 shrink-0" />
            <span>Ratio of freely accessible papers vs subscription journals.</span>
          </p>
        </div>

        <div className="flex-1 w-full min-h-[250px] mt-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={oaData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="count"
                nameKey="status"
              >
                {oaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.status?.includes('Open') ? '#10b981' : '#f43f5e'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                align="center" 
                iconType="circle"
                wrapperStyle={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '600', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-200 font-bold text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
