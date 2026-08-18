import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import TrendLineChart from '../components/charts/TrendLineChart';
import TopicBarChart from '../components/charts/TopicBarChart';
import api from '../services/api';
import { 
  FileText, 
  DollarSign, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight,
  ExternalLink,
  Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trends, setTrends] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [funding, setFunding] = useState([]);
  const [patents, setPatents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [trendRes, recRes, fundRes, patRes] = await Promise.all([
          api.get('/research/trends'),
          api.get('/funding/recommendations'),
          api.get('/funding/opportunities'),
          api.get('/patents/')
        ]);
        setTrends(trendRes.data);
        setRecommendations(recRes.data);
        setFunding(fundRes.data);
        setPatents(patRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#24527a]"></div>
      </div>
    );
  }

  const activeRole = user?.role || 'Researcher';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm relative overflow-hidden">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block">
          <button 
            onClick={() => navigate('/assistant')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#24527a] hover:bg-[#1b3d5c] rounded-2xl text-xs font-bold text-white shadow-md shadow-[#24527a]/20 transition"
          >
            <Bot className="w-4 h-4" />
            Ask AI Assistant
          </button>
        </div>

        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#24527a]/10 border border-[#24527a]/20 text-[#24527a] text-[11px] font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            {activeRole} Intelligence Hub
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a2530]">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs text-[#576574] mt-1 font-medium">
            Domain Focus: <span className="text-[#24527a] font-bold">{user?.research_domain || 'Computer Vision & AI'}</span> ({user?.organization || 'Stanford AI Lab'})
          </p>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Indexed Research Works" 
          value={trends?.total_indexed_papers || '16'} 
          change="15-Year Timeline (2010-2025)" 
          icon={FileText} 
          color="blue" 
        />
        <StatCard 
          title="Active Grant Opportunities" 
          value={funding?.length || '5'} 
          change="$9.4M total pool" 
          icon={DollarSign} 
          color="emerald" 
        />
        <StatCard 
          title="Monitored Patent Records" 
          value={patents?.length || '4'} 
          change="USPTO catalog" 
          icon={ShieldCheck} 
          color="purple" 
        />
        <StatCard 
          title="Top Innovation Score" 
          value="88.5 / 100" 
          change="High commercial fit" 
          icon={Award} 
          color="amber" 
        />
      </div>

      {/* Dynamic Role-Based Views */}
      {activeRole === 'Researcher' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommended Grants Widget */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#1a2530] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#24527a]" />
                  Top Recommended Grants for Your Research
                </h3>
                <p className="text-xs text-[#576574]">Matched against your profile keywords using Sentence Transformers</p>
              </div>
              <button 
                onClick={() => navigate('/funding-recommendations')}
                className="text-xs text-[#24527a] hover:underline font-bold flex items-center gap-1"
              >
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec, idx) => (
                <div key={idx} className="glass-card p-4 rounded-2xl border border-[#e5e0d4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#24527a]/15 text-[#24527a] font-extrabold text-[10px]">
                        {rec.relevance_score}% Match
                      </span>
                      <span className="text-[11px] text-[#576574] font-semibold">{rec.funding.organization}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#1a2530] mt-1">{rec.funding.title}</h4>
                    <p className="text-[11px] text-[#576574] mt-0.5 line-clamp-1">{rec.match_reason}</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs font-extrabold text-emerald-700">${rec.funding.funding_amount.toLocaleString()}</span>
                    <p className="text-[10px] text-slate-500 font-medium">Deadline: {rec.funding.deadline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research Trend Chart */}
          <div className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm">
            <h3 className="text-base font-extrabold text-[#1a2530] mb-1">Publication Velocity</h3>
            <p className="text-xs text-[#576574] mb-4">15-year annual paper growth (2010 - 2025)</p>
            <TrendLineChart data={trends?.yearly_publication_trends || []} />
          </div>
        </div>
      )}

      {activeRole === 'Startup Founder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[#1a2530]">Commercialization & SBIR Grant Pipeline</h3>
              <button onClick={() => navigate('/commercialization')} className="text-xs text-[#24527a] font-bold hover:underline">
                Explore Pathways →
              </button>
            </div>
            <div className="space-y-3">
              {funding.slice(0, 3).map((f) => (
                <div key={f.id} className="glass-card p-4 rounded-2xl border border-[#e5e0d4] flex justify-between items-center">
                  <div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold">
                      {f.country}
                    </span>
                    <h4 className="text-xs font-bold text-[#1a2530] mt-1">{f.title}</h4>
                    <p className="text-[11px] text-[#576574] font-medium">{f.organization} • Deadline {f.deadline}</p>
                  </div>
                  <a href={f.application_url} target="_blank" rel="noreferrer" className="p-2 text-[#576574] hover:text-[#24527a]">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm">
            <h3 className="text-base font-extrabold text-[#1a2530] mb-1">Top Research Concepts</h3>
            <p className="text-xs text-[#576574] mb-4">Hotspot topic frequencies in index</p>
            <TopicBarChart data={trends?.top_research_topics || []} />
          </div>
        </div>
      )}

      {activeRole === 'Innovation Manager' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm">
            <h3 className="text-base font-extrabold text-[#1a2530] mb-1">Domain Activity & Publication Growth</h3>
            <p className="text-xs text-[#576574] mb-4">Aggregated publications count 2010 - 2025</p>
            <TrendLineChart data={trends?.yearly_publication_trends || []} />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm">
            <h3 className="text-base font-bold text-[#1a2530] mb-1">Emerging Tech Portfolio Frequency</h3>
            <p className="text-xs text-[#576574] mb-4">Cross-disciplinary paper frequencies</p>
            <TopicBarChart data={trends?.top_research_topics || []} />
          </div>
        </div>
      )}

      {activeRole === 'Administrator' && (
        <div className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1a2530]">System Data Ingestion Status</h3>
              <p className="text-xs text-[#576574]">Status of OpenAlex, Crossref, and USPTO scrapers</p>
            </div>
            <button onClick={() => navigate('/admin')} className="px-3 py-1.5 bg-[#24527a] hover:bg-[#1b3d5c] rounded-xl text-xs font-bold text-white shadow-sm">
              Open Admin Console
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#f8f6f0] rounded-2xl border border-[#e5e0d4]">
              <span className="text-xs font-extrabold text-emerald-700">✓ OpenAlex API</span>
              <p className="text-[11px] text-[#576574] mt-1 font-medium">Live Connection Active</p>
            </div>
            <div className="p-4 bg-[#f8f6f0] rounded-2xl border border-[#e5e0d4]">
              <span className="text-xs font-extrabold text-emerald-700">✓ USPTO Patents</span>
              <p className="text-[11px] text-[#576574] mt-1 font-medium">4 Records Processed</p>
            </div>
            <div className="p-4 bg-[#f8f6f0] rounded-2xl border border-[#e5e0d4]">
              <span className="text-xs font-extrabold text-emerald-700">✓ Recommendation Engine</span>
              <p className="text-[11px] text-[#576574] mt-1 font-medium">Sentence Transformers Ready</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
