import React from 'react';

export default function StartupDashboard() {
  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-400 mb-2">Startup Founder Dashboard</h1>
        <p className="text-slate-400 mb-8">
          Track technology readiness levels, monitor competitor patent filings, and assess commercialization ratings.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-lg mb-2 text-slate-300">Innovation Rank</h3>
            <p className="text-3xl font-bold text-emerald-400">82.10</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-lg mb-2 text-slate-300">Active Patents</h3>
            <p className="text-3xl font-bold text-purple-400">3 (2 Pending)</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-lg mb-2 text-slate-300">Investment Rating</h3>
            <p className="text-3xl font-bold text-amber-400">Grade A</p>
          </div>
        </div>
      </div>
    </div>
  );
}
