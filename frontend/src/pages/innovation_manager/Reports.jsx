import React, { useState, useEffect } from 'react';
import { generateReport, downloadReport, listReports, getReportTypes } from '../../services/reportService';
import { 
  FaFileAlt, 
  FaDownload, 
  FaFilePdf, 
  FaFileCsv, 
  FaFileCode, 
  FaSyncAlt, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaFilter,
  FaHistory,
  FaSpinner
} from 'react-icons/fa';

export default function Reports() {
  const [reportType, setReportType] = useState('patent_landscape');
  const [format, setFormat] = useState('pdf');
  const [domain, setDomain] = useState('Robotics & AI');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2026-08-16');

  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await listReports();
      setReportHistory(res.reports || []);
    } catch (err) {
      console.error('Failed to load report history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const result = await generateReport({
        report_type: reportType,
        format,
        domain,
        date_from: dateFrom,
        date_to: dateTo,
      });

      setLastGenerated(result);
      setSuccessMsg(`Report '${result.report_id}' successfully generated and saved to server storage.`);
      
      // Refresh history list
      await fetchHistory();

      // Trigger instant download
      await downloadReport(result.report_id, result.filename);
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.response?.data?.detail || 'Failed to generate report. Please check API connection.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadExisting = async (reportId, filename) => {
    try {
      await downloadReport(reportId, filename);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download report file.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <FaFileAlt size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Executive Reports & Analytics Generator</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure custom analytical parameters, export structured PDF/CSV/JSON reports, and access saved report archives.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
        >
          <FaSyncAlt size={12} />
          Refresh History
        </button>
      </header>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <FaExclamationTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <FaCheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Form & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Configuration Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FaFilter className="text-amber-400" />
            <span>Report Parameters Configuration</span>
          </h2>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Report Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Report Category</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="patent_landscape">Patent Landscape & Intellectual Property Report</option>
                <option value="technology_intelligence">Technology Intelligence & Emergent Trends Report</option>
                <option value="innovation_scores">Institutional Innovation Standing & Scoring Report</option>
                <option value="commercialization">Technology Transfer & Commercialization Strategy Report</option>
                <option value="funding_matrix">Capital Grants & Funding Opportunity Alignment Report</option>
              </select>
            </div>

            {/* Export Format Selector Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Output Format</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('pdf')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    format === 'pdf' ? 'bg-amber-600 border-amber-500 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <FaFilePdf size={16} />
                  <span>PDF Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    format === 'csv' ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <FaFileCsv size={16} />
                  <span>CSV Spreadsheet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    format === 'json' ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <FaFileCode size={16} />
                  <span>JSON Payload</span>
                </button>
              </div>
            </div>

            {/* Filter Parameters: Domain & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Target Domain</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={generating}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xl transition flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <FaSpinner className="animate-spin" size={14} />
                  <span>Compiling & Exporting Report...</span>
                </>
              ) : (
                <>
                  <FaDownload size={14} />
                  <span>Generate & Download Report</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Status & Last Generated Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FaFileAlt className="text-emerald-400" />
            <span>Generation Output Preview</span>
          </h2>

          {lastGenerated ? (
            <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Report Generated</span>
                <span className="text-[10px] font-mono text-slate-400">{lastGenerated.generated_at}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{lastGenerated.filename}</h4>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">ID: {lastGenerated.report_id}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">Format: <strong className="text-slate-200 uppercase">{lastGenerated.format}</strong></span>
                <span className="text-slate-400">Size: <strong className="text-slate-200">{(lastGenerated.size_bytes / 1024).toFixed(1)} KB</strong></span>
              </div>
              <button
                onClick={() => handleDownloadExisting(lastGenerated.report_id, lastGenerated.filename)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2"
              >
                <FaDownload size={12} />
                <span>Re-download File</span>
              </button>
            </div>
          ) : (
            <div className="p-6 bg-slate-950/60 border border-slate-800/80 rounded-xl text-center space-y-2">
              <FaFileAlt className="mx-auto text-slate-600" size={32} />
              <p className="text-xs text-slate-400 font-medium">No report generated in this session yet.</p>
              <p className="text-[11px] text-slate-500">Configure parameters on the left and click 'Generate & Download Report'.</p>
            </div>
          )}
        </div>
      </div>

      {/* Generated Reports History Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FaHistory className="text-purple-400" />
          <span>Saved Reports Archive (`backend/reports/generated/`)</span>
        </h2>
        
        {reportHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Created Timestamp</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {reportHistory.map((rep, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-bold text-purple-400">{rep.report_id}</td>
                    <td className="py-3 px-4 font-semibold text-white">{rep.filename}</td>
                    <td className="py-3 px-4 uppercase font-bold text-slate-400">{rep.format}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{rep.created_at}</td>
                    <td className="py-3 px-4">{(rep.size_bytes / 1024).toFixed(1)} KB</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDownloadExisting(rep.report_id, rep.filename)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-lg transition inline-flex items-center gap-1.5"
                      >
                        <FaDownload size={11} />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500">No report archives found in backend storage.</p>
        )}
      </div>
    </div>
  );
}
