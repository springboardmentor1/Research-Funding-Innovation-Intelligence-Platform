import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ResearcherDashboard from '../pages/researcher/ResearcherDashboard';
import ResearchProfile from '../pages/researcher/ResearchProfile';
import StartupDashboard from '../pages/startup/StartupDashboard';
import PatentAnalysis from '../pages/startup/PatentAnalysis';
import InnovationManagerDashboard from '../pages/innovation_manager/InnovationManagerDashboard';
import Reports from '../pages/innovation_manager/Reports';
import AdminDashboard from '../pages/admin/AdminDashboard';
import FundingDiscovery from '../pages/shared/FundingDiscovery';
import PublicationSearch from '../pages/shared/PublicationSearch';
import NotFound from '../pages/shared/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Default Path */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Researcher Routes */}
      <Route path="/researcher/dashboard" element={<ResearcherDashboard />} />
      <Route path="/researcher/profile" element={<ResearchProfile />} />

      {/* Startup Routes */}
      <Route path="/startup/dashboard" element={<StartupDashboard />} />
      <Route path="/startup/patents" element={<PatentAnalysis />} />

      {/* Innovation Manager Routes */}
      <Route path="/manager/dashboard" element={<InnovationManagerDashboard />} />
      <Route path="/manager/reports" element={<Reports />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Shared/Discovery Routes */}
      <Route path="/funding" element={<FundingDiscovery />} />
      <Route path="/publications" element={<PublicationSearch />} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
