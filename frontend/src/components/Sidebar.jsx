import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  FileCode2, 
  Cpu, 
  Award, 
  Briefcase, 
  Bot, 
  FileCheck, 
  User, 
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Research Discovery', path: '/research', icon: Search },
    { name: 'Research Trends', path: '/trends', icon: TrendingUp },
    { name: 'Funding Opportunities', path: '/funding', icon: DollarSign },
    { name: 'AI Recommended Grants', path: '/funding-recommendations', icon: Sparkles },
    { name: 'Patent Intelligence', path: '/patents', icon: FileCode2 },
    { name: 'Patent Clustering', path: '/patent-clustering', icon: FileCode2 },
    { name: 'Technology Intelligence', path: '/technology', icon: Cpu },
    { name: 'Innovation Scorer', path: '/innovation-scorer', icon: Award },
    { name: 'Commercialization', path: '/commercialization', icon: Briefcase },
    { name: 'AI Research Assistant', path: '/assistant', icon: Bot },
    { name: 'Reports & Exports', path: '/reports', icon: FileCheck },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  if (user?.role === 'Administrator') {
    navigation.push({ name: 'Admin Console', path: '/admin', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 shrink-0 hidden lg:block bg-white border-r border-[#e2ded4] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4 shadow-sm z-30">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#576574] mb-3">Core Platform</p>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#24527a] text-white shadow-md shadow-[#24527a]/20 font-bold'
                    : 'text-[#576574] hover:text-[#1a2530] hover:bg-[#f7f4ed]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
