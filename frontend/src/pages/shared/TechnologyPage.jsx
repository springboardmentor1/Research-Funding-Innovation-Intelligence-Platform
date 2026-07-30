import React from 'react';
import { FaBrain } from 'react-icons/fa';

export default function TechnologyPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto flex flex-col items-center justify-center h-full text-center py-20">
      <div className="w-24 h-24 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mb-6">
        <FaBrain size={40} />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Technology Intelligence</h2>
      <p className="text-slate-400 max-w-lg mb-8">
        Monitor technology readiness levels, market adoption rates, and emerging tech capabilities across various sectors.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-6 h-64 flex items-center justify-center text-slate-500">
          Technology Maturity Matrix Placeholder
        </div>
        <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-6 h-64 flex items-center justify-center text-slate-500">
          Technology Adoption Curve Placeholder
        </div>
      </div>
    </div>
  );
}
