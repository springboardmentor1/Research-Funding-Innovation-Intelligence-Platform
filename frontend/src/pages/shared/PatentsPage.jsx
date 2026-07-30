import React from 'react';
import { FaRegCopyright, FaSearch, FaChartLine } from 'react-icons/fa';

export default function PatentsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto flex flex-col items-center justify-center h-full text-center py-20">
      <div className="w-24 h-24 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mb-6">
        <FaRegCopyright size={40} />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Patent Analytics</h2>
      <p className="text-slate-400 max-w-lg mb-8">
        Track global patent filings, analyze competitor IP portfolios, and identify technology white spaces in your research domain.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        {[
          { label: 'Total Patents Indexed', value: '2.4M+' },
          { label: 'Competitor Patents', value: '14,250' },
          { label: 'Technology Breakthroughs', value: '142' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-[#1c2438] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-slate-400 text-sm font-medium mb-2">{stat.label}</h3>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
