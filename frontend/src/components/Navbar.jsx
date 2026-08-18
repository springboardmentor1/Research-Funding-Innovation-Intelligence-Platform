import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { Sparkles, User as UserIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#e2ded4] shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#24527a] to-[#247291] shadow-md shadow-[#24527a]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#1a2530]">
              AI Innovation Platform
            </h1>
            <p className="text-[11px] text-[#576574] font-medium hidden sm:block">Research Funding & Commercialization Intelligence</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <NotificationDropdown />

            <div className="h-5 w-[1px] bg-[#e2ded4]" />

            <div className="flex items-center gap-3">
              <div 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2.5 cursor-pointer rounded-xl px-2.5 py-1.5 hover:bg-[#f7f4ed] border border-transparent hover:border-[#e2ded4] transition"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#24527a] text-white font-bold text-xs">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-[#1a2530] leading-tight">{user.full_name}</p>
                  <span className="text-[10px] text-[#247291] font-semibold">{user.role}</span>
                </div>
              </div>

              <button 
                onClick={handleLogout} 
                title="Log Out"
                className="p-2 text-[#576574] hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
