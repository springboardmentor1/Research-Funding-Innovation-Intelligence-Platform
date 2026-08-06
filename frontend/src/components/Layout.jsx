import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BASE_NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/profile', label: 'Research Profile' },
  { to: '/funding', label: 'Funding Discovery' },
  { to: '/research', label: 'Research Trends' },
  { to: '/patents', label: 'Patent Landscape' },
  { to: '/technology', label: 'Technology Intelligence' },
  { to: '/innovation', label: 'Innovation Score' },
  { to: '/alerts', label: 'Alerts' },
];

const ROLE_NAV = {
  startup_founder: [{ to: '/startup', label: 'Startup Dashboard' }],
  innovation_manager: [{ to: '/manager', label: 'Portfolio Overview' }],
  administrator: [
    { to: '/manager', label: 'Portfolio Overview' },
    { to: '/admin', label: 'Admin' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navItems = [...BASE_NAV, ...(ROLE_NAV[user?.role] || [])];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Research & Innovation</div>
        <div className="brand-sub">Intelligence Platform</div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            <span className="tick" />
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          <div className="user-chip">
            {user?.full_name}
            <div className="role">{user?.role?.replace('_', ' ')}</div>
          </div>
          <button className="logout-btn" onClick={logout}>Sign out</button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
