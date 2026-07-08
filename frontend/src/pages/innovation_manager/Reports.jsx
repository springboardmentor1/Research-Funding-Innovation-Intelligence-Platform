import React from 'react';

export default function Reports() {
  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-400 mb-2">Reports & Analytics Generator</h1>
        <p className="text-slate-400 mb-8">
          Configure report parameters, select data ranges, and download compiled PDF reports of research output.
        </p>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
          <div className="text-sm text-slate-300">[Placeholder: Filters for date range, formats (PDF, CSV), and download list]</div>
          <button className="bg-blue-600 hover:bg-blue-700 text-sm font-semibold px-4 py-2 rounded-lg transition">
            Generate Custom Report
          </button>
        </div>
      </div>
    </div>
  );
}
