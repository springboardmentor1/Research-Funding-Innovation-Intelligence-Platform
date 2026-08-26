import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaBookmark, FaExternalLinkAlt, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import fundingService from '../../services/fundingService';

const fundingTags = ['NSF', 'NIH', 'DARPA', 'DOE', 'NASA', 'Quantum', 'AI/ML', 'Biotech'];

export default function FundingDiscovery() {
  const [fundingData, setFundingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFunding = async () => {
      try {
        setLoading(true);
        // Ensure params matches backend API expectations if any
        const response = await fundingService.getFundingRecommendations({ limit: 10 });
        
        // Map backend format to component state
        if (response && response.recommendations) {
          const mappedData = response.recommendations.map((item) => ({
            title: item.title || 'Untitled Opportunity',
            description: item.recommendation_reason || `${item.research_domain || ''} — ${item.funding_type || 'Grant'}`.trim(),
            agency: item.funding_agency || 'Unknown Agency',
            amount: item.funding_amount != null ? `$${Number(item.funding_amount).toLocaleString()}` : 'Varies',
            deadline: item.deadline || item.application_deadline || 'Ongoing',
            eligibility: item.country ? `${item.country} eligible` : 'See guidelines',
            matchScore: item.match_score != null ? Math.round(item.match_score) : 0,
            url: item.url || item.source_url || '#',
            verified: item.verified || false
          }));
          setFundingData(mappedData);
        }
      } catch (err) {
        console.error('Failed to fetch funding data:', err);
        const status = err?.response?.status;
        const detail = err?.response?.data?.detail;
        let errorMsg = 'Failed to load funding recommendations from the server.';
        if (status === 401) {
          errorMsg = 'You must be logged in to view funding recommendations. Please log in and try again.';
        } else if (status === 404 && detail) {
          errorMsg = `${detail} — Please complete your Research Profile first.`;
        } else if (status >= 500) {
          errorMsg = `Server error (${status}). Please try again later or contact support.`;
        }
        setError(errorMsg);

        // Graceful fallback mock data
        setFundingData([
          {
            title: 'Quantum Computing Research Initiative',
            description: 'Support for fundamental quantum computing research',
            agency: 'National Science Foundation',
            amount: '$500K - $2M',
            deadline: 'Aug 15, 2026',
            eligibility: 'University, Research Institute',
            matchScore: 94,
            url: 'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=505085',
            verified: true
          },
          {
            title: 'Biomedical Innovation Grant',
            description: 'Accelerating biomedical innovation and development',
            agency: 'National Institutes of Health',
            amount: '$250K - $1M',
            deadline: 'Sep 1, 2026',
            eligibility: 'All Organizations',
            matchScore: 87,
            url: 'https://grants.nih.gov/grants/guide/pa-files/PAR-22-094.html',
            verified: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFunding();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Funding Marketplace</h2>
        <p className="text-slate-400 text-sm">Discover and apply to funding opportunities tailored to your research</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search funding opportunities..." 
              className="w-full bg-[#0f1523] text-sm text-slate-200 rounded-xl pl-10 pr-4 py-3 border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#2d3748] hover:bg-[#3a465c] text-white px-5 py-3 rounded-xl transition-colors text-sm font-medium">
            <FaFilter size={12} />
            Filters
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {fundingTags.map((tag) => (
            <button key={tag} className="px-3 py-1.5 bg-[#0f1523] border border-slate-700 hover:border-slate-500 rounded-full text-xs text-slate-300 transition-colors">
              {tag}
            </button>
          ))}
        </div>
      </div>
      
      {/* Loading & Error States */}
      {loading && (
        <div className="flex items-center justify-center p-12 text-blue-400 animate-pulse">
          <FaSpinner className="animate-spin mr-3" size={24} />
          <span>Searching for matching funding opportunities...</span>
        </div>
      )}
      
      {error && !loading && (
        <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>
      )}

      {/* Funding Cards List */}
      {!loading && (
        <div className="space-y-4">
          {fundingData.map((item, idx) => (
            <div key={idx} className="bg-[#1c2438] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-colors">
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    {item.verified && (
                      <span className="flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        <FaCheckCircle size={10} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{item.description}</p>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Agency</p>
                    <p className="text-slate-200 font-medium">{item.agency}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Amount</p>
                    <p className="text-cyan-400 font-semibold">{item.amount}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Deadline</p>
                    <p className="text-slate-200 font-medium">{item.deadline}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Eligibility</p>
                    <p className="text-slate-200 font-medium truncate max-w-[200px]" title={item.eligibility}>{item.eligibility}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center justify-between gap-4 md:min-w-[120px]">
                <div className="text-right flex flex-col items-end w-full">
                  <p className="text-slate-500 text-xs mb-1 text-center w-full">AI Match Score</p>
                  <div className="text-lg font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-4 py-1.5 text-center w-full">
                    {item.matchScore}%
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <button className="p-2.5 text-slate-400 hover:text-white bg-[#0f1523] border border-slate-700 rounded-lg transition-colors">
                    <FaBookmark size={14} />
                  </button>
                  {item.url && item.url !== '#' ? (
                    <a 
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    >
                      Apply Now <FaExternalLinkAlt size={10} />
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="flex-1 flex justify-center items-center gap-2 bg-slate-700 text-slate-400 cursor-not-allowed px-4 py-2.5 rounded-lg text-sm font-medium"
                    >
                      Apply Now <FaExternalLinkAlt size={10} />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
