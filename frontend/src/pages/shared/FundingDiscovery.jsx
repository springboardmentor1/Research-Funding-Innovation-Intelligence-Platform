import React from 'react';

export default function FundingDiscovery() {
  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-400 mb-2">Funding Opportunities Discovery</h1>
        <p className="text-slate-400 mb-8">
          Search global grant calls, filter by budget agency and deadlines, and view automated AI suitability match scores.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-slate-300 mb-4">Search Filters</h3>
            <div className="text-xs text-slate-500">[Filters: Sponsor Agency, Budget, Deadline]</div>
          </div>
          <div className="lg:col-span-3 bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-slate-300 mb-4">Available Grants</h3>
            <div className="text-xs text-slate-500">[List of matching grants with AI percentage compatibility score]</div>
          </div>
        </div>
      </div>
    </div>
  );
}
