import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Briefcase, ArrowRight, Building, CheckCircle2, Award, ExternalLink } from 'lucide-react';

const CommercializationPage = () => {
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPathways = async () => {
      try {
        const res = await api.get('/commercialization/pathways');
        setPathways(res.data.recommended_pathways);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPathways();
  }, []);

  const partnerLinks = {
    "Siemens Healthineers": "https://www.siemens-healthineers.com/about/innovation",
    "GE Healthcare": "https://www.gehealthcare.com/about/innovation",
    "Philips BioTech": "https://www.philips.com/a-w/research",
    "Y Combinator Bio": "https://www.ycombinator.com/companies",
    "NSF I-Corps Accelerator": "https://new.nsf.gov/funding/initiatives/i-corps",
    "National Science Foundation": "https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=505884",
    "National Institutes of Health": "https://seed.nih.gov/small-business-funding"
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brandCyan border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-brandIce flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-emerald-400" />
          Commercialization Opportunities & Tech Transfer
        </h1>
        <p className="text-xs text-brandSage mt-1">
          Translating research novelties into IP licenses, university spin-offs, and enterprise partnerships with external program links
        </p>
      </div>

      <div className="space-y-4">
        {pathways.map((item, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-3xl border border-navyBorder hover:border-brandCyan/40 transition">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px]">
                  {item.feasibility_score}% Commercial Feasibility Score
                </span>
                <h3 className="text-base font-bold text-brandIce mt-1">{item.pathway}</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">{item.description}</p>

            <div className="p-4 bg-navyCard rounded-2xl border border-navyBorder text-xs">
              <p className="font-semibold text-brandCyan mb-2.5 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-brandCyan" /> Target Enterprise Partners & Licensing Links:
              </p>
              <div className="flex flex-wrap gap-2">
                {item.target_partners.map((partner, pIdx) => {
                  const link = partnerLinks[partner] || "https://www.uspto.gov/patents/basics/patent-process";
                  return (
                    <a
                      key={pIdx}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-navyPanel hover:bg-brandPrimary text-brandIce font-medium text-[11px] border border-navyBorder flex items-center gap-1.5 transition"
                    >
                      {partner} <ExternalLink className="w-3 h-3 text-brandCyan" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommercializationPage;
