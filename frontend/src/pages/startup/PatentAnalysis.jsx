import React, { useState, useEffect } from 'react';
import patentService from '../../services/patentService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

export default function PatentAnalysis() {
  const [patents, setPatents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const fetchPatents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patentService.getPatents();
      setPatents(data);
    } catch (err) {
      setError('Failed to fetch patents.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const data = await patentService.searchPatents();
      setPatents(data);
    } catch (err) {
      setError('Failed to sync patents from Lens API.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchPatents();
  }, []);

  // Prepare data for Filings per Year Bar Chart
  const filingsData = patents.reduce((acc, pat) => {
    const year = pat.filing_year;
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

  // Prepare data for Domain vs Year Scatter
  const scatterData = patents.map(pat => ({
    title: pat.title?.substring(0, 20) + '...',
    year: pat.filing_year,
    domain: pat.tech_domain || 'Other',
    z: 100 // Fixed size for scatter points
  }));

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-slate-700 pb-4">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-400 mb-2">Patent Analysis & IP Mapping</h1>
            <p className="text-slate-400">
              Analyze patent landscapes, search filings, and evaluate technology overlaps with active competitors.
            </p>
          </div>
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition-all"
          >
            {syncing ? 'Syncing...' : 'Sync Lens API'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Filings Bar Chart */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Filings Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filingsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="year" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                      />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Competitive Intel Scatter */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Domain Focus Areas</h3>
                <div className="h-64 flex flex-col justify-center">
                  <div className="flex flex-wrap gap-2 overflow-y-auto">
                    {/* Rather than a complex categorical scatter which needs D3 mapping, we display a domain badge cluster */}
                    {Object.entries(
                      patents.reduce((acc, pat) => {
                        const d = pat.tech_domain || 'Uncategorized';
                        acc[d] = (acc[d] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([domain, count]) => (
                      <div key={domain} className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-center flex-grow">
                        <div className="text-xl font-bold text-emerald-400">{count}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">{domain}</div>
                      </div>
                    ))}
                    {patents.length === 0 && <span className="text-slate-500">No data available</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <h3 className="text-lg font-semibold text-slate-200">Recent Synced Patents</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/50 text-slate-400">
                    <tr>
                      <th className="p-4 font-medium">Patent Title</th>
                      <th className="p-4 font-medium">Domain</th>
                      <th className="p-4 font-medium">Filing Year</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {patents.slice(0, 10).map((pat) => (
                      <tr key={pat.id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="p-4 font-medium text-slate-200 max-w-md truncate">
                          <a href={pat.url} target="_blank" rel="noreferrer" className="hover:text-emerald-400">
                            {pat.title}
                          </a>
                        </td>
                        <td className="p-4 text-slate-400">{pat.tech_domain || 'N/A'}</td>
                        <td className="p-4 text-slate-400">{pat.filing_year}</td>
                        <td className="p-4">
                          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/20">
                            {pat.status || 'FILED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {patents.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-500">
                          No patents synced. Click "Sync Lens API" to begin.
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
