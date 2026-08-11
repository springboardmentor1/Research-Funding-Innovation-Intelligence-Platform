import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import { 
  FaBrain, 
  FaChartPie, 
  FaRocket, 
  FaBook, 
  FaCoins, 
  FaUserCircle, 
  FaSignOutAlt, 
  FaSignInAlt,
  FaUserPlus,
  FaSlidersH
} from 'react-icons/fa';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: FaChartPie },
    { label: 'Innovation Matrix', path: '/innovation/dashboard', icon: FaRocket },
    { label: 'Publications', path: '/publications', icon: FaBook },
    { label: 'Grant Calls', path: '/funding', icon: FaCoins },
    { label: 'Profile', path: '/researcher/profile', icon: FaSlidersH },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-blue-400 group-hover:text-white transition-colors">
              <FaBrain size={20} />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-extrabold tracking-tight text-white leading-tight flex items-center gap-2">
              Research Funding <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">AI Platform</span>
            </h1>
            <p className="text-xs text-slate-400">Innovation Intelligence Engine</p>
          </div>
        </NavLink>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-full p-1.5 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Profile / Auth Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-200">{user.full_name || user.email}</span>
                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full font-medium border border-blue-500/20">
                  {user.role || 'User'}
                </span>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <FaUserCircle size={18} />
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="flex items-center gap-2 bg-slate-900 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 hover:border-red-500/30 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              >
                <FaSignOutAlt size={13} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
              >
                <FaSignInAlt size={13} />
                <span>Sign In</span>
              </NavLink>
              <NavLink
                to="/register"
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
              >
                <FaUserPlus size={13} />
                <span>Register</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
