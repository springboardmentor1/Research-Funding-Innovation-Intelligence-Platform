import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DollarSign, Search, ExternalLink, Calendar, Globe, Building } from 'lucide-react';

const FundingDiscoveryPage = () => {
  const [grants, setGrants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFunding = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (areaFilter) params.area = areaFilter;
      const res = await api.get('/funding/opportunities', { params });
      setGrants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunding();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a2530]">Funding Opportunities Directory</h1>
        <p className="text-xs text-[#576574] mt-1 font-semibold">
          Government grants, research councils, SBIR/STTR innovation funds, and venture programs
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#e2ded4] shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#576574] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchFunding()}
            placeholder="Search grant titles, agencies, descriptions, or eligibility..."
            className="w-full bg-white border border-[#dcd6c8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1a2530] font-semibold focus:outline-none focus:border-[#24527a]"
          />
        </div>

        <input
          type="text"
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          placeholder="Research Area (e.g. Artificial Intelligence)"
          className="bg-white border border-[#dcd6c8] rounded-xl px-4 py-2.5 text-xs text-[#1a2530] font-semibold focus:outline-none focus:border-[#24527a] md:w-64"
        />

        <button
          onClick={fetchFunding}
          className="px-5 py-2.5 bg-[#24527a] hover:bg-[#1b3d5c] text-white font-bold rounded-xl text-xs shadow-md transition"
        >
          Filter Grants
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#24527a] border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {grants.map((grant) => (
            <div key={grant.id} className="bg-white p-5 rounded-2xl border border-[#e2ded4] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#24527a]/10 text-[#24527a] font-extrabold text-[10px]">
                    {grant.country}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700">
                    ${grant.funding_amount.toLocaleString()} {grant.currency}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#1a2530] mb-1">{grant.title}</h3>
                <p className="text-xs text-[#247291] font-bold mb-2 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> {grant.organization}
                </p>
                <p className="text-xs text-[#576574] line-clamp-3 leading-relaxed mb-3">{grant.description}</p>
              </div>

              <div>
                <div className="p-2.5 bg-[#f8f6f0] rounded-xl border border-[#e5e0d4] mb-3 text-[11px]">
                  <p className="text-[#1a2530] font-semibold">Eligibility: <span className="text-[#576574]">{grant.eligibility}</span></p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#e2ded4]">
                  <span className="text-[11px] text-[#576574] font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" /> Deadline: <strong className="text-[#1a2530]">{grant.deadline}</strong>
                  </span>
                  {grant.application_url && (
                    <a
                      href={grant.application_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#24527a] hover:underline"
                    >
                      Apply Now <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FundingDiscoveryPage;
