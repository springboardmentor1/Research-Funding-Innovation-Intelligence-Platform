import React from 'react';
import { FaUser, FaLock, FaBell, FaSlidersH, FaChevronRight } from 'react-icons/fa';

const settingsBlocks = [
  { title: 'Profile Settings', desc: 'Update your personal information and research profile', icon: FaUser, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { title: 'Security & Privacy', desc: 'Manage passwords, 2FA and data privacy settings', icon: FaLock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { title: 'Notification Preferences', desc: 'Control which alerts and emails you receive', icon: FaBell, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { title: 'System Preferences', desc: 'Customize dashboard layout and theme', icon: FaSlidersH, color: 'text-pink-400', bg: 'bg-pink-500/10' },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Settings</h2>
        <p className="text-slate-400 text-sm">Manage your account and preferences</p>
      </div>

      <div className="bg-[#1c2438] border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
        {settingsBlocks.map((block, idx) => (
          <div key={idx} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors cursor-pointer group">
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${block.bg} ${block.color}`}>
                <block.icon size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">{block.title}</h3>
                <p className="text-sm text-slate-400">{block.desc}</p>
              </div>
            </div>
            <FaChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}
