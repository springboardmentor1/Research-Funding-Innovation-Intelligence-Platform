import React from 'react';
import KpiCard from './KpiCard';
import { 
  FaBookOpen, 
  FaLightbulb, 
  FaFileInvoiceDollar, 
  FaAtom, 
  FaGlobe, 
  FaBuilding 
} from 'react-icons/fa';

export default function SummaryGrid({ summary }) {
  if (!summary) return null;

  const kpis = [
    {
      title: 'Total Publications',
      value: summary.total_publications?.toLocaleString() || '0',
      icon: FaBookOpen,
      color: 'blue',
    },
    {
      title: 'Total Patents',
      value: summary.total_patents?.toLocaleString() || '0',
      icon: FaLightbulb,
      color: 'emerald',
    },
    {
      title: 'Funding Opportunities',
      value: summary.total_funding_opportunities?.toLocaleString() || '0',
      icon: FaFileInvoiceDollar,
      color: 'purple',
    },
    {
      title: 'Research Domains',
      value: summary.total_research_domains || '0',
      icon: FaAtom,
      color: 'cyan',
    },
    {
      title: 'Unique Agencies',
      value: summary.total_funding_agencies || '0',
      icon: FaBuilding,
      color: 'amber',
    },
    {
      title: 'Active Countries',
      value: summary.total_countries || '0',
      icon: FaGlobe,
      color: 'rose',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {kpis.map((kpi, idx) => (
        <KpiCard
          key={idx}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          color={kpi.color}
        />
      ))}
    </div>
  );
}
