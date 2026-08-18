import React, { useState } from 'react';
import api from '../services/api';
import { FileCheck, Download, FileSpreadsheet, FileText } from 'lucide-react';

const ReportsPage = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (type, format) => {
    setDownloading(true);
    try {
      const response = await api.get(`/reports/export?report_type=${type}&format=${format}`, {
        responseType: 'blob',
      });
      
      const fileType = format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        : 'application/pdf';
        
      const blob = new Blob([response.data], { type: fileType });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${type}_intelligence_report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Report download error:", err);
      alert("Failed to download report. Please check server connection.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-brandIce flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-emerald-400" />
          Intelligence Reports & Analytics Exporter
        </h1>
        <p className="text-xs text-brandSage mt-1">
          Export full database intelligence reports to formatted PDF documents or Excel spreadsheets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Funding Report */}
        <div className="glass-panel p-6 rounded-3xl border border-navyBorder flex flex-col justify-between">
          <div>
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 w-fit mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brandIce mb-1">Funding Opportunities Report</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Complete list of active grants, agency budgets, eligibility parameters, and application deadlines.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleDownload('funding', 'pdf')}
              disabled={downloading}
              className="flex-1 py-2.5 bg-brandPrimary hover:bg-brandSecondary text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={() => handleDownload('funding', 'excel')}
              disabled={downloading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Excel
            </button>
          </div>
        </div>

        {/* Research Trend Report */}
        <div className="glass-panel p-6 rounded-3xl border border-navyBorder flex flex-col justify-between">
          <div>
            <div className="p-3 rounded-2xl bg-brandPrimary/30 text-brandCyan w-fit mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brandIce mb-1">15-Year Research Trend Report</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Indexed papers across 15 years (2010–2025), concept frequency distributions, author citations, and publication velocity.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleDownload('research', 'pdf')}
              disabled={downloading}
              className="flex-1 py-2.5 bg-brandPrimary hover:bg-brandSecondary text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={() => handleDownload('research', 'excel')}
              disabled={downloading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Excel
            </button>
          </div>
        </div>

        {/* Patent Report */}
        <div className="glass-panel p-6 rounded-3xl border border-navyBorder flex flex-col justify-between">
          <div>
            <div className="p-3 rounded-2xl bg-brandCyan/20 text-brandCyan w-fit mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brandIce mb-1">Patent & Prior Art Landscape</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              USPTO filings, CPC classifications, assignees, and technology domain clusters.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleDownload('patent', 'pdf')}
              disabled={downloading}
              className="flex-1 py-2.5 bg-brandPrimary hover:bg-brandSecondary text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={() => handleDownload('patent', 'excel')}
              disabled={downloading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
