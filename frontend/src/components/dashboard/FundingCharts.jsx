import React from 'react';
import {
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
import { FaMoneyBillWave, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#64748b'];

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

export default function FundingCharts({ data }) {
  if (!data) return null;

  // 1. Timeline of Opportunities
  const timelineData = data.application_deadline_timeline?.timeline || [];

  // 2. Funding Type Distribution
  const typeData = data.funding_type_distribution || [];

  // 3. Top Agencies (Top 5)
  const agencyData = [...(data.top_funding_agencies || [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 4. Funding Amount Statistics
  const stats = data.funding_amount_statistics || {
    total_funding_amount: 0,
    average_funding_amount: 0,
    max_funding_amount: 0,
    min_funding_amount: 0,
  };

  const formattedStats = [
    {
      label: 'Total Funding Volume',
      value: `$${(stats.total_funding_amount / 1e9).toFixed(2)}B`,
      subtext: `$${stats.total_funding_amount?.toLocaleString()}`,
      icon: FaMoneyBillWave,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      label: 'Average Opportunity Size',
      value: `$${(stats.average_funding_amount / 1e3).toFixed(1)}K`,
      subtext: `$${stats.average_funding_amount?.toLocaleString()}`,
      icon: FaChartLine,
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      label: 'Max Grant Value',
      value: `$${(stats.max_funding_amount / 1e6).toFixed(1)}M`,
      subtext: `$${stats.max_funding_amount?.toLocaleString()}`,
      icon: FaArrowUp,
      color: 'text-purple-400 bg-purple-500/10',
    },
    {
      label: 'Min Grant Value',
      value: `$${(stats.min_funding_amount / 1e3).toFixed(0)}K`,
      subtext: `$${stats.min_funding_amount?.toLocaleString()}`,
      icon: FaArrowDown,
      color: 'text-amber-400 bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Funding Amount Statistics Cards */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[400px]">
        <h3 className="text-lg font-bold text-slate-100 mb-6">Funding Opportunity Valuation Metrics</h3>
        <div className="grid grid-cols-2 gap-4 flex-1">
          {formattedStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon size={16} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">{stat.subtext}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Agencies */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[400px]">
        <h3 className="text-lg font-bold text-slate-100 mb-6">Top Funding Agencies</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agencyData} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis 
                type="category" 
                dataKey="agency" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                width={120} 
                tickFormatter={(val) => val.length > 25 ? `${val.substring(0, 25)}...` : val}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Opportunities" radius={[0, 4, 4, 0]}>
                {agencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funding Opportunities Per Year */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[400px]">
        <h3 className="text-lg font-bold text-slate-100 mb-6">Opportunities By Expiration Year</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="opportunities" name="Opportunities" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funding Type Distribution */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[400px]">
        <h3 className="text-lg font-bold text-slate-100 mb-6">Funding Type Distribution</h3>
        <div className="flex-1 w-full min-h-[250px] flex flex-col justify-center">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="funding_type"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            {typeData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 justify-center">
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-[10px] font-medium text-slate-400 truncate max-w-[80px]" title={item.funding_type}>
                  {item.funding_type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
