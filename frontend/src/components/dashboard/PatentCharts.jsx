import React from 'react';
import {
  LineChart,
  Line,
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

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#f43f5e', '#64748b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl z-50">
        <p className="text-xs font-bold text-slate-300 mb-1 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="text-xs font-extrabold flex items-center justify-between gap-4 mt-1" style={{ color: item.color || item.payload.fill || '#10b981' }}>
            <span>{item.name}:</span>
            <span>{item.value?.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PatentCharts({ data }) {
  if (!data) return null;

  // 1. Patent Activity Timeline
  const timelineData = (data.patent_activity_timeline?.timeline || [])
    .sort((a, b) => a.year - b.year);

  // 2. Status Distribution (GRANTED, FILED, EXPIRED etc.)
  const statusData = data.patent_status_distribution || [];

  // 3. Country Distribution
  const countryData = data.country_distribution || [];

  // 4. Top Assignees (Top 5)
  const assigneeData = [...(data.top_assignees || [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* 1. Patent Application Timeline */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[420px] shadow-xl">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-100">Patent Filing Velocity</h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
              The Lens API
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <FaInfoCircle size={11} className="text-slate-500 shrink-0" />
            <span>Filing frequency timeline across international patent offices.</span>
          </p>
        </div>

        <div className="flex-1 w-full min-h-[250px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="year" stroke="#cbd5e1" fontSize={11} fontWeight={600} tickLine={false} />
              <YAxis stroke="#cbd5e1" fontSize={11} fontWeight={600} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="patents" 
                name="Patents Filed" 
                stroke="#10b981" 
                strokeWidth={3}
                activeDot={{ r: 6 }}
                dot={{ stroke: '#10b981', strokeWidth: 2, r: 4, fill: '#0f172a' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Top Assignee Organizations */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[420px] shadow-xl">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-100">Top Patent Holders (Assignees)</h3>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold border border-amber-500/20">
              IP Owners
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <FaInfoCircle size={11} className="text-slate-500 shrink-0" />
            <span>Leading corporate and academic institutions filing patents.</span>
          </p>
        </div>

        <div className="flex-1 w-full min-h-[250px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={assigneeData} layout="vertical" margin={{ top: 0, right: 15, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#cbd5e1" fontSize={11} fontWeight={600} tickLine={false} />
              <YAxis 
                type="category" 
                dataKey="assignee" 
                stroke="#e2e8f0" 
                fontSize={11} 
                fontWeight={600} 
                tickLine={false} 
                width={190} 
                tickFormatter={(val) => (val && val.length > 25 ? `${val.substring(0, 25)}...` : val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Patents Held" radius={[0, 6, 6, 0]}>
                {assigneeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Patent Legal Status Distribution */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[380px] shadow-xl">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-100">Legal Status Distribution</h3>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold border border-amber-500/20">
              Grant Status
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <FaInfoCircle size={11} className="text-slate-500 shrink-0" />
            <span>Ratio of fully granted patents vs pending application filings.</span>
          </p>
        </div>

        <div className="flex-1 w-full min-h-[220px] mt-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="count"
                nameKey="status"
              >
                {statusData.map((entry, index) => (
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

      {/* 4. Geographic Distribution */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[380px] shadow-xl">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-100">Geographic Jurisdiction Distribution</h3>
            <span className="text-[10px] text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full font-bold border border-cyan-500/20">
              Jurisdictions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <FaInfoCircle size={11} className="text-slate-500 shrink-0" />
            <span>Patent registrations grouped by primary filing jurisdiction.</span>
          </p>
        </div>

        <div className="flex-1 w-full min-h-[220px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="country" stroke="#cbd5e1" fontSize={11} fontWeight={600} tickLine={false} />
              <YAxis stroke="#cbd5e1" fontSize={11} fontWeight={600} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Patents Registered" radius={[6, 6, 0, 0]}>
                {countryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
