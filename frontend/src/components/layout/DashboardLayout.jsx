import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaSearch, FaBell } from 'react-icons/fa';

export default function DashboardLayout() {
  const location = useLocation();

  // Simple title mapping based on path
  const getPageTitle = (pathname) => {
    const path = pathname.split('/')[1] || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
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
            <div className="relative max-w-md w-full hidden md:block">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-[#1c2438] text-sm text-slate-200 rounded-full pl-10 pr-4 py-2 border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button className="text-slate-400 hover:text-white transition-colors relative">
              <FaBell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-slate-800 shadow-sm cursor-pointer"></div>
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
