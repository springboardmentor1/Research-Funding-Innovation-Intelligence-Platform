import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import SummaryGrid from '../components/dashboard/SummaryGrid';
import PublicationCharts from '../components/dashboard/PublicationCharts';
import PatentCharts from '../components/dashboard/PatentCharts';
import FundingCharts from '../components/dashboard/FundingCharts';
import { FaSyncAlt, FaExclamationTriangle, FaChartPie, FaBook, FaRegCopyright, FaCoins } from 'react-icons/fa';

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
      
      // Check for auth status (401 unauthenticated)
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
        {/* Loading Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin animate-reverse"></div>
        </div>
        <p className="mt-6 text-sm font-semibold text-slate-400 animate-pulse uppercase tracking-widest">
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <div className="max-w-7xl mx-auto w-full space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                <FaChartPie size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Innovation & Funding Intelligence
              </h1>
            </div>
            <p className="text-sm text-slate-400 font-medium max-w-xl">
              Consolidated real-time analytics mapping global academic literature, patent applications, and capital grants.
            </p>
          </div>

          <div className="flex items-center sm:self-start gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Sync Status</p>
              <p className="text-xs font-bold text-slate-300">
                Updated: {data?.summary?.last_analytics_update || 'N/A'}
              </p>
            </div>
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-50 text-slate-300 hover:text-white rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold transition-all"
            >
              <FaSyncAlt size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </header>

        {/* Display Error Toast if background refresh fails */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-center gap-3">
            <FaExclamationTriangle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Summary KPI Cards Grid */}
        <section className="space-y-4">
          <h2 className="text-xs font-extrabold text-slate-400 tracking-widest uppercase">Summary Standing</h2>
          <SummaryGrid summary={data?.summary} />
        </section>

        {/* Publications Analytics Charts */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <FaBook size={16} />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Publications Portfolio Analytics</h2>
          </div>
          <PublicationCharts data={data?.publications} />
        </section>

        {/* Patents Analytics Charts */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <FaRegCopyright size={16} />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Intellectual Property & Patents</h2>
          </div>
          <PatentCharts data={data?.patents} />
        </section>

        {/* Funding Analytics Charts */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <FaCoins size={16} />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Capital Grants & Funding Landscapes</h2>
          </div>
          <FundingCharts data={data?.funding} />
        </section>
      </div>

      {/* Footer Section */}
      <footer className="max-w-7xl mx-auto w-full mt-16 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
        <p>© 2026 Research Funding & Innovation Intelligence Platform. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          <a href="#docs" className="hover:text-slate-400 transition-colors">API References</a>
        </div>
      </footer>
    </div>
  );
}
