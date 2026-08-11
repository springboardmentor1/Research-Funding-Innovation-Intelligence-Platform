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
import { FaMoneyBillWave, FaChartLine, FaArrowUp, FaArrowDown, FaInfoCircle } from 'react-icons/fa';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#64748b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl z-50">
        <p className="text-xs font-bold text-slate-300 mb-1 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="text-xs font-extrabold flex items-center justify-between gap-4 mt-1" style={{ color: item.color || item.payload.fill || '#8b5cf6' }}>
            <span>{item.name}:</span>
            <span>{item.value?.toLocaleString()}</span>
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
      label: 'Total Capital Pool',
      value: `$${(stats.total_funding_amount / 1e9).toFixed(2)}B`,
      subtext: `$${stats.total_funding_amount?.toLocaleString()} Total Available`,
      icon: FaMoneyBillWave,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Average Grant Size',
      value: `$${(stats.average_funding_amount / 1e3).toFixed(1)}K`,
      subtext: `$${stats.average_funding_amount?.toLocaleString()} Per Award`,
      icon: FaChartLine,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Max Grant Ceiling',
      value: `$${(stats.max_funding_amount / 1e6).toFixed(1)}M`,
      subtext: `$${stats.max_funding_amount?.toLocaleString()} Top Award`,
      icon: FaArrowUp,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'Min Grant Entry',
      value: `$${(stats.min_funding_amount / 1e3).toFixed(0)}K`,
      subtext: `$${stats.min_funding_amount?.toLocaleString()} Base Award`,
      icon: FaArrowDown,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* 1. Valuation Cards */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[420px] shadow-xl">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-100">Grant Valuation & Financial Capital</h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
              Capital Valuation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <FaInfoCircle size={11} className="text-slate-500 shrink-0" />
            <span>Financial metrics across current active grant opportunities.</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 mt-4">
          {formattedStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{stat.label}</span>
                  <div className={`p-2 rounded-lg border ${stat.color}`}>
                    <Icon size={14} />
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{stat.subtext}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Top Sponsoring Funding Agencies */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[420px] shadow-xl">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-100">Top Grant Sponsoring Agencies</h3>
            <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full font-bold border border-purple-500/20">
              Grant Providers
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <FaInfoCircle size={11} className="text-slate-500 shrink-0" />
            <span>Major national & international funding organizations.</span>
          </p>
        </div>

        <div className="flex-1 w-full min-h-[250px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agencyData} layout="vertical" margin={{ top: 0, right: 15, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#cbd5e1" fontSize={11} fontWeight={600} tickLine={false} />
              <YAxis 
                type="category" 
                dataKey="agency" 
                stroke="#e2e8f0" 
                fontSize={11} 
                fontWeight={600} 
                tickLine={false} 
                width={190} 
                tickFormatter={(val) => (val && val.length > 25 ? `${val.substring(0, 25)}...` : val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Active Calls" radius={[0, 6, 6, 0]}>
                {agencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Opportunities By Expiration Year */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[380px] shadow-xl">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-100">Grant Expiration Timeline</h3>
            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">
              Call Deadlines
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <FaInfoCircle size={11} className="text-slate-500 shrink-0" />
            <span>Count of grant opportunities expiring in upcoming submission windows.</span>
          </p>
        </div>

        <div className="flex-1 w-full min-h-[220px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="year" stroke="#cbd5e1" fontSize={11} fontWeight={600} tickLine={false} />
              <YAxis stroke="#cbd5e1" fontSize={11} fontWeight={600} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Expiring Grants" radius={[6, 6, 0, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Funding Type Distribution */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[380px] shadow-xl">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-100">Funding Mechanism Types</h3>
            <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full font-bold border border-rose-500/20">
              Funding Instrument
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <FaInfoCircle size={11} className="text-slate-500 shrink-0" />
            <span>Distribution by grant type (Grants, Contracts, Fellowships, Awards).</span>
          </p>
        </div>

        <div className="flex-1 w-full min-h-[220px] mt-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="count"
                nameKey="type"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
