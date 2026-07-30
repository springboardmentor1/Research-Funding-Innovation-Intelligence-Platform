import React, { useState, useEffect } from 'react';
import { FaChartLine, FaSearch, FaBook, FaFire, FaSpinner } from 'react-icons/fa';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import dashboardService from '../../services/dashboardService';

export default function PublicationSearch() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        // Using dashboard analytics endpoint which contains publication summaries
        const result = await dashboardService.getDashboardAnalytics();
        setData(result.publications);
      } catch (err) {
        console.error('Failed to fetch publication data:', err);
        setError('Failed to load live publication analytics. Using fallback data.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, []);

  const summary = data?.summary_metrics || {};
  
  // Map publication trends (Line chart)
  const pubData = (data?.publications_by_year || []).map(item => ({
    name: String(item.year),
    value: item.count
  })).slice(-6);

  if (pubData.length === 0) {
    pubData.push(
      { name: '2021', value: 450 },
      { name: '2022', value: 520 },
      { name: '2023', value: 480 },
      { name: '2024', value: 650 },
      { name: '2025', value: 810 },
      { name: '2026', value: 950 }
    );
  }

  // Mock citation data based on publications (for Bar chart)
  const citationData = pubData.map(item => ({
    name: item.name,
    value: item.value * 2.5 // mock citation count based on pubs
  }));

  // Map trending topics (from domain or top authors as fallback)
  const trendingTopics = (data?.publications_by_domain || []).map(item => ({
    topic: item.domain,
    pubs: item.count,
    trend: `+${Math.floor(Math.random() * 20) + 5}%`, // mock trend
    citations: item.count * 6 // mock citations
  })).slice(0, 4);

  if (trendingTopics.length === 0) {
    trendingTopics.push(
      { topic: 'Quantum Computing', pubs: '1,240', trend: '+18%', citations: '8,450' },
      { topic: 'Machine Learning', pubs: '2,100', trend: '+22%', citations: '12,300' },
      { topic: 'Gene Therapy', pubs: '890', trend: '+15%', citations: '5,600' },
      { topic: 'Climate Modeling', pubs: '650', trend: '+12%', citations: '4,200' }
    );
  }

  const keywords = (data?.publications_by_domain || []).map(item => item.domain);
  if (keywords.length === 0) {
    keywords.push(
      'Quantum Computing', 'AI', 'Neural Networks', 'Genomics', 'Climate Science', 
      'Renewable Energy', 'Biotech', 'Materials Science', 'Robotics', 'Nanotechnology',
      'Photonics', 'Synthetic Biology'
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Research Intelligence</h2>
        <p className="text-slate-400 text-sm">Track publication trends, citation analytics, and emerging research topics</p>
      </div>

      {loading && (
        <div className="flex items-center text-purple-400 text-sm animate-pulse">
          <FaSpinner className="animate-spin mr-2" /> Loading live analytics...
        </div>
      )}
      {error && !loading && (
        <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Publications', value: summary.total_publications ? summary.total_publications.toLocaleString() : '45.2K', change: '+8.5%' },
          { label: 'Total Citations', value: summary.total_publications ? (summary.total_publications * 3).toLocaleString() : '124.5K', change: '+12.3%' },
          { label: 'Emerging Topics', value: '42', change: '+5' },
          { label: 'Research Hotspots', value: '18', change: '+3' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-[#1c2438] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between h-32">
            <span className="text-sm font-medium text-slate-400">{stat.label}</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">{stat.value}</span>
              <span className="text-sm font-medium text-cyan-400 mb-1 flex items-center gap-1">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Publication Trends */}
        <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-5 h-80 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-white">
            <FaChartLine className="text-purple-400" /> Publication Trends
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pubData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                <XAxis dataKey="name" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f1523', border: '1px solid #2d3748', borderRadius: '8px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#0f1523', stroke: '#a855f7', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Citation Analytics */}
        <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-5 h-80 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-white">
            <FaChartLine className="text-pink-400" /> Citation Analytics
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={citationData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                <XAxis dataKey="name" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0f1523', border: '1px solid #2d3748', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table Row */}
      <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-white">
          <FaSearch className="text-cyan-400" /> Trending Research Topics
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 font-medium">Topic</th>
                <th className="pb-3 font-medium">Publications</th>
                <th className="pb-3 font-medium">Trend</th>
                <th className="pb-3 font-medium">Citations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {trendingTopics.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 font-medium text-slate-200">{row.topic}</td>
                  <td className="py-4">{row.pubs}</td>
                  <td className="py-4 font-semibold text-emerald-400">{row.trend}</td>
                  <td className="py-4">{row.citations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keywords Cloud */}
      <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-5 flex flex-col">
        <h3 className="text-sm font-semibold text-white mb-4">Research Keywords Cloud</h3>
        <div className="flex flex-wrap gap-3">
          {keywords.map((kw, idx) => (
            <span key={idx} className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-full text-sm hover:bg-slate-700 hover:text-white transition-colors cursor-pointer">
              {kw}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
