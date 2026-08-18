import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import RoleRoute from './components/RoleRoute';
import DashboardRouter from './components/DashboardRouter';
import Login from './pages/Login';
import Register from './pages/Register';
import ResearchSearch from './pages/ResearchSearch';
import FundingSearch from './pages/FundingSearch';
import PatentSearch from './pages/PatentSearch';
import Profile from './pages/Profile';
import ResearchDashboard from './pages/ResearchDashboard';
import FundingRecommendation from './pages/FundingRecommendation';
import PublicationTrends from './pages/PublicationTrends';
import ResearchIntelligence from './pages/ResearchIntelligence';
import FundingAnalytics from './pages/FundingAnalytics';
import PatentAnalytics from './pages/PatentAnalytics';
import TechnologyIntelligence from './pages/TechnologyIntelligence';
import InnovationScoring from './pages/InnovationScoring';
import InnovationDashboard from './pages/InnovationDashboard';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import Reports from './pages/Reports';
import AppLayout from './components/AppLayout';
import './index.css';

// Auth guard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder-client-id';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a2236',
            color: '#f1f5f9',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/" element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardRouter />} />
          <Route path="research"  element={<ResearchSearch />} />
          <Route path="funding"   element={<FundingSearch />} />
          <Route path="patents"   element={<PatentSearch />} />
          <Route path="profile"   element={<Profile />} />

          {/* Milestone 2 */}
          <Route path="research-dashboard"    element={<ResearchDashboard />} />
          <Route path="grant-recommendations" element={<FundingRecommendation />} />
          <Route path="publication-trends"    element={<PublicationTrends />} />
          <Route path="research-intelligence" element={<ResearchIntelligence />} />
          <Route path="funding-analytics"     element={<FundingAnalytics />} />

          {/* Milestone 3 */}
          <Route path="patent-analytics"        element={<PatentAnalytics />} />
          <Route path="technology-intelligence" element={<TechnologyIntelligence />} />
          <Route path="innovation-scoring"      element={<InnovationScoring />} />
          <Route path="innovation-dashboard"    element={<InnovationDashboard />} />

          {/* Milestone 4 / Protected */}
          <Route path="executive-dashboard" element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <ExecutiveDashboard />
            </RoleRoute>
          } />
          <Route path="reports" element={
            <RoleRoute allowedRoles={['INNOVATION_MANAGER', 'ADMIN']}>
              <Reports />
            </RoleRoute>
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
