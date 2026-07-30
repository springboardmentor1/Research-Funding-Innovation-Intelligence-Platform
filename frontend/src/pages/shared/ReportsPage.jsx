import React from 'react';
import { FaDownload, FaFilePdf, FaFileExcel } from 'react-icons/fa';

const reports = [
  { name: 'Executive Summary Report', date: '2026-06-20', type: 'PDF', size: '2.4 MB', icon: FaFilePdf },
  { name: 'Funding Analysis Report', date: '2026-06-15', type: 'PDF', size: '5.1 MB', icon: FaFilePdf },
  { name: 'Patent Landscape Report', date: '2026-06-10', type: 'Excel', size: '3.2 MB', icon: FaFileExcel },
  { name: 'Research Trends Report', date: '2026-06-05', type: 'PDF', size: '4.8 MB', icon: FaFilePdf },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Reports</h2>
        <p className="text-slate-400 text-sm">Download professional reports and analytics</p>
      </div>

      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]">
        Generate New Report
      </button>

      <div className="space-y-4">
        {reports.map((report, idx) => (
          <div key={idx} className="bg-[#1c2438] border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-cyan-400 flex items-center justify-center">
                <report.icon size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold">{report.name}</h3>
                <p className="text-xs text-slate-400">{report.date} &bull; {report.type} &bull; {report.size}</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <FaDownload />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
