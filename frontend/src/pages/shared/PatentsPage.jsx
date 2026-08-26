import React, { useState, useEffect, useCallback } from 'react';
import { FaRegCopyright, FaSearch, FaFilter, FaSync, FaExternalLinkAlt, FaTimes, FaChevronDown } from 'react-icons/fa';
import patentService from '../../services/patentService';

const STATUS_COLORS = {
  GRANTED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  FILED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Map technology domain filter labels → keywords that exist in the actual DB titles/abstracts/classification
const DOMAIN_KEYWORD_MAP = {
  'AI & Machine Learning': 'artificial intelligence',
  'Deep Learning': 'deep learning',
  'Quantum Computing': 'quantum',
  'Robotics & Automation': 'robot',
  'Healthcare & Medical': 'medical',
  'Semiconductors': 'semiconductor',
  'Renewable Energy': 'energy',
  'Blockchain & FinTech': 'blockchain',
  'IoT & Smart Cities': 'internet of things',
  '5G / 6G Communications': 'communication',
  'Biotechnology': 'biotech',
};

/**
 * Normalise an inventor value from the backend into a display string.
 * Global patents store inventors as a JSON array ["Name1", "Name2", …],
 * while user-synced patents store them as a semicolon-separated string.
 */
const formatInventors = (inventors) => {
  if (!inventors) return null;
  if (Array.isArray(inventors)) {
    if (inventors.length === 0) return null;
    const first = inventors[0];
    return inventors.length > 1 ? `${first} et al.` : first;
  }
  if (typeof inventors === 'string') {
    const parts = inventors.split(';').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return null;
    return parts.length > 1 ? `${parts[0]} et al.` : parts[0];
  }
  return String(inventors);
};

/**
 * Build the canonical URL to open a specific patent.
 */
const getPatentUrl = (patent) => {
  // 1. Prioritize the actual source URL from the database
  const srcUrl = patent.source_url || patent.url || '';
  if (srcUrl && !srcUrl.includes('?q=') && srcUrl.startsWith('http')) {
    return srcUrl;
  }
  
  // 2. Try to construct a Lens link using external_id (e.g. lens ID)
  const extId = (patent.external_id || patent.external_patent_id || '').replace(/^lens-id-/, '');
  if (extId) {
    return `https://www.lens.org/lens/patent/${extId}`;
  }
  
  // 3. Fallback to constructing a Lens link using patent_number
  const num = (patent.patent_number || '').trim();
  const jur = (patent.jurisdiction || '').trim().toUpperCase();
  if (num && num.length > 3) {
    const hasJur = /^[A-Z]{2}/.test(num);
    const fullNum = (!hasJur && jur) ? `${jur}${num}` : num;
    // We can search for the specific patent number on Lens
    return `https://www.lens.org/lens/search/patent/list?q=doc_num:${fullNum}`;
  }
  
  // 4. Last resort: Title search on Lens
  return `https://www.lens.org/lens/search/patent/list?q=${encodeURIComponent(patent.title || 'patent')}`;
};

function PatentCard({ patent, onClick }) {
  const statusUpper = (patent.status || '').toUpperCase();
  const statusClass = STATUS_COLORS[statusUpper] || 'bg-slate-700/50 text-slate-400 border-slate-600';
  const externalUrl = getPatentUrl(patent);
  const inventorStr = formatInventors(patent.inventors);
  return (
    <div className="bg-[#1c2438] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 transition-all duration-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3
          onClick={() => onClick(patent)}
          className="text-white font-semibold text-sm leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2 cursor-pointer flex-1"
        >
          {patent.title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusClass}`}>{statusUpper}</span>
          <a
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            title={`Open patent ${patent.patent_number || ''} directly`}
            className="text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <FaExternalLinkAlt size={11} />
          </a>
        </div>
      </div>
      <p onClick={() => onClick(patent)} className="text-xs text-slate-500 line-clamp-2 mb-3 cursor-pointer">{patent.abstract}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {patent.patent_number && (
          <a href={externalUrl} target="_blank" rel="noreferrer" className="font-mono text-cyan-500/70 hover:text-cyan-400 transition-colors">
            {patent.patent_number}
          </a>
        )}
        {inventorStr && <span>👤 {inventorStr}</span>}
        {patent.assignee && <span>🏢 {patent.assignee.length > 40 ? patent.assignee.slice(0, 37) + '…' : patent.assignee}</span>}
        {patent.jurisdiction && <span>🌍 {patent.jurisdiction}</span>}
        {patent.filing_date && <span>📅 {patent.filing_date}</span>}
        {patent.citation_count > 0 && <span className="text-amber-400/70">⭐ {patent.citation_count} citations</span>}
      </div>
    </div>
  );
}

function PatentModal({ patent, onClose }) {
  if (!patent) return null;
  const statusUpper = (patent.status || '').toUpperCase();
  const statusClass = STATUS_COLORS[statusUpper] || 'bg-slate-700/50 text-slate-400 border-slate-600';
  const patentUrl = getPatentUrl(patent);
  const inventorStr = formatInventors(patent.inventors);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#141b2d] border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-slate-800">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusClass}`}>{statusUpper}</span>
              {patent.patent_number && (
                <a
                  href={patentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full hover:bg-cyan-500/20 transition-colors"
                >
                  <FaExternalLinkAlt size={9} />
                  {patent.patent_number}
                </a>
              )}
            </div>
            <h2 className="text-white font-bold text-lg leading-snug">{patent.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors shrink-0 mt-1">
            <FaTimes size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Patent Number', value: patent.patent_number },
              { label: 'Inventors', value: inventorStr },
              { label: 'Assignee', value: patent.assignee },
              { label: 'Jurisdiction', value: patent.jurisdiction },
              { label: 'Filing Date', value: patent.filing_date },
              { label: 'Publication Date', value: patent.publication_date },
              { label: 'Classification', value: patent.classification },
              { label: 'Citations', value: patent.citation_count },
            ].map(({ label, value }) => value ? (
              <div key={label}>
                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                <p className="text-sm text-slate-200 font-mono">{value}</p>
              </div>
            ) : null)}
          </div>
          {patent.abstract && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Abstract</p>
              <p className="text-sm text-slate-300 leading-relaxed">{patent.abstract}</p>
            </div>
          )}
          <a
            href={patentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          >
            <FaExternalLinkAlt size={12} />
            {patent.patent_number ? `View Patent ${patent.patent_number}` : 'View on Patent Database'}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PatentsPage() {
  const [patents, setPatents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', domain: '', year: '', jurisdiction: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({ total: 0, granted: 0, filed: 0, citations: 0 });

  const loadPatents = useCallback(async () => {
    try {
      setLoading(true);

      const params = { limit: 50 };
      const globalParams = { limit: 50 };

      if (filters.status) {
        params.status = filters.status;
        globalParams.status = filters.status;
      }
      if (filters.jurisdiction) {
        globalParams.jurisdiction = filters.jurisdiction;
      }
      if (filters.year) {
        params.year = filters.year;
        globalParams.year_from = parseInt(filters.year);
        globalParams.year_to = parseInt(filters.year);
      }

      // Domain filter → search by keyword in title/abstract/classification
      const domainKw = filters.domain ? (DOMAIN_KEYWORD_MAP[filters.domain] || filters.domain) : '';
      if (domainKw && search) {
        params.tech_domain = filters.domain;
        globalParams.keyword = domainKw;
      } else if (domainKw) {
        params.tech_domain = filters.domain;
        globalParams.keyword = domainKw;
      } else if (search) {
        globalParams.keyword = search;
      }

      // First try to fetch user's synced patents
      let data = await patentService.getPatents(params);

      // If no data matches, fallback to global patents
      if (!data || data.length === 0) {
        data = await patentService.getGlobalPatents(globalParams);
      }

      // If domain + search text are both active, do client-side filtering on the search term
      let displayData = Array.isArray(data) ? data : [];
      if (domainKw && search) {
        const q = search.toLowerCase();
        displayData = displayData.filter(p =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.abstract || '').toLowerCase().includes(q) ||
          (p.assignee || '').toLowerCase().includes(q) ||
          (p.classification || '').toLowerCase().includes(q) ||
          JSON.stringify(p.inventors || []).toLowerCase().includes(q)
        );
      }

      setPatents(displayData);
      setStats({
        total: displayData.length,
        granted: displayData.filter(p => (p.status || '').toUpperCase() === 'GRANTED').length,
        filed: displayData.filter(p => (p.status || '').toUpperCase() === 'FILED').length,
        citations: displayData.reduce((acc, p) => acc + (p.citation_count || 0), 0)
      });
    } catch (e) {
      console.error('Failed to load patents:', e);
      setPatents([]);
      setStats({ total: 0, granted: 0, filed: 0, citations: 0 });
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  // Auto-apply on mount and when filters change
  useEffect(() => { loadPatents(); }, [filters]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await patentService.searchPatents();
      await loadPatents();
    } catch (e) {
      await loadPatents();
    } finally {
      setSyncing(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadPatents();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Patent Analytics</h2>
          <p className="text-slate-400 text-sm">Explore 10,000+ global patent filings across AI, healthcare, quantum, energy & more.</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
        >
          <FaSync size={13} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Patents'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Showing Patents', value: stats.total, color: 'text-cyan-400' },
          { label: 'Granted', value: stats.granted, color: 'text-emerald-400' },
          { label: 'Filed', value: stats.filed, color: 'text-blue-400' },
          { label: 'Total Citations', value: stats.citations, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#1c2438] border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, inventor, classification..."
            className="w-full bg-[#1c2438] border border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 outline-none transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-[#1c2438] border-slate-700 text-slate-400 hover:text-slate-200'}`}
        >
          <FaFilter size={13} />Filters <FaChevronDown size={11} className={showFilters ? 'rotate-180' : ''} />
        </button>
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
          Search
        </button>
      </form>

      {showFilters && (
        <div className="bg-[#1c2438] border border-slate-700 rounded-xl p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Status</label>
            <select
              value={filters.status}
              onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full bg-[#0f1523] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none"
            >
              <option value="">All</option>
              <option value="GRANTED">Granted</option>
              <option value="FILED">Filed</option>
            </select>
          </div>
          {/* Year Filed */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Year Filed</label>
            <select
              value={filters.year}
              onChange={e => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className="w-full bg-[#0f1523] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none"
            >
              {['', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'].map(y => (
                <option key={y} value={y}>{y || 'All Years'}</option>
              ))}
            </select>
          </div>
          {/* Technology Domain (keyword-based) */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Technology Domain</label>
            <select
              value={filters.domain}
              onChange={e => setFilters(prev => ({ ...prev, domain: e.target.value }))}
              className="w-full bg-[#0f1523] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none"
            >
              <option value="">All Domains</option>
              {Object.keys(DOMAIN_KEYWORD_MAP).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          {/* Jurisdiction */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Jurisdiction</label>
            <select
              value={filters.jurisdiction}
              onChange={e => setFilters(prev => ({ ...prev, jurisdiction: e.target.value }))}
              className="w-full bg-[#0f1523] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none"
            >
              {['', 'US', 'EP', 'WO', 'CN', 'KR', 'JP'].map(j => (
                <option key={j} value={j}>{j || 'All Jurisdictions'}</option>
              ))}
            </select>
          </div>
          {/* Clear Filters */}
          <div className="lg:col-span-4 flex justify-end">
            <button
              type="button"
              onClick={() => setFilters({ status: '', domain: '', year: '', jurisdiction: '' })}
              className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Patent List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-slate-400 text-sm">Loading patents from database…</span>
        </div>
      ) : patents.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FaRegCopyright size={40} className="mx-auto mb-4 opacity-30" />
          <p>No patents match your current filters.</p>
          <button
            type="button"
            onClick={() => { setFilters({ status: '', domain: '', year: '', jurisdiction: '' }); setSearch(''); }}
            className="mt-3 text-cyan-400 text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {patents.map((patent, idx) => (
            <PatentCard key={patent.id || patent.patent_id || idx} patent={patent} onClick={setSelectedPatent} />
          ))}
        </div>
      )}

      <PatentModal patent={selectedPatent} onClose={() => setSelectedPatent(null)} />
    </div>
  );
}
