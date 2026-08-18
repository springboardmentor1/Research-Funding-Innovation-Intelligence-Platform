import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Search, DollarSign, Award, User, LogOut, Zap, BarChart3, Target, TrendingUp, Brain, PieChart, Sun, Moon, Cpu, Star, Rocket, Sparkles, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/research',  icon: Search,          label: 'Research Papers' },
  { to: '/funding',   icon: DollarSign,      label: 'Funding' },
  { to: '/patents',   icon: Award,           label: 'Patents' },
  { to: '/profile',   icon: User,            label: 'My Profile' },
];

const m2NavItems = [
  { to: '/research-dashboard',    icon: BarChart3,   label: 'Research Dashboard' },
  { to: '/grant-recommendations', icon: Target,      label: 'Grant Recommendations' },
  { to: '/publication-trends',    icon: TrendingUp,  label: 'Publication Trends' },
  { to: '/research-intelligence', icon: Brain,       label: 'Research Intelligence' },
  { to: '/funding-analytics',     icon: PieChart,    label: 'Funding Analytics' },
];

const m3NavItems = [
  { to: '/patent-analytics',        icon: BarChart3,  label: 'Patent Analytics' },
  { to: '/technology-intelligence',  icon: Cpu,        label: 'Technology Intelligence' },
  { to: '/innovation-scoring',       icon: Star,       label: 'Innovation Scoring' },
  { to: '/innovation-dashboard',     icon: Rocket,     label: 'Innovation Dashboard' },
];

const m4NavItems = [
  { to: '/executive-dashboard',  icon: Sparkles,   label: 'Executive Dashboard' },
  { to: '/reports',              icon: FileDown,   label: 'Reports & Export' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
          <div className="nav-section-label">Main Menu</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon className="nav-icon" size={18} />
              {label}
            </NavLink>
          ))}

          <div className="nav-section-label" style={{ marginTop: '0.75rem' }}>Intelligence</div>
          {m2NavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon className="nav-icon" size={18} />
              {label}
            </NavLink>
          ))}

          <div className="nav-section-label" style={{ marginTop: '0.75rem' }}>Innovation</div>
          {m3NavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon className="nav-icon" size={18} />
              {label}
            </NavLink>
          ))}

          <div className="nav-section-label" style={{ marginTop: '0.75rem' }}>Milestone 4</div>
          {m4NavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon className="nav-icon" size={18} />
              {label}
            </NavLink>
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
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
