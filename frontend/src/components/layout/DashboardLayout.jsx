import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaSearch } from 'react-icons/fa';
import profileService from '../../services/profileService';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userInitials, setUserInitials] = useState('');
  const [userRole, setUserRole] = useState('');

  // Check if user is authenticated
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Load user info for avatar
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) return;
      try {
        const user = await profileService.getCurrentUser();
        if (user?.full_name) {
          const initials = user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
          setUserInitials(initials);
          setUserRole(user.role || '');
        }
      } catch (e) { /* ignore */ }
    };
    loadUser();
  }, []);


  // Simple title mapping based on path
  const getPageTitle = (pathname) => {
    const segments = pathname.split('/').filter(Boolean);
    const path = segments[0] || 'dashboard';
    const map = {
      dashboard: 'Dashboard',
      funding: 'Funding',
      research: 'Research',
      patents: 'Patents',
      technology: 'Technology',
      innovation: 'Innovation',
      reports: 'Reports',
      notifications: 'Notifications',
      settings: 'Settings',
      profile: 'Profile',
    };
    return map[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="flex h-screen bg-[#0f1523] text-slate-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-[#0f1523]/80 backdrop-blur-sm z-10">
          <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">
            {getPageTitle(location.pathname)}
          </h1>
          <div className="flex-1 flex justify-end items-center gap-6">
            {/* Search */}
            <div className="relative max-w-md w-full hidden md:block">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-[#1c2438] text-sm text-slate-200 rounded-full pl-10 pr-4 py-2 border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>


            {/* Profile Avatar */}
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-slate-700 hover:border-blue-400 shadow-sm cursor-pointer flex items-center justify-center font-bold text-white text-xs transition-all hover:shadow-[0_0_12px_rgba(99,102,241,0.5)]"
              title={`Go to Profile ${userRole ? `(${userRole})` : ''}`}
            >
              {userInitials || '?'}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-[#0b101e] p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
