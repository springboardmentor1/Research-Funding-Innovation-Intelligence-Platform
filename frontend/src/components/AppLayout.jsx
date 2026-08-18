import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Search, DollarSign, Award, User, LogOut, Zap, BarChart3, Target, TrendingUp, Brain, PieChart, Sun, Moon, Cpu, Star, Rocket, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import NotificationPanel from './NotificationPanel';

const getNavItemsForRole = (role) => {
  const defaultProfile = { to: '/profile', icon: User, label: 'My Profile' };

  switch (role) {
    case 'RESEARCHER':
      return [
        { section: 'Main Menu', items: [
          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/research',  icon: Search,          label: 'Research Papers' },
          { to: '/funding',   icon: DollarSign,      label: 'Funding' },
          defaultProfile
        ]}
      ];
    case 'STARTUP_FOUNDER':
      return [
        { section: 'Main Menu', items: [
          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/funding',   icon: DollarSign,      label: 'Funding' },
          { to: '/patents',   icon: Award,           label: 'Patents' },
          defaultProfile
        ]},
        { section: 'Innovation', items: [
          { to: '/technology-intelligence', icon: Cpu, label: 'Tech Intelligence' }
        ]}
      ];
    case 'INNOVATION_MANAGER':
      return [
        { section: 'Main Menu', items: [
          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          defaultProfile
        ]},
        { section: 'Intelligence & Innovation', items: [
          { to: '/patent-analytics',        icon: BarChart3,  label: 'Patent Analytics' },
          { to: '/technology-intelligence', icon: Cpu,        label: 'Tech Intelligence' },
          { to: '/innovation-scoring',      icon: Star,       label: 'Innovation Scoring' },
          { to: '/reports',                 icon: FileText,   label: 'Reports' },
        ]}
      ];
    case 'ADMIN':
      return [
        { section: 'Main Menu', items: [
          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/reports',   icon: FileText,        label: 'Reports' },
          defaultProfile
        ]}
      ];
    default:
      return [
        { section: 'Main Menu', items: [
          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          defaultProfile
        ]}
      ];
  }
};

export default function AppLayout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navSections = getNavItemsForRole(user.role || 'RESEARCHER');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-row">
            <div className="logo-icon">
              <Zap size={22} color="white" />
            </div>
            <button
              className="theme-toggle-btn theme-toggle-sidebar"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              id="theme-toggle-sidebar"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <h2>AI Research</h2>
          <p>Funding Platform</p>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section, idx) => (
            <div key={section.section}>
              <div className="nav-section-label" style={{ marginTop: idx > 0 ? '0.75rem' : '0' }}>
                {section.section}
              </div>
              {section.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <Icon className="nav-icon" size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">
              {(user.username || 'U')[0].toUpperCase()}
            </div>
            <div className="user-chip-info">
              <div className="user-chip-name">{user.username || 'Researcher'}</div>
              <div className="user-chip-email">{user.email || ''}</div>
            </div>
            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
              id="logout-btn"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <NotificationPanel />
        </div>
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
