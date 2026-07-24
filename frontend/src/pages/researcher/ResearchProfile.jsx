import React from 'react';

export default function ResearchProfile() {
  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-400 mb-2">Research Profile Management</h1>
        <p className="text-slate-400 mb-8">
          Update your biography, set research keywords, and synchronize publications and citations using your ORCID ID.
        </p>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
          <div className="border-b border-slate-700 pb-4">
            <h3 className="text-slate-300 font-semibold mb-2">ORCID ID Connection</h3>
            <p className="text-xs text-slate-500 mb-2">e.g. 0000-0002-1825-0097</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-sm font-semibold px-4 py-2 rounded-lg transition">
              Sync ORCID Data
            </button>
          </div>
          <div>
            <h3 className="text-slate-300 font-semibold mb-2">Research Keywords</h3>
            <div className="flex gap-2">
              <span className="bg-slate-700 text-xs px-3 py-1 rounded-full text-slate-300">Quantum Computing</span>
              <span className="bg-slate-700 text-xs px-3 py-1 rounded-full text-slate-300">Nanotechnology</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
