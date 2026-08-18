import { useState } from 'react';
import {
  FileDown, FileText, DollarSign, TrendingUp, Shield, Award,
  Rocket, Loader2, Check, AlertTriangle
} from 'lucide-react';
import client from '../api/client';

const REPORT_TYPES = [
  {
    id: 'funding',
    title: 'Funding Report',
    description: 'Complete overview of funding opportunities including grant names, organizations, research areas, amounts, and deadlines.',
    icon: DollarSign,
    accent: '#10b981',
    pdfEndpoint: '/reports/funding/pdf',
    excelEndpoint: '/reports/funding/excel',
    pdfFilename: 'funding_report.pdf',
    excelFilename: 'funding_report.xlsx',
  },
  {
    id: 'research',
    title: 'Research Trend Report',
    description: 'Publication trends by year, top research keywords, citation analysis, and research area distribution.',
    icon: TrendingUp,
    accent: '#6366f1',
    pdfEndpoint: '/reports/research/pdf',
    excelEndpoint: '/reports/research/excel',
    pdfFilename: 'research_report.pdf',
    excelFilename: 'research_report.xlsx',
  },
  {
    id: 'patent',
    title: 'Patent Report',
    description: 'Patent landscape analysis including technology distribution, filing trends, top assignees, and citation counts.',
    icon: Shield,
    accent: '#f59e0b',
    pdfEndpoint: '/reports/patent/pdf',
    excelEndpoint: '/reports/patent/excel',
    pdfFilename: 'patent_report.pdf',
    excelFilename: 'patent_report.xlsx',
  },
  {
    id: 'innovation',
    title: 'Innovation Report',
    description: 'Innovation scoring results with weighted breakdown (Novelty 30%, Strength 20%, Maturity 15%, Market 20%, Funding 15%).',
    icon: Award,
    accent: '#8b5cf6',
    pdfEndpoint: '/reports/innovation/pdf',
    excelEndpoint: '/reports/innovation/excel',
    pdfFilename: 'innovation_report.pdf',
    excelFilename: 'innovation_report.xlsx',
  },
  {
    id: 'commercialization',
    title: 'Commercialization Report',
    description: 'Commercialization recommendations for patents including startup creation, licensing, industry partnerships, and further research.',
    icon: Rocket,
    accent: '#ec4899',
    pdfEndpoint: '/reports/commercialization/pdf',
    excelEndpoint: '/reports/commercialization/excel',
    pdfFilename: 'commercialization_report.pdf',
    excelFilename: 'commercialization_report.xlsx',
  },
];

export default function Reports() {
  const [downloading, setDownloading] = useState({});
  const [completed, setCompleted] = useState({});

  const handleDownload = async (endpoint, filename, key) => {
    setDownloading(prev => ({ ...prev, [key]: true }));
    setCompleted(prev => ({ ...prev, [key]: false }));
    try {
      const response = await client.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setCompleted(prev => ({ ...prev, [key]: true }));
      setTimeout(() => setCompleted(prev => ({ ...prev, [key]: false })), 3000);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileDown size={28} style={{ color: '#6366f1' }} />
            Reports & Export
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Generate and download detailed reports in PDF and Excel formats
          </p>
        </div>
      </div>

      <div className="reports-grid">
        {REPORT_TYPES.map(report => {
          const Icon = report.icon;
          const pdfKey = `${report.id}-pdf`;
          const excelKey = `${report.id}-excel`;

          return (
            <div
              key={report.id}
              className="report-card"
              style={{ '--accent': report.accent }}
              id={`report-card-${report.id}`}
            >
              <div className="report-card-header">
                <div
                  className="report-card-icon"
                  style={{ background: `${report.accent}22`, color: report.accent }}
                >
                  <Icon size={22} />
                </div>
                <div className="report-card-title">{report.title}</div>
              </div>

              <div className="report-card-desc">{report.description}</div>

              <div className="report-actions">
                {report.pdfEndpoint && (
                  <button
                    className="btn-download pdf"
                    onClick={() => handleDownload(report.pdfEndpoint, report.pdfFilename, pdfKey)}
                    disabled={downloading[pdfKey]}
                    id={`btn-pdf-${report.id}`}
                  >
                    {downloading[pdfKey] ? (
                      <><Loader2 size={14} className="spinner" /> Generating…</>
                    ) : completed[pdfKey] ? (
                      <><Check size={14} /> Downloaded</>
                    ) : (
                      <><FileText size={14} /> Download PDF</>
                    )}
                  </button>
                )}

                {report.excelEndpoint && (
                  <button
                    className="btn-download excel"
                    onClick={() => handleDownload(report.excelEndpoint, report.excelFilename, excelKey)}
                    disabled={downloading[excelKey]}
                    id={`btn-excel-${report.id}`}
                  >
                    {downloading[excelKey] ? (
                      <><Loader2 size={14} className="spinner" /> Generating…</>
                    ) : completed[excelKey] ? (
                      <><Check size={14} /> Downloaded</>
                    ) : (
                      <><FileDown size={14} /> Download Excel</>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
