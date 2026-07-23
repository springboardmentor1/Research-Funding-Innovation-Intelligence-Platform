import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Search, DollarSign, Award, User, LogOut, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/research',  icon: Search,          label: 'Research Papers' },
  { to: '/funding',   icon: DollarSign,      label: 'Funding' },
  { to: '/patents',   icon: Award,           label: 'Patents' },
  { to: '/profile',   icon: User,            label: 'My Profile' },
];

export default function AppLayout() {
  const navigate = useNavigate();
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
          <div className="logo-icon">
            <Zap size={22} color="white" />
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
