import React, { useState, useEffect } from 'react';
import { 
  FaBolt, FaChartLine, FaDatabase, FaUsers, 
  FaCalendarAlt, FaDownload 
} from 'react-icons/fa';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import dashboardService from '../services/dashboardService';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const result = await dashboardService.getDashboardAnalytics();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load real-time analytics. Using fallback data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Format data from backend or use empty arrays if not loaded yet
  const summary = data?.summary || {};
  const publications = data?.publications || {};
  const funding = data?.funding || {};
  const patents = data?.patents || {};

  // For charts, let's map the backend data
  // Timeline: from publications_by_year
  const timelineData = (publications.publications_by_year || []).map(item => ({
    name: String(item.year),
    value: item.count
  })).slice(-6); // last 6 years

  if (timelineData.length === 0) {
    timelineData.push(
      { name: '2021', value: 2400 },
      { name: '2022', value: 3100 },
      { name: '2023', value: 2800 },
      { name: '2024', value: 3900 },
      { name: '2025', value: 4300 },
      { name: '2026', value: 4800 }
    );
  }

  // Funding: from top_funding_agencies
  const fundingData = (funding.top_funding_agencies || []).map(item => ({
    name: item.agency,
    amount: item.count * 1000 // mock amount based on count
  })).slice(0, 5);

  if (fundingData.length === 0) {
    fundingData.push(
      { name: 'NSF', amount: 4200 },
      { name: 'NIH', amount: 3800 },
      { name: 'DARPA', amount: 5300 },
      { name: 'DOE', amount: 2800 },
      { name: 'NASA', amount: 3400 }
    );
  }

  // Tech Opportunities: mock based on patent domains
  const techOpportunities = (patents.patents_by_technology_domain || []).map((item, idx) => ({
    name: item.domain,
    score: 80 + (idx * 3) // mock score
  })).slice(0, 4);

  if (techOpportunities.length === 0) {
    techOpportunities.push(
      { name: 'Quantum Computing', score: 85 },
      { name: 'AI/Machine Learning', score: 92 },
      { name: 'Biotech', score: 78 },
      { name: 'Clean Energy', score: 88 }
    );
  }

  // Latest Funding
  const opportunitiesData = (funding.funding_opportunities_by_domain || []).map(item => ({
    opportunity: `${item.domain} Research Grant`,
    agency: 'NSF',
    amount: `$${(item.count * 50)}K - $${(item.count * 150)}K`,
    deadline: 'Dec 2026',
    match: `${75 + item.count}%`,
    status: 'Eligible'
  })).slice(0, 3);

  if (opportunitiesData.length === 0) {
    opportunitiesData.push(
      { opportunity: 'Quantum Computing Research Initiative', agency: 'National Science Foundation', amount: '$500K - $2M', deadline: 'Aug 15, 2026', match: '94%', status: 'Eligible' },
      { opportunity: 'Biomedical Innovation Grant', agency: 'National Institutes of Health', amount: '$250K - $1M', deadline: 'Sep 1, 2026', match: '87%', status: 'Eligible' },
      { opportunity: 'AI for Climate Change', agency: 'Department of Energy', amount: '$1M - $3M', deadline: 'Oct 30, 2026', match: '92%', status: 'Eligible' }
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Dashboard</h2>
          <p className="text-slate-400 text-sm">Welcome back! Here's your research overview.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1c2438] hover:bg-[#252f48] text-white px-4 py-2 rounded-lg border border-slate-700 transition-colors text-sm font-medium">
          <FaDownload size={12} />
          Export Report
        </button>
      </div>

      {loading && (
        <div className="text-blue-400 text-sm animate-pulse">Loading live analytics from backend...</div>
      )}
      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Grants', value: summary.total_funding_opportunities || '24', change: '+12%', icon: FaBolt, color: 'text-blue-400', bg: 'bg-blue-500' },
          { label: 'Research Score', value: summary.total_research_domains || '92.5', change: '+5.2%', icon: FaChartLine, color: 'text-purple-400', bg: 'bg-purple-500' },
          { label: 'Innovation Score', value: summary.total_countries || '87', change: '+8.1%', icon: FaDatabase, color: 'text-pink-400', bg: 'bg-pink-500' },
          { label: 'Patent Count', value: summary.total_patents || '1,247', change: '+23%', icon: FaUsers, color: 'text-rose-400', bg: 'bg-rose-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-[#1c2438] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-slate-400">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} bg-opacity-20 flex items-center justify-center`}>
                <stat.icon className={stat.color} size={14} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">{stat.value}</span>
              <span className="text-sm font-medium text-emerald-400 mb-1 flex items-center gap-1">
                ↗ {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-[#1c2438] border border-slate-800 rounded-2xl p-5 h-80 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-white">
            <FaCalendarAlt className="text-blue-400" /> Research Trend Timeline
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                <XAxis dataKey="name" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f1523', border: '1px solid #2d3748', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#0ea5e9' }}
                />
                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0f1523', stroke: '#0ea5e9', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tech Opportunities */}
        <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-5 h-80 flex flex-col">
          <h3 className="text-sm font-semibold text-white mb-6">Technology Opportunities</h3>
          <div className="flex-1 flex flex-col justify-between pb-2">
            {techOpportunities.map((tech, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-200">{tech.name}</span>
                  <span className="text-cyan-400">{tech.score}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${tech.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funding Chart */}
      <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-5 h-80 flex flex-col">
        <h3 className="text-sm font-semibold text-white mb-4">Funding Distribution by Agency</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fundingData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
              <XAxis dataKey="name" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{ backgroundColor: '#0f1523', border: '1px solid #2d3748', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="amount" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Row */}
      <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Latest Funding Opportunities</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 font-medium">Opportunity</th>
                <th className="pb-3 font-medium">Agency</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Deadline</th>
                <th className="pb-3 font-medium">AI Match</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {opportunitiesData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 font-medium text-slate-200">{row.opportunity}</td>
                  <td className="py-4">{row.agency}</td>
                  <td className="py-4">{row.amount}</td>
                  <td className="py-4">{row.deadline}</td>
                  <td className="py-4 font-semibold text-cyan-400">{row.match}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
