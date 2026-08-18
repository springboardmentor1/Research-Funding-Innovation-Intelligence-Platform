import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Cpu, Zap, Activity, ShieldCheck, DollarSign } from 'lucide-react';

const TechnologyIntelligencePage = () => {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const res = await api.get('/technology/emerging');
        setTechs(res.data.emerging_technologies);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTechs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#24527a] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a2530] flex items-center gap-2">
          <Cpu className="w-6 h-6 text-[#24527a]" />
          Emerging Technology Intelligence & Growth Matrix
        </h1>
        <p className="text-xs text-[#576574] mt-1 font-semibold">
          Multimodal technology signal aggregation: Research Papers + Patent Filings + Funding Budgets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {techs.map((tech) => (
          <div key={tech.id} className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm flex flex-col justify-between hover:border-[#24527a]/40 transition">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#24527a]/15 text-[#24527a] font-extrabold text-[10px]">
                  {tech.status} Technology
                </span>
                <span className="text-xs font-extrabold text-emerald-700">+{tech.growth_rate}% Growth YoY</span>
              </div>

              <h3 className="text-sm font-extrabold text-[#1a2530] mb-1">{tech.name}</h3>
              <p className="text-xs text-[#247291] font-bold mb-2">{tech.category}</p>
              <p className="text-xs text-[#576574] leading-relaxed mb-4 font-medium">{tech.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#e2ded4] text-center text-xs">
              <div className="p-2 bg-[#f8f6f0] rounded-xl border border-[#e5e0d4]">
                <p className="text-[10px] text-[#576574] font-bold">Papers</p>
                <p className="font-extrabold text-[#1a2530] mt-0.5">{tech.paper_count}</p>
              </div>

              <div className="p-2 bg-[#f8f6f0] rounded-xl border border-[#e5e0d4]">
                <p className="text-[10px] text-[#576574] font-bold">Patents</p>
                <p className="font-extrabold text-[#1a2530] mt-0.5">{tech.patent_count}</p>
              </div>

              <div className="p-2 bg-[#f8f6f0] rounded-xl border border-[#e5e0d4]">
                <p className="text-[10px] text-[#576574] font-bold">Grant Total</p>
                <p className="font-extrabold text-emerald-700 mt-0.5">${(tech.funding_total / 1e6).toFixed(1)}M</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnologyIntelligencePage;
