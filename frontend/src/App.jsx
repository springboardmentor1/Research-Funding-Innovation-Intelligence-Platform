import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResearchDiscoveryPage from './pages/ResearchDiscoveryPage';
import ResearchTrendsPage from './pages/ResearchTrendsPage';
import FundingDiscoveryPage from './pages/FundingDiscoveryPage';
import FundingRecommendationsPage from './pages/FundingRecommendationsPage';
import PatentIntelligencePage from './pages/PatentIntelligencePage';
import PatentClusteringPage from './pages/PatentClusteringPage';
import TechnologyIntelligencePage from './pages/TechnologyIntelligencePage';
import InnovationScorerPage from './pages/InnovationScorerPage';
import CommercializationPage from './pages/CommercializationPage';
import AIResearchAssistantPage from './pages/AIResearchAssistantPage';
import NotificationsPage from './pages/NotificationsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f0ece2] text-[#1a2530] flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-[1600px] w-full mx-auto relative items-start">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Dashboard Routes wrapped in AppLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/research"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ResearchDiscoveryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/trends"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ResearchTrendsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/funding"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FundingDiscoveryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/funding-recommendations"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FundingRecommendationsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patents"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PatentIntelligencePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patent-clustering"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PatentClusteringPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technology"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TechnologyIntelligencePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/innovation-scorer"
        element={
          <ProtectedRoute>
            <AppLayout>
              <InnovationScorerPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/commercialization"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CommercializationPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AIResearchAssistantPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NotificationsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Administrator']}>
            <AppLayout>
              <AdminPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Default Catch-all Fallback: Redirect to /login if unauthenticated, else /dashboard */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
