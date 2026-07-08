import React from 'react';

export default function ResearcherDashboard() {
  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-400 mb-2">Researcher Dashboard</h1>
        <p className="text-slate-400 mb-8">
          Manage your research metrics, citations, publications list, and receive AI-curated funding matches.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-lg mb-2 text-slate-300">Research Score</h3>
            <p className="text-3xl font-bold text-emerald-400">78.40</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-lg mb-2 text-slate-300">Citations / h-Index</h3>
            <p className="text-3xl font-bold text-purple-400">2,450 / h-18</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-lg mb-2 text-slate-300">Active Grants</h3>
            <p className="text-3xl font-bold text-amber-400">2 ($450,000)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
