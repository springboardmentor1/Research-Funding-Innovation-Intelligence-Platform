import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaBolt, FaSearch, FaMicroscope, 
  FaBrain, FaLightbulb, FaFileAlt,
  FaCog, FaSignOutAlt, FaUserCircle
} from 'react-icons/fa';

export default function Sidebar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FaHome },
    { name: 'Funding', path: '/funding', icon: FaBolt },
    { name: 'Research', path: '/research', icon: FaSearch },
    { name: 'Patents', path: '/patents', icon: FaMicroscope },
    { name: 'Technology', path: '/technology', icon: FaBrain },
    { name: 'Innovation', path: '/innovation', icon: FaLightbulb },
    { name: 'Reports', path: '/reports', icon: FaFileAlt },
    { name: 'Settings', path: '/settings', icon: FaCog },
  ];

  return (
    <aside className="w-64 bg-[#141b2d] h-screen border-r border-slate-800 flex flex-col fixed left-0 top-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <span className="text-xl font-bold text-white tracking-wide">ResearchAI</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors font-medium text-sm relative ${
                isActive
                  ? 'text-white bg-slate-800/50 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-blue-500 before:rounded-r-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`
            }
          >
            <item.icon size={16} />
            <span className="flex-1">{item.name}</span>
            {item.badge > 0 && (
              <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Profile Link */}
      <div className="px-4 pb-2 border-t border-slate-800 pt-3">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
              isActive ? 'text-white bg-slate-800/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`
          }
        >
          <FaUserCircle size={16} />
          My Profile
        </NavLink>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-colors font-medium text-sm"
        >
          <FaSignOutAlt size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
