import React, { useState, useEffect } from 'react';
import { FaBrain, FaChartBar, FaArrowUp, FaInfoCircle } from 'react-icons/fa';
import technologyService from '../../services/technologyService';

const TRL_LABELS = { 1: 'Basic Research', 2: 'Concept', 3: 'Proof of Concept', 4: 'Lab Validation', 5: 'Prototype', 6: 'Pilot Demo', 7: 'Near-Commercial', 8: 'Commercial Ready', 9: 'Deployed' };
const MATURITY_COLORS = {
  'Emerging': 'from-amber-500 to-orange-500',
  'Developing': 'from-blue-500 to-cyan-500',
  'Maturing': 'from-purple-500 to-violet-500',
  'Mature': 'from-emerald-500 to-teal-500',
};
const MATURITY_BG = {
  'Emerging': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Developing': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Maturing': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Mature': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

function TRLBar({ trl, color, name, maturity }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t); }, []);
  const pct = (trl / 9) * 100;
  const gradClass = MATURITY_COLORS[maturity] || 'from-blue-500 to-cyan-500';
  return (
    <div className="bg-[#1c2438] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 mr-2">
          <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">{name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full border mt-1 inline-block ${MATURITY_BG[maturity]}`}>{maturity}</span>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-xl font-bold bg-gradient-to-r ${gradClass} bg-clip-text text-transparent`}>TRL {trl}</div>
          <p className="text-[10px] text-slate-500">{TRL_LABELS[trl]}</p>
        </div>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 mt-3">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${gradClass} transition-all duration-1000 ease-out`}
          style={{ width: animated ? `${pct}%` : '0%' }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-600 mt-1">
        <span>TRL 1</span>
        <span>TRL 9</span>
      </div>
    </div>
  );
}

function AdoptionBar({ sector, adoption_rate, leaders, trend }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-800 last:border-0">
      <div className="w-36 shrink-0">
        <p className="text-sm text-slate-300 font-medium leading-tight">{sector}</p>
        <p className="text-[10px] text-slate-600 mt-0.5 truncate">{leaders.slice(0, 2).join(', ')}</p>
      </div>
      <div className="flex-1">
        <div className="w-full bg-slate-800 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-1000 ease-out"
            style={{ width: animated ? `${adoption_rate}%` : '0%' }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 w-20 shrink-0 justify-end">
        <span className="text-sm font-bold text-white">{adoption_rate}%</span>
        {trend === 'rising' && <FaArrowUp size={10} className="text-emerald-400" />}
      </div>
    </div>
  );
}

export default function TechnologyPage() {
  const [maturityData, setMaturityData] = useState([]);
  const [adoptionData, setAdoptionData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMaturity, setActiveMaturity] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [maturity, adoption, sum] = await Promise.all([
          technologyService.getMaturityData(),
          technologyService.getAdoptionData(),
          technologyService.getSummary()
        ]);
        setMaturityData(maturity);
        setAdoptionData(adoption);
        setSummary(sum);
      } catch (e) {
        console.error('Tech data load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const maturityFilters = ['All', 'Emerging', 'Developing', 'Maturing', 'Mature'];
  const filteredMaturity = activeMaturity === 'All' ? maturityData : maturityData.filter(d => d.maturity === activeMaturity);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Technology Intelligence</h2>
        <p className="text-slate-400 text-sm">Monitor technology readiness levels, market adoption rates, and emerging tech capabilities.</p>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Domains Tracked', value: summary.total_domains_tracked, color: 'text-purple-400' },
            { label: 'Emerging Tech', value: summary.emerging_technologies, color: 'text-amber-400' },
            { label: 'Avg Growth Rate', value: `${summary.avg_growth_rate}%`, color: 'text-cyan-400' },
            { label: 'Sectors Tracked', value: summary.sectors_tracked, color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#1c2438] border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* TRL Matrix */}
          <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold text-lg">Technology Maturity Matrix</h3>
                <p className="text-xs text-slate-500">TRL = Technology Readiness Level (1–9)</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {maturityFilters.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveMaturity(f)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${activeMaturity === f ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredMaturity.map(tech => (
                <TRLBar key={tech.name} trl={tech.trl} color={tech.color} name={tech.name} maturity={tech.maturity} />
              ))}
            </div>
          </div>

          {/* Sector Adoption */}
          <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-6">
            <div className="mb-4">
              <h3 className="text-white font-bold text-lg">Technology Adoption by Sector</h3>
              <p className="text-xs text-slate-500">Market adoption rate across key industry verticals</p>
            </div>
            <div>
              {adoptionData.map(sector => (
                <AdoptionBar key={sector.sector} {...sector} />
              ))}
            </div>
          </div>

          {/* Highest Growth Opportunities */}
          <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">Highest Growth Technologies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...maturityData]
                .sort((a, b) => b.growth_rate - a.growth_rate)
                .slice(0, 6)
                .map(tech => (
                  <div key={tech.name} className="bg-[#0f1523] border border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-slate-200">{tech.name}</p>
                      <span className="text-emerald-400 font-bold text-sm whitespace-nowrap ml-2">+{tech.growth_rate}%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-500">Market:</span>
                      <span className="text-xs text-slate-300">${tech.market_size_b}B</span>
                      <span className={`text-xs ml-auto px-2 py-0.5 rounded-full border ${MATURITY_BG[tech.maturity]}`}>{tech.maturity}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
