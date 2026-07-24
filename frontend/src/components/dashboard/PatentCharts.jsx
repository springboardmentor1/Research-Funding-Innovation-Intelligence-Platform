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

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#f43f5e', '#64748b'];

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
      {/* Patent Activity Timeline */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[400px]">
        <h3 className="text-lg font-bold text-slate-100 mb-6">Patent Application Timeline</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="patents" 
                name="Patents" 
                stroke="#10b981" 
                strokeWidth={3}
                activeDot={{ r: 6 }}
                dot={{ stroke: '#10b981', strokeWidth: 2, r: 4, fill: '#0f172a' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Assignees */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[400px]">
        <h3 className="text-lg font-bold text-slate-100 mb-6">Top Assignee Organizations</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={assigneeData} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis 
                type="category" 
                dataKey="assignee" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                width={120} 
                tickFormatter={(val) => val.length > 25 ? `${val.substring(0, 25)}...` : val}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Patents" radius={[0, 4, 4, 0]}>
                {assigneeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[400px]">
        <h3 className="text-lg font-bold text-slate-100 mb-6">Patent Status Distribution</h3>
        <div className="flex-1 w-full min-h-[250px] flex flex-col justify-center">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            {statusData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span 
                  className="w-3.5 h-3.5 rounded-full" 
                  style={{ backgroundColor: idx === 0 ? '#10b981' : '#3b82f6' }}
                />
                <span className="text-xs font-semibold text-slate-300">
                  {item.status}: {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Country Distribution */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[400px]">
        <h3 className="text-lg font-bold text-slate-100 mb-6">Geographic Patent Distribution</h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="country" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Patents" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
