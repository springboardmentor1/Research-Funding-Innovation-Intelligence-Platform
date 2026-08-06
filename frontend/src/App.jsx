import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OverviewPage from './pages/OverviewPage';
import ProfilePage from './pages/ProfilePage';
import FundingPage from './pages/FundingPage';
import ResearchPage from './pages/ResearchPage';
import PatentsPage from './pages/PatentsPage';
import TechnologyPage from './pages/TechnologyPage';
import InnovationPage from './pages/InnovationPage';
import AlertsPage from './pages/AlertsPage';
import StartupPage from './pages/StartupPage';
import ManagerPage from './pages/ManagerPage';
import AdminPage from './pages/AdminPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-shell"><p className="loading-dots">Loading…</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="funding" element={<FundingPage />} />
        <Route path="research" element={<ResearchPage />} />
        <Route path="patents" element={<PatentsPage />} />
        <Route path="technology" element={<TechnologyPage />} />
        <Route path="innovation" element={<InnovationPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route
          path="startup"
          element={
            <RoleRoute roles={['startup_founder']}>
              <StartupPage />
            </RoleRoute>
          }
        />
        <Route
          path="manager"
          element={
            <RoleRoute roles={['innovation_manager', 'administrator']}>
              <ManagerPage />
            </RoleRoute>
          }
        />
        <Route
          path="admin"
          element={
            <RoleRoute roles={['administrator']}>
              <AdminPage />
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
