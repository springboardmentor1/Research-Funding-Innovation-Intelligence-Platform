import React from 'react';

export default function InnovationManagerDashboard() {
  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-400 mb-2">Innovation Manager Dashboard</h1>
        <p className="text-slate-400 mb-8">
          Monitor your university or institution's technology transfer pipelines, licensing agreements, and disclosures.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-lg mb-2 text-slate-300">Active Licenses</h3>
            <p className="text-3xl font-bold text-emerald-400">18</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-lg mb-2 text-slate-300">Total Royalties</h3>
            <p className="text-3xl font-bold text-purple-400">$1.2M USD</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-lg mb-2 text-slate-300">Disclosure Queue</h3>
            <p className="text-3xl font-bold text-amber-400">8 Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}
