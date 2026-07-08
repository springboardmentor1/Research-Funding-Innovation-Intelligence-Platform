import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-400 mb-2">Administrator Console</h1>
        <p className="text-slate-400 mb-8">
          Manage registered platform users, monitor database sync logs, track API health status, and override user access roles.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-lg mb-2 text-slate-300">Active Sessions</h3>
            <p className="text-3xl font-bold text-emerald-400">240</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-lg mb-2 text-slate-300">API Latency</h3>
            <p className="text-3xl font-bold text-purple-400">120 ms</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-lg mb-2 text-slate-300">DB Health</h3>
            <p className="text-3xl font-bold text-emerald-400">Sync OK</p>
          </div>
        </div>
      </div>
    </div>
  );
}
