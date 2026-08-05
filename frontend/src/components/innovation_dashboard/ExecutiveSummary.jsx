import React from 'react';
import { 
  FiLayers, 
  FiTrendingUp, 
  FiActivity, 
  FiCheckCircle, 
  FiAward, 
  FiDollarSign, 
  FiZap, 
  FiTarget,
  FiShield,
  FiClock,
  FiBriefcase
} from 'react-icons/fi';

export default function ExecutiveSummary({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      title: 'Total Technology Domains',
      value: summary.total_domains ?? summary.total_technology_domains ?? 0,
      icon: FiLayers,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30'
    },
    {
      title: 'Emerging Technologies',
      value: summary.emerging ?? summary.emerging_technologies ?? 0,
      icon: FiZap,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      title: 'Growing Technologies',
      value: summary.growing ?? summary.growing_technologies ?? 0,
      icon: FiTrendingUp,
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30'
    },
    {
      title: 'Mature Technologies',
      value: summary.mature ?? summary.mature_technologies ?? 0,
      icon: FiCheckCircle,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30'
    },
    {
      title: 'High Momentum',
      value: summary.high_momentum ?? summary.high_momentum_technologies ?? 0,
      icon: FiActivity,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30'
    },
    {
      title: 'Commercialization Ready',
      value: summary.commercialization_ready ?? summary.commercialization_ready_technologies ?? 0,
      icon: FiBriefcase,
      color: 'from-green-500/20 to-emerald-500/10 text-green-400 border-green-500/30'
    },
    {
      title: 'Immediate Investment',
      value: summary.immediate_investment ?? summary.immediate_investment_technologies ?? 0,
      icon: FiDollarSign,
      color: 'from-yellow-500/20 to-amber-500/10 text-yellow-400 border-yellow-500/30'
    },
    {
      title: 'Avg Innovation Score',
      value: summary.average_innovation_score !== undefined ? `${summary.average_innovation_score}/100` : 'N/A',
      icon: FiAward,
      color: 'from-indigo-500/20 to-violet-500/10 text-indigo-400 border-indigo-500/30'
    },
    {
      title: 'Avg Opportunity Score',
      value: summary.average_opportunity_score !== undefined ? `${summary.average_opportunity_score}/100` : 'N/A',
      icon: FiTarget,
      color: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30'
    },
    {
      title: 'Avg Readiness Score',
      value: summary.average_commercialization_readiness !== undefined ? `${summary.average_commercialization_readiness}/100` : 'N/A',
      icon: FiClock,
      color: 'from-teal-500/20 to-cyan-500/10 text-teal-400 border-teal-500/30'
    },
    {
      title: 'Avg Risk Score',
      value: summary.average_risk_score !== undefined ? `${summary.average_risk_score}/100` : 'N/A',
      icon: FiShield,
      color: 'from-red-500/20 to-rose-500/10 text-red-400 border-red-500/30'
    }
  ];

  return (
    <div className="mb-8" data-testid="ExecutiveSummary">
      <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-blue-500"></span>
        Executive Summary KPIs
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className={`p-4 rounded-xl bg-gradient-to-br bg-slate-900/80 border ${card.color} backdrop-blur-md shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl`}
              data-testid="KpiCard"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div className={`p-2 rounded-lg bg-slate-800/80 ${card.color.split(' ')[2]}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white tracking-tight">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
