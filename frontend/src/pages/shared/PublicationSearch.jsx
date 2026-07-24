import React, { useState, useEffect } from 'react';
import publicationService from '../../services/publicationService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

export default function PublicationSearch() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const fetchPublications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await publicationService.getPublications();
      setPublications(data);
    } catch (err) {
      setError('Failed to fetch publications.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const data = await publicationService.searchPublications();
      setPublications(data);
    } catch (err) {
      setError('Failed to sync publications from OpenAlex.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  // Prepare data for Volume Trend (publications per year)
  const volumeData = publications.reduce((acc, pub) => {
    const year = pub.publication_year;
    if (year) {
      const existing = acc.find(item => item.year === year);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ year, count: 1 });
      }
    }
    return acc;
  }, []).sort((a, b) => a.year - b.year);

  // Prepare data for Topics Scatter (simulated x,y based on citations/year)
  const scatterData = publications.map((pub, index) => ({
    title: pub.title?.substring(0, 20) + '...',
    year: pub.publication_year,
    citations: pub.citation_count || 0,
    z: pub.citation_count || 10
  }));

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-slate-700 pb-4">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-400 mb-2">Publications & Research Trends</h1>
            <p className="text-slate-400">
              Search scientific papers, read abstracts, and analyze publication velocity trends in real time.
            </p>
          </div>
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition-all"
          >
            {syncing ? 'Syncing...' : 'Sync OpenAlex'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trend Chart */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Publication Volume Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="year" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Scatter Chart */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Impact vs Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="year" name="Year" stroke="#94a3b8" domain={['auto', 'auto']} />
                      <YAxis dataKey="citations" name="Citations" stroke="#94a3b8" />
                      <ZAxis dataKey="z" range={[50, 400]} name="Impact" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }} 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                      />
                      <Scatter name="Publications" data={scatterData} fill="#8b5cf6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <h3 className="text-lg font-semibold text-slate-200">Recent Synced Publications</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/50 text-slate-400">
                    <tr>
                      <th className="p-4 font-medium">Title</th>
                      <th className="p-4 font-medium">Domain</th>
                      <th className="p-4 font-medium">Year</th>
                      <th className="p-4 font-medium">Citations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {publications.slice(0, 10).map((pub) => (
                      <tr key={pub.id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="p-4 font-medium text-slate-200 max-w-md truncate">
                          <a href={pub.url} target="_blank" rel="noreferrer" className="hover:text-blue-400">
                            {pub.title}
                          </a>
                        </td>
                        <td className="p-4 text-slate-400">{pub.domain || 'N/A'}</td>
                        <td className="p-4 text-slate-400">{pub.publication_year}</td>
                        <td className="p-4 text-slate-400">{pub.citation_count}</td>
                      </tr>
                    ))}
                    {publications.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-500">
                          No publications synced. Click "Sync OpenAlex" to begin.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
