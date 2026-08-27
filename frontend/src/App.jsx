import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileForm from './pages/ProfileForm';
import ResearchDataList from './pages/ResearchDataList';
import ResearchIntelligence from './pages/ResearchIntelligence';
import ResearchHistory from './pages/ResearchHistory';
import PatentLandscape from './pages/PatentLandscape';
import StartupDashboard from './pages/StartupDashboard';
import InnovationManagerDashboard from './pages/InnovationManagerDashboard';
import api from './services/api';
import { Menu } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'profile', 'research', 'dashboard', 'patents'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoadingAuth(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      setActiveTab('dashboard'); // Default to dashboard tab upon login
    } catch (err) {
      console.error('Invalid token or session expired', err);
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setAuthView('login');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  if (loadingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B0E17',
        color: '#9CA3AF',
        fontSize: '1.1rem',
        fontWeight: 600
      }}>
        Initializing FundHive Intelligence Workspace...
      </div>
    );
  }

  if (!user) {
    if (authView === 'register') {
      return (
        <Register
          onLoginSuccess={handleLoginSuccess}
          onToggleLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onToggleRegister={() => setAuthView('register')}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row', background: '#0B0E17', position: 'relative' }}>
      
      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
          zIndex: 900,
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#818CF8',
          borderRadius: '8px',
          padding: '0.5rem',
          cursor: 'pointer',
          display: isSidebarOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s'
        }}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Overlay Background */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}

      {/* Sidebar Container */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1000
      }}>
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false); // Auto-close when a tab is selected
          }}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      <main style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        {activeTab === 'dashboard' && user.role === 'Startup Founder' && <StartupDashboard />}
        {activeTab === 'dashboard' && user.role === 'Innovation Manager' && <InnovationManagerDashboard />}
        {activeTab === 'dashboard' && user.role !== 'Startup Founder' && user.role !== 'Innovation Manager' && <ResearchIntelligence />}
        {activeTab === 'profile' && <ProfileForm user={user} />}
        {activeTab === 'history' && <ResearchHistory />}
        {activeTab === 'research' && <ResearchDataList />}
        {activeTab === 'patents' && <PatentLandscape />}
      </main>
    </div>
  );
}
