import React, { useState } from 'react';
import publicationService from '../../services/publicationService';
import patentService from '../../services/patentService';

export default function Reports() {
  const [reportType, setReportType] = useState('publications');
  const [format, setFormat] = useState('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      // Fetch relevant data based on report type
      let data = [];
      if (reportType === 'publications') {
        data = await publicationService.getPublications();
      } else {
        data = await patentService.getPatents();
      }

      // Filter by date if provided (mock logic for demonstration)
      if (startDate || endDate) {
        data = data.filter(item => {
          const itemYear = item.publication_year || item.filing_year;
          if (!itemYear) return true;
          
          let isValid = true;
          if (startDate) {
            const startYear = new Date(startDate).getFullYear();
            if (itemYear < startYear) isValid = false;
          }
          if (endDate) {
            const endYear = new Date(endDate).getFullYear();
            if (itemYear > endYear) isValid = false;
          }
          return isValid;
        });
      }

      // Generate CSV
      if (data.length === 0) {
        setMessage({ type: 'warning', text: 'No data found for the selected criteria.' });
        return;
      }

      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => 
        Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      const csvContent = `${headers}\n${rows}`;
      
      // Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({ type: 'success', text: `Successfully generated ${reportType} report.` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to generate report. Please try again.' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-400 mb-2">Reports & Analytics Generator</h1>
          <p className="text-slate-400">
            Configure report parameters, select data ranges, and download compiled reports of research output.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border ${
            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            message.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
            'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Data Source</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="publications">Publications Portfolio</option>
                <option value="patents">Patent Landscapes</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Export Format</label>
              <select 
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="csv">CSV (Spreadsheet)</option>
                <option value="pdf" disabled>PDF Document (Coming Soon)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Start Date (Optional)</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">End Date (Optional)</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700 flex justify-end">
            <button 
              onClick={handleGenerate}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all"
            >
              {generating ? 'Generating...' : 'Generate Custom Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
