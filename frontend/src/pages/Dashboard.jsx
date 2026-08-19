import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import SummaryGrid from '../components/dashboard/SummaryGrid';
import PublicationCharts from '../components/dashboard/PublicationCharts';
import PatentCharts from '../components/dashboard/PatentCharts';
import FundingCharts from '../components/dashboard/FundingCharts';
import { 
  FaSyncAlt, 
  FaExclamationTriangle, 
  FaChartPie, 
  FaBook, 
  FaRegCopyright, 
  FaCoins, 
  FaArrowRight, 
  FaCompass, 
  FaSearch, 
  FaRocket, 
  FaSlidersH,
  FaLightbulb,
  FaQuestionCircle
} from 'react-icons/fa';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await dashboardService.getDashboardAnalytics();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        setError('Session expired. Redirecting to login page...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(err.response?.data?.detail || 'An error occurred while loading dashboard metrics. Please check if the backend API is running.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin animate-reverse"></div>
        </div>
        <p className="mt-6 text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">
          Assembling Intelligence Analytics...
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
            <FaExclamationTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200">Unable to Load Dashboard</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => fetchAnalytics()}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const launchers = [
    {
      title: 'Grant Opportunity Matches',
      desc: 'Discover active funding calls with AI percentage match scores.',
      action: 'Find Grants',
      path: '/funding',
      icon: FaCoins,
      color: 'from-purple-500/20 to-indigo-500/5 text-purple-400 border-purple-500/30',
      btnBg: 'bg-purple-600 hover:bg-purple-500',
    },
    {
      title: 'Scientific Publications',
      desc: 'Query OpenAlex database & view paper abstracts and citation counts.',
      action: 'Search Papers',
      path: '/publications',
      icon: FaBook,
      color: 'from-amber-500/20 to-yellow-500/5 text-amber-400 border-amber-500/30',
      btnBg: 'bg-amber-600 hover:bg-amber-500',
    },
    {
      title: 'Innovation Matrix',
      desc: 'Analyze patent landscapes, IPC domains & commercial readiness scores.',
      action: 'View Matrix',
      path: '/innovation/dashboard',
      icon: FaRocket,
      color: 'from-emerald-500/20 to-orange-500/5 text-emerald-400 border-emerald-500/30',
      btnBg: 'bg-emerald-600 hover:bg-emerald-500',
    },
    {
      title: 'Research Profile Context',
      desc: 'Set your domain, institution, & keywords to fine-tune AI recommendations.',
      action: 'Edit Profile',
      path: '/researcher/profile',
      icon: FaSlidersH,
      color: 'from-amber-500/20 to-orange-500/5 text-amber-400 border-amber-500/30',
      btnBg: 'bg-amber-600 hover:bg-amber-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      <div className="max-w-7xl mx-auto w-full space-y-10">
        
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-xl">
                <FaChartPie size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                IgniteFunding Intelligence Hub
              </h1>
            </div>
            <p className="text-sm text-slate-400 font-medium max-w-xl">
              Consolidated real-time intelligence mapping global literature databases, patent portfolios, and venture grants.
            </p>
          </div>

          <div className="flex items-center sm:self-start gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sync Status</p>
              <p className="text-xs font-bold text-slate-300">
                Updated: {data?.summary?.last_analytics_update || '2026-08-11'}
              </p>
            </div>
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-50 text-slate-300 hover:text-white rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold transition-all"
            >
              <FaSyncAlt size={12} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refresh Data' : 'Sync Intelligence'}
            </button>
          </div>
        </header>

        {/* Hero Explanatory Guide Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-orange-950/20 to-slate-900 border border-orange-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <FaCompass size={12} />
                <span>Core Operational Control</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                Welcome to IgniteFunding! Strategic Innovation Monitor
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                IgniteFunding indexes global database resources (OpenAlex publications, Lens IP records, and active government grant databases) to optimize your research and innovation workflows. Explore active matching opportunities or sync literature profiles below.
              </p>
            </div>
          </div>

          {/* Quick Action Launchers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {launchers.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="relative overflow-hidden bg-slate-900/20 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-amber-500/40 hover:bg-slate-900/45 hover:shadow-2xl hover:shadow-amber-500/10 hover:scale-[1.03] transition-all duration-300 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-all">
                        <Icon size={18} />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Service Portal</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-200 group-hover:text-amber-400 transition-colors leading-tight">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>

                  <Link
                    to={item.path}
                    className="w-full py-2.5 px-4 bg-slate-950/80 hover:bg-amber-600 border border-slate-800 hover:border-amber-500 text-slate-200 hover:text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg hover:shadow-amber-600/30 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <span>{item.action}</span>
                    <FaArrowRight size={10} className="transform group-hover/btn:translate-x-1 transition-transform duration-200 text-slate-400 group-hover/btn:text-white" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary KPI Cards Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-slate-400 tracking-widest uppercase flex items-center gap-2">
              <FaLightbulb size={12} className="text-amber-400" />
              <span>Platform Key Standing Indicators</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-semibold">Total aggregated database inventory</span>
          </div>
          <SummaryGrid summary={data?.summary} />
        </section>

        {/* Publications Analytics Charts */}
        <section className="space-y-4 pt-4 border-t border-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <FaBook size={16} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">1. Publications Portfolio Analytics</h2>
                <p className="text-xs text-slate-400">Scientific literature volume, research fields, and open-access ratios.</p>
              </div>
            </div>
            <Link to="/publications" className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-bold">
              <span>Sync Publications</span>
              <FaArrowRight size={10} />
            </Link>
          </div>
          <PublicationCharts data={data?.publications} />
        </section>

        {/* Patents Analytics Charts */}
        <section className="space-y-4 pt-6 border-t border-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <FaRegCopyright size={16} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">2. Intellectual Property & Patent Landscape</h2>
                <p className="text-xs text-slate-400">Filing timeline velocity, top assignee organizations, legal statuses, and country registrations.</p>
              </div>
            </div>
            <Link to="/innovation/dashboard" className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-bold">
              <span>View Innovation Matrix</span>
              <FaArrowRight size={10} />
            </Link>
          </div>
          <PatentCharts data={data?.patents} />
        </section>

        {/* Funding Analytics Charts */}
        <section className="space-y-4 pt-6 border-t border-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <FaCoins size={16} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">3. Capital Grants & Funding Pool Landscapes</h2>
                <p className="text-xs text-slate-400">Total valuation ($5.15B), top sponsoring agencies (NSF, Horizon Europe), and call deadlines.</p>
              </div>
            </div>
            <Link to="/funding" className="hidden sm:flex items-center gap-1.5 text-xs text-purple-400 hover:underline font-bold">
              <span>Explore Grant Calls</span>
              <FaArrowRight size={10} />
            </Link>
          </div>
          <FundingCharts data={data?.funding} />
        </section>

      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full mt-16 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
        <p>© 2026 IgniteFunding Platform. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          <a href="#docs" className="hover:text-slate-400 transition-colors">API References</a>
        </div>
      </footer>
    </div>
  );
}
