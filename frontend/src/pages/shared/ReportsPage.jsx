import React, { useState, useEffect } from 'react';
import { FaDownload, FaFilePdf, FaFileExcel, FaFileCsv, FaPlus, FaTimes, FaTrash, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import reportService from '../../services/reportService';

const FORMAT_ICON = {
  PDF: FaFilePdf,
  Excel: FaFileExcel,
  CSV: FaFileCsv,
};
const FORMAT_COLOR = {
  PDF: 'text-rose-400 bg-rose-500/10',
  Excel: 'text-emerald-400 bg-emerald-500/10',
  CSV: 'text-blue-400 bg-blue-500/10',
};

const REPORT_TYPES = [
  { key: 'executive_summary', label: 'Executive Summary', desc: 'Overview of all research and funding activities' },
  { key: 'funding_analysis', label: 'Funding Analysis', desc: 'Deep-dive into grants matching your profile' },
  { key: 'patent_landscape', label: 'Patent Landscape', desc: 'Competitor IP and technology white space analysis' },
  { key: 'research_trends', label: 'Research Trends', desc: 'Emerging research areas and citation trends' },
  { key: 'innovation_report', label: 'Innovation Scoring', desc: 'AI-powered commercialization potential scores' },
  { key: 'technology_analysis', label: 'Technology Intelligence', desc: 'TRL matrix and sector adoption analysis' },
];

function formatSize(kb) {
  if (!kb) return 'N/A';
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function GenerateModal({ onClose, onGenerated }) {
  const [selectedType, setSelectedType] = useState('executive_summary');
  const [format, setFormat] = useState('PDF');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const report = await reportService.generateReport(selectedType, format);
      setSuccess(true);
      setTimeout(() => {
        onGenerated(report);
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#141b2d] border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-white font-bold text-lg">Generate New Report</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><FaTimes /></button>
        </div>
        <div className="p-5 space-y-4">
          {success ? (
            <div className="text-center py-8">
              <FaCheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-bold">Report Generated!</p>
              <p className="text-slate-400 text-sm mt-1">Your report is ready to download.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs text-slate-400 block mb-2">Report Type</label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {REPORT_TYPES.map(t => (
                    <div
                      key={t.key}
                      onClick={() => setSelectedType(t.key)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedType === t.key ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-[#1c2438] hover:border-slate-600'}`}
                    >
                      <p className={`text-sm font-medium ${selectedType === t.key ? 'text-blue-300' : 'text-white'}`}>{t.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-2">File Format</label>
                <div className="flex gap-2">
                  {['PDF', 'Excel', 'CSV'].map(f => (
                    <button key={f} onClick={() => setFormat(f)}
                      className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${format === f ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                {loading ? <><FaSpinner className="animate-spin" /> Generating...</> : <><FaPlus /> Generate Report</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getReports();
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await reportService.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerated = (newReport) => {
    setReports(prev => [newReport, ...prev]);
  };

  const totalSize = reports.reduce((acc, r) => acc + (r.file_size_kb || 0), 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Reports</h2>
        <p className="text-slate-400 text-sm">Generate and download professional research and analytics reports.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reports', value: reports.length, color: 'text-blue-400' },
          { label: 'Completed', value: reports.filter(r => r.status === 'completed').length, color: 'text-emerald-400' },
          { label: 'Storage Used', value: formatSize(totalSize), color: 'text-cyan-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#1c2438] border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
      >
        <FaPlus /> Generate New Report
      </button>

      {/* Report List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FaFilePdf size={40} className="mx-auto mb-4 opacity-30" />
          <p>No reports yet. Generate your first report!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const Icon = FORMAT_ICON[report.file_format] || FaFilePdf;
            const iconColor = FORMAT_COLOR[report.file_format] || 'text-slate-400 bg-slate-500/10';
            return (
              <div key={report.id} className="bg-[#1c2438] border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex items-center justify-between gap-4 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-sm truncate">{report.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{report.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {report.generated_at ? new Date(report.generated_at).toLocaleDateString() : 'N/A'} • {report.file_format} • {formatSize(report.file_size_kb)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => alert(`Downloading ${report.name}... (In production, this would download the actual file)`)}
                    className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
                    title="Download"
                  >
                    <FaDownload size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    disabled={deletingId === report.id}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-2 hover:bg-rose-500/10 rounded-lg disabled:opacity-40"
                    title="Delete"
                  >
                    {deletingId === report.id ? <FaSpinner size={15} className="animate-spin" /> : <FaTrash size={15} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <GenerateModal onClose={() => setShowModal(false)} onGenerated={handleGenerated} />}
    </div>
  );
}
