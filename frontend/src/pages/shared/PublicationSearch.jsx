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
        params: keyword ? { keyword } : {},
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setPublications(response.data || []);
    } catch (err) {
      console.error('Error fetching publications:', err);
      setError('Please sign in or set up a research profile to view synchronized publications.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncOpenAlex = async () => {
    setSyncing(true);
    setError('');
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    try {
      const response = await axios.get(`${API_BASE_URL}/publications/search?limit=10`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setPublications(response.data || []);
    } catch (err) {
      console.error('Error syncing from OpenAlex:', err);
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Sync requires an active login session. Please sign in first.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  return (
    <div className="p-6 sm:p-8 bg-slate-950 min-h-screen text-slate-100 selection:bg-blue-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                <FaBookOpen size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">Publications & OpenAlex Intelligence</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Query, synchronize, and analyze scientific publications matching your research domain.
            </p>
          </div>

          <button
            onClick={handleSyncOpenAlex}
            disabled={syncing}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all text-xs shrink-0 disabled:opacity-50"
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
              placeholder="Search by publication title, doi, or research keywords..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => fetchPublications(searchKeyword)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shrink-0"
          >
            Filter Results
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 uppercase tracking-widest">Loading Publications Catalog...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publications.length === 0 ? (
              <div className="col-span-full py-16 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-3">
                <FaFlask size={32} className="mx-auto text-slate-600" />
                <h3 className="text-sm font-bold text-slate-300">No Publications Cached Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click <strong>"Sync OpenAlex Literature"</strong> above to fetch publications directly from the OpenAlex API based on your profile keywords.
                </p>
              </div>
            ) : (
              publications.map((pub) => (
                <div
                  key={pub.id || pub.doi}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-semibold">
                        <FaFlask size={10} /> {pub.journal || 'Academic Journal'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt size={10} /> {pub.year || '2025'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 leading-snug hover:text-blue-400 transition-colors">
                      {pub.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {pub.abstract || 'No abstract text available for this publication record.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                      <FaQuoteRight size={11} className="text-purple-400" />
                      <span>{pub.citation_count || 0} Citations</span>
                    </span>

                    {pub.doi && (
                      <a
                        href={pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:underline font-semibold"
                      >
                        <span>View DOI</span>
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
