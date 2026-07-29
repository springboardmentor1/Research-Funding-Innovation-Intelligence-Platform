import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileForm from './pages/ProfileForm';
import ResearchDataList from './pages/ResearchDataList';
import ResearchIntelligence from './pages/ResearchIntelligence';
import api from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'profile' or 'research' or 'dashboard'

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0B0E17' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && <ResearchIntelligence />}
        {activeTab === 'profile' && <ProfileForm user={user} />}
        {activeTab === 'research' && <ResearchDataList />}
      </main>
    </div>
  );
}
