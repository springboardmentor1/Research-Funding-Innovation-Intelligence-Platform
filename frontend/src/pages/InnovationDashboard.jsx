import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import innovationDashboardService from '../services/innovationDashboardService';
import ExecutiveSummary from '../components/innovation_dashboard/ExecutiveSummary';
import DashboardMetadata from '../components/innovation_dashboard/DashboardMetadata';
import PatentLandscapeSection from '../components/innovation_dashboard/PatentLandscapeSection';
import TechnologyIntelligenceSection from '../components/innovation_dashboard/TechnologyIntelligenceSection';
import InnovationScoringSection from '../components/innovation_dashboard/InnovationScoringSection';
import CommercializationSection from '../components/innovation_dashboard/CommercializationSection';
import { FiRefreshCw, FiAlertTriangle, FiUser, FiHome, FiLogOut } from 'react-icons/fi';

export default function InnovationDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userString = localStorage.getItem('user');
  let userRole = 'Administrator';
  try {
    if (userString) {
      const parsed = JSON.parse(userString);
      if (parsed && parsed.role) userRole = parsed.role;
    }
  } catch (e) {
    // Default fallback
  }

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await innovationDashboardService.getInnovationDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load innovation dashboard:', err);
      setError(err.response?.data?.detail || 'Unable to connect to Innovation Dashboard service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Determine section visibility based on backend payload keys & user role
  const showPatent = data?.patent_landscape !== undefined;
  const showTech = data?.technology_intelligence !== undefined;
  const showInnov = data?.innovation_scores !== undefined;
  const showComm = data?.commercialization !== undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 selection:bg-amber-500 selection:text-white" data-testid="InnovationDashboard">
      {/* Top Header Navigation */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Innovation Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Executive Decision Support & Technology Intelligence Platform
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <FiUser className="w-3.5 h-3.5" />
            {userRole}
          </span>
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Return to Main Dashboard"
          >
            <FiHome className="w-4 h-4" />
          </button>
          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Refresh Analytics"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition"
            title="Sign Out"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20" data-testid="LoadingSpinner">
            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-medium text-slate-400">Loading Innovation Dashboard Analytics...</p>
          </div>
        )}

        {/* Error Banner */}
        {!loading && error && (
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4" data-testid="ErrorMessage">
            <div className="flex items-center gap-3">
              <FiAlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-red-200">Dashboard Loading Error</h3>
                <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg border border-red-500/40 transition shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dashboard Sections in Exact Requested Order */}
        {!loading && !error && data && (
          <>
            {/* 1. Executive Summary */}
            <ExecutiveSummary summary={data.summary} />

            {/* 2. Dashboard Metadata */}
            <DashboardMetadata metadata={data.metadata} />

            {/* 3. Patent Landscape Section */}
            {showPatent && <PatentLandscapeSection patentData={data.patent_landscape} />}

            {/* 4. Technology Intelligence Section */}
            {showTech && <TechnologyIntelligenceSection techData={data.technology_intelligence} />}

            {/* 5. Innovation Scoring Section */}
            {showInnov && <InnovationScoringSection innovData={data.innovation_scores} />}

            {/* 6. Commercialization Section */}
            {showComm && <CommercializationSection commData={data.commercialization} />}
          </>
        )}
      </div>
    </div>
  );
}
