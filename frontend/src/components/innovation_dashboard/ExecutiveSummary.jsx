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

  const inventoryCards = [
    {
      title: 'Total Research Concepts',
      value: summary.total_domains ?? summary.total_technology_domains ?? 0,
      icon: FiLayers,
      color: 'from-amber-500/20 to-indigo-500/10 text-amber-400 border-amber-500/30'
    },
    {
      title: 'Nacent Vectors',
      value: summary.emerging ?? summary.emerging_technologies ?? 0,
      icon: FiZap,
      color: 'from-emerald-500/20 to-orange-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      title: 'Ascendant Fields',
      value: summary.growing ?? summary.growing_technologies ?? 0,
      icon: FiTrendingUp,
      color: 'from-yellow-500/20 to-amber-500/10 text-yellow-400 border-cyan-500/30'
    },
    {
      title: 'Consolidated Domains',
      value: summary.mature ?? summary.mature_technologies ?? 0,
      icon: FiCheckCircle,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30'
    }
  ];

  const executionCards = [
    {
      title: 'High Acceleration',
      value: summary.high_momentum ?? summary.high_momentum_technologies ?? 0,
      icon: FiActivity,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30'
    },
    {
      title: 'Market Primed',
      value: summary.commercialization_ready ?? summary.commercialization_ready_technologies ?? 0,
      icon: FiBriefcase,
      color: 'from-green-500/20 to-emerald-500/10 text-green-400 border-green-500/30'
    },
    {
      title: 'Venture Target',
      value: summary.immediate_investment ?? summary.immediate_investment_technologies ?? 0,
      icon: FiDollarSign,
      color: 'from-yellow-500/20 to-amber-500/10 text-yellow-400 border-yellow-500/30'
    }
  ];

  const qualityCards = [
    {
      title: 'Average Novelty Rating',
      numVal: summary.average_innovation_score ?? 0,
      icon: FiAward,
      color: 'from-indigo-500/20 to-violet-500/10 text-indigo-400 border-indigo-500/30'
    },
    {
      title: 'Average Grant Likelihood',
      numVal: summary.average_opportunity_score ?? 0,
      icon: FiTarget,
      color: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30'
    },
    {
      title: 'Average Maturity Rating',
      numVal: summary.average_commercialization_readiness ?? 0,
      icon: FiClock,
      color: 'from-orange-500/20 to-yellow-500/10 text-orange-400 border-orange-500/30'
    },
    {
      title: 'Average Risk Assessment',
      numVal: summary.average_risk_score ?? 0,
      icon: FiShield,
      color: 'from-red-500/20 to-rose-500/10 text-red-400 border-red-500/30'
    }
  ];

  const renderCardGrid = (sectionCards) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {sectionCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx}
            className={`p-4 rounded-xl bg-slate-900/30 border ${card.color} backdrop-blur-md shadow-md transition-all hover:scale-[1.02] hover:shadow-lg flex items-center justify-between`}
          >
            <div>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">{card.title}</p>
              <p className="text-xl font-black text-slate-100">{card.value}</p>
            </div>
            <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
              <Icon size={16} />
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderQualityCardGrid = (sectionCards) => (
    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-w-3xl">
      {sectionCards.map((card, idx) => {
        const Icon = card.icon;
        const valPercent = Math.min(Math.max(card.numVal, 0), 100);
        return (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <Icon className="text-amber-500" size={14} />
                {card.title}
              </span>
              <span className="text-slate-100 font-extrabold">{card.numVal} / 100</span>
            </div>
            
            {/* Range Scale Bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800/80 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${valPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="mb-8 space-y-6" data-testid="ExecutiveSummary">
      
      {/* Category 1: Concept Inventories */}
      <div className="space-y-3">
        <h4 className="text-xs font-black tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          I. Concept Inventories
        </h4>
        {renderCardGrid(inventoryCards)}
      </div>

      {/* Category 2: Pipeline Standing */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-black tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          II. Pipeline Standing
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {executionCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx}
                className={`p-4 rounded-xl bg-slate-900/30 border ${card.color} backdrop-blur-md shadow-md transition-all hover:scale-[1.02] hover:shadow-lg flex items-center justify-between`}
              >
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">{card.title}</p>
                  <p className="text-xl font-black text-slate-100">{card.value}</p>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                  <Icon size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category 3: Quality Index Analytics */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-black tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
          III. Quality Index Analytics
        </h4>
        {renderQualityCardGrid(qualityCards)}
      </div>

    </div>
  );
}
