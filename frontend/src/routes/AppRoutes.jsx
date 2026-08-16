import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard';
import FundingDiscovery from '../pages/shared/FundingDiscovery';
import PublicationSearch from '../pages/shared/PublicationSearch';
import NotFound from '../pages/shared/NotFound';
import DashboardLayout from '../components/layout/DashboardLayout';
import PatentsPage from '../pages/shared/PatentsPage';
import TechnologyPage from '../pages/shared/TechnologyPage';
import InnovationPage from '../pages/shared/InnovationPage';
import ReportsPage from '../pages/shared/ReportsPage';
import SettingsPage from '../pages/shared/SettingsPage';
import ProfilePage from '../pages/shared/ProfilePage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Default Path */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Unified Dashboard Layout wrapped routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/funding" element={<FundingDiscovery />} />
        <Route path="/research" element={<PublicationSearch />} />
        <Route path="/patents" element={<PatentsPage />} />
        <Route path="/technology" element={<TechnologyPage />} />
        <Route path="/innovation" element={<InnovationPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
