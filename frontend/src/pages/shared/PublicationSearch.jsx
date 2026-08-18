import React, { useState, useEffect } from 'react';
import { FaChartLine, FaSearch, FaSpinner, FaExternalLinkAlt, FaBook, FaSync } from 'react-icons/fa';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import dashboardService from '../../services/dashboardService';
import publicationService from '../../services/publicationService';

// Build the canonical link to a research paper:
// DOI → doi.org (resolves to publisher page), else source_url, else Semantic Scholar search
const getPaperUrl = (pub) => {
  if (pub.doi) {
    const doi = pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`;
    return doi;
  }
  return pub.source_url || `https://www.semanticscholar.org/search?q=${encodeURIComponent(pub.title)}&sort=Relevance`;
};

// Helpers for analytics links
const scholarUrl = (topic) =>
  `https://scholar.google.com/scholar?q=${encodeURIComponent(topic)}`;
const semanticUrl = (kw) =>
  `https://www.semanticscholar.org/search?q=${encodeURIComponent(kw)}&sort=Relevance`;

export default function PublicationSearch() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [papers, setPapers] = useState([]);
  const [papersLoading, setPapersLoading] = useState(false);
  const [paperSearch, setPaperSearch] = useState('');
  const [syncing, setSyncing] = useState(false);

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
    loadPapers();
  }, []);

  const loadPapers = async () => {
    setPapersLoading(true);
    try {
      const result = await publicationService.getPublications();
      if (Array.isArray(result) && result.length > 0) setPapers(result);
    } catch (e) {
      // silently fail — user may not have synced yet
    } finally {
      setPapersLoading(false);
    }
  };

  const handleSyncPapers = async () => {
    setSyncing(true);
    try {
      await publicationService.searchPublications();
      await loadPapers();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };


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
                <th className="pb-3 font-medium">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {trendingTopics.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 font-medium text-slate-200">{row.topic}</td>
                  <td className="py-4">{row.pubs}</td>
                  <td className="py-4 font-semibold text-emerald-400">{row.trend}</td>
                  <td className="py-4">{row.citations}</td>
                  <td className="py-4">
                    <a
                      href={scholarUrl(row.topic)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors"
                    >
                      <FaExternalLinkAlt size={10} /> Google Scholar
                    </a>
                  </td>
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
            <a
              key={idx}
              href={semanticUrl(kw)}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-full text-sm hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/40 border border-transparent transition-all"
            >
              {kw}
            </a>
          ))}
        </div>
      </div>

      {/* ── My Research Papers ─────────────────────────────────────────── */}
      <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-lg">My Research Papers</h3>
            <p className="text-xs text-slate-500 mt-0.5">Your synced publications — click any title to open the actual paper</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={11} />
              <input
                type="text"
                value={paperSearch}
                onChange={e => setPaperSearch(e.target.value)}
                placeholder="Filter papers..."
                className="bg-[#0f1523] border border-slate-700 focus:border-purple-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none w-44 transition-colors"
              />
            </div>
            {/* Sync */}
            <button
              onClick={handleSyncPapers}
              disabled={syncing || papersLoading}
              className="flex items-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-60"
            >
              <FaSync size={11} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing…' : 'Sync Papers'}
            </button>
          </div>
        </div>

        {papersLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FaBook size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No papers synced yet.</p>
            <p className="text-xs mt-1">Click <span className="text-purple-400 font-medium">Sync Papers</span> to import your publications from OpenAlex.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {papers
              .filter(p => !paperSearch || p.title?.toLowerCase().includes(paperSearch.toLowerCase()) || p.authors?.toLowerCase().includes(paperSearch.toLowerCase()))
              .map(pub => {
                const paperUrl = getPaperUrl(pub);
                const isOpenAccess = pub.open_access;
                return (
                  <div key={pub.publication_id || pub.openalex_id} className="bg-[#0f1523] border border-slate-800 hover:border-purple-500/40 rounded-xl p-4 transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Title — clicking opens the real paper */}
                        <a
                          href={paperUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors leading-snug line-clamp-2 flex items-start gap-1.5"
                        >
                          {pub.title}
                          <FaExternalLinkAlt size={10} className="mt-1 shrink-0 opacity-50 group-hover:opacity-100" />
                        </a>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-slate-500">
                          {pub.authors && <span>👤 {pub.authors.split(',').slice(0, 2).join(', ')}{pub.authors.includes(',') ? ' et al.' : ''}</span>}
                          {pub.journal && <span>📖 {pub.journal}</span>}
                          {pub.publication_year && <span>📅 {pub.publication_year}</span>}
                          {pub.citation_count > 0 && <span className="text-amber-400/70">⭐ {pub.citation_count} citations</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {isOpenAccess && (
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Open Access</span>
                        )}
                        {pub.doi && (
                          <a
                            href={`https://doi.org/${pub.doi.replace(/^https?:\/\/doi\.org\//, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-mono text-cyan-500/70 hover:text-cyan-400 transition-colors"
                          >
                            DOI: {pub.doi.replace(/^https?:\/\/doi\.org\//, '')}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

    </div>
  );
}
