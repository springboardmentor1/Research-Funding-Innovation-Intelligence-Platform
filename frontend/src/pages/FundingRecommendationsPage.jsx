import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ExternalLink, Calendar, CheckCircle, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const FundingRecommendationsPage = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/funding/recommendations');
        setRecommendations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a2530] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#24527a]" />
            AI Matched Funding Opportunities
          </h1>
          <p className="text-xs text-[#576574] mt-1 font-semibold">
            Sentence Transformers embeddings semantic cosine similarity matching user profile keywords
          </p>
        </div>

        <Link to="/profile" className="px-4 py-2 bg-white hover:bg-[#f7f4ed] text-xs font-bold text-[#24527a] rounded-xl border border-[#e2ded4] shadow-sm w-fit">
          Edit Profile Keywords ⚙️
        </Link>
      </div>

      {/* User Profile Context Alert */}
      <div className="bg-white p-4 rounded-2xl border border-[#24527a]/30 text-xs text-[#1a2530] flex items-center gap-3 shadow-sm">
        <div className="p-2 rounded-xl bg-[#24527a]/15 text-[#24527a] font-extrabold shrink-0">AI PROFILE</div>
        <div>
          <p className="font-extrabold text-[#1a2530]">Matching parameters active for {user?.full_name}:</p>
          <p className="text-[#576574] text-[11px] font-medium">Domain: <span className="text-[#24527a] font-bold">{user?.research_domain}</span> • Keywords: <span className="text-[#24527a] font-bold">{user?.keywords}</span></p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#24527a] border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm hover:border-[#24527a]/40 transition">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-[#e2ded4]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-3 py-1 rounded-full bg-[#24527a] text-white font-extrabold text-xs shadow-sm">
                      {rec.relevance_score}% Relevance Score
                    </span>
                    <span className="text-xs text-[#576574] font-bold">{rec.funding.organization}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#1a2530]">{rec.funding.title}</h3>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <span className="text-lg font-extrabold text-emerald-700">
                    ${rec.funding.funding_amount.toLocaleString()} {rec.funding.currency}
                  </span>
                  <p className="text-xs text-[#576574] flex items-center gap-1 md:justify-end mt-0.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" /> Deadline: {rec.funding.deadline}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#576574] leading-relaxed mb-4 font-medium">{rec.funding.description}</p>

              <div className="p-3 bg-[#f8f6f0] rounded-2xl border border-[#e5e0d4] text-xs space-y-1 mb-4">
                <p className="font-extrabold text-[#24527a] flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Reason for AI Recommendation:
                </p>
                <p className="text-[#576574] text-[11px] pl-5 font-medium">{rec.match_reason}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {rec.match_keywords?.map((kw, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded bg-[#24527a]/10 border border-[#24527a]/20 text-[#24527a] text-[10px] font-bold">
                      Matched #{kw}
                    </span>
                  ))}
                </div>

                {rec.funding.application_url && (
                  <a
                    href={rec.funding.application_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[#24527a] hover:bg-[#1b3d5c] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    Apply for Grant <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FundingRecommendationsPage;
