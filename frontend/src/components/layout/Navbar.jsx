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
  FaSlidersH,
  FaBars,
  FaTimes
} from 'react-icons/fa';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const navItems = [
    { label: 'Intelligence Hub', path: '/dashboard', icon: FaChartPie },
    { label: 'Patent Landscape', path: '/innovation/dashboard', icon: FaRocket },
    { label: 'Publications Catalog', path: '/publications', icon: FaBook },
    { label: 'Grant Opportunities', path: '/funding', icon: FaCoins },
    { label: 'Scholar Profile', path: '/researcher/profile', icon: FaSlidersH },
  ];

  return (
    <>
      {/* Mobile Top Navbar */}
      <nav className="md:hidden w-full bg-slate-950/90 backdrop-blur-xl border-b border-slate-900/80 px-4 py-3 flex items-center justify-between z-50 sticky top-0">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 via-emerald-400 to-indigo-500 p-0.5 shadow-md shadow-orange-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center text-orange-400">
              <FaBrain size={14} />
            </div>
          </div>
          <span className="text-sm font-black text-white uppercase tracking-wider">IgniteFunding</span>
        </NavLink>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-white p-1"
        >
          {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </nav>

      {/* Sidebar Navigation Panel (Responsive) */}
      <aside className={`fixed md:sticky top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-900/80 p-5 flex flex-col justify-between transition-transform duration-300 md:transform-none h-screen ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="space-y-8">
          
          {/* Logo / Brand Header */}
          <NavLink to="/dashboard" className="flex items-center gap-3 group mt-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-emerald-400 to-indigo-600 p-0.5 shadow-lg shadow-orange-500/10 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-orange-400 group-hover:text-white transition-colors">
                <FaBrain size={20} />
              </div>
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider text-white leading-tight uppercase">
                IgniteFunding
              </h1>
              <p className="text-[10px] text-orange-500 font-semibold tracking-widest uppercase">Intel Platform</p>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-300 transform ${
                      isActive
                        ? 'bg-amber-600/15 text-amber-400 border-l-4 border-amber-500 shadow-lg shadow-amber-600/5 pl-5'
                        : 'text-slate-400 hover:text-amber-400 hover:bg-amber-600/5 hover:translate-x-1.5'
                    }`
                  }
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with User Profile / Login */}
        <div className="border-t border-slate-900/80 pt-4 space-y-4">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-400 shadow-inner">
                  <FaUserCircle size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-200 truncate">{user.full_name || user.email}</span>
                  <span className="text-[9px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider self-start mt-0.5">
                    {user.role || 'User'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-slate-900/60 hover:bg-red-500/10 hover:text-red-400 border border-slate-900 hover:border-red-500/20 text-slate-400 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <FaSignOutAlt size={12} />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <NavLink
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <FaSignInAlt size={12} />
                <span>Sign In</span>
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-orange-600/10 transition-all"
              >
                <FaUserPlus size={12} />
                <span>Register</span>
              </NavLink>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
