import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaSyncAlt, FaBookOpen, FaQuoteRight, FaCalendarAlt, FaFlask, FaExternalLinkAlt } from 'react-icons/fa';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

export default function PublicationSearch() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [error, setError] = useState('');

  const fetchPublications = async (keyword = '') => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    try {
      const response = await axios.get(`${API_BASE_URL}/publications`, {
        params: keyword ? { keyword, auto_sync: true } : { auto_sync: true },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = response.data || [];
      setPublications(data);
      if (data.length === 0 && keyword) {
        // Automatically sync from OpenAlex if DB returned empty
        await handleSyncOpenAlex(keyword);
      }
    } catch (err) {
      console.error('Error fetching publications:', err);
      // Fallback auto-sync from OpenAlex
      handleSyncOpenAlex(keyword);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncOpenAlex = async (keyword = searchKeyword) => {
    setSyncing(true);
    setError('');
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    try {
      const params = { limit: 10 };
      if (keyword && keyword.strip ? keyword.strip() : keyword) {
        params.keyword = keyword;
      }
      const response = await axios.get(`${API_BASE_URL}/publications/search`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setPublications(response.data || []);
    } catch (err) {
      console.error('Error syncing from OpenAlex:', err);
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Unable to sync literature. Please ensure backend services are active.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  return (
    <div className="p-6 sm:p-8 bg-slate-950 min-h-screen text-slate-100 selection:bg-amber-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                <FaBookOpen size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">Publications & OpenAlex Intelligence</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Query, synchronize, and analyze scientific publications matching your research domain.
            </p>
          </div>

          <button
            onClick={() => handleSyncOpenAlex(searchKeyword)}
            disabled={syncing}
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-amber-600/30 transition-all text-xs shrink-0 disabled:opacity-50"
          >
            <FaSyncAlt size={13} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing OpenAlex...' : 'Sync OpenAlex Literature'}</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPublications(searchKeyword)}
              placeholder="Search by publication title, doi, or research keywords (e.g. biotechnology)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={() => fetchPublications(searchKeyword)}
            disabled={loading || syncing}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-amber-600/20 transition-all shrink-0 disabled:opacity-50"
          >
            Filter & Search
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => handleSyncOpenAlex(searchKeyword)}
              className="underline font-bold hover:text-amber-300 ml-4 shrink-0"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading || syncing ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 uppercase tracking-widest">
              {syncing ? 'Fetching Live OpenAlex Publications...' : 'Searching Publications Catalog...'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {publications.length === 0 ? (
              <div className="col-span-full py-16 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-4 p-6">
                <FaFlask size={32} className="mx-auto text-slate-600" />
                <h3 className="text-sm font-bold text-slate-300">No Publications Cached Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click below to fetch and synchronize live scientific publications directly from the OpenAlex API for <strong className="text-slate-300">"{searchKeyword || 'biotechnology'}"</strong>.
                </p>
                <button
                  onClick={() => handleSyncOpenAlex(searchKeyword || 'biotechnology')}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-600/30 transition-all inline-flex items-center gap-2"
                >
                  <FaSyncAlt size={12} />
                  <span>Sync "{searchKeyword || 'biotechnology'}" Literature</span>
                </button>
              </div>
            ) : (
              publications.map((pub) => (
                <div
                  key={pub.publication_id || pub.id || pub.doi || pub.openalex_id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-semibold truncate max-w-[220px]">
                        <FaFlask size={10} className="shrink-0" /> {pub.journal || 'Academic Journal'}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <FaCalendarAlt size={10} /> {pub.publication_year || pub.year || '2025'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 leading-snug hover:text-amber-400 transition-colors">
                      {pub.title}
                    </h3>

                    {pub.authors && (
                      <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                        <span className="text-slate-500">Authors:</span> {pub.authors}
                      </p>
                    )}

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {pub.abstract || 'No abstract text available for this publication record.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                      <FaQuoteRight size={11} className="text-purple-400" />
                      <span>{pub.citation_count || 0} Citations</span>
                    </span>

                    {(pub.doi || pub.source_url) && (
                      <a
                        href={
                          pub.doi
                            ? (pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`)
                            : pub.source_url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-amber-400 hover:underline font-semibold"
                      >
                        <span>View Publication</span>
                        <FaExternalLinkAlt size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
