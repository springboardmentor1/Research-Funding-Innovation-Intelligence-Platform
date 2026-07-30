import React from 'react';
import { FaBolt, FaMicroscope, FaChartLine, FaBell, FaTimes } from 'react-icons/fa';

const notifications = [
  { title: 'New Funding Opportunity', desc: '$500K NSF Grant for Quantum Computing', time: '2 hours ago', icon: FaBolt, color: 'text-blue-400', bg: 'bg-blue-500' },
  { title: 'Patent Alert', desc: 'New competitor patent in AI/ML detected', time: '5 hours ago', icon: FaMicroscope, color: 'text-cyan-400', bg: 'bg-cyan-500' },
  { title: 'Research Trend Alert', desc: 'Emerging trend in Gene Therapy detected', time: '1 day ago', icon: FaChartLine, color: 'text-purple-400', bg: 'bg-purple-500' },
  { title: 'Funding Deadline', desc: 'NSF Grant application deadline in 3 days', time: '2 days ago', icon: FaBell, color: 'text-pink-400', bg: 'bg-pink-500' },
  { title: 'Matching Opportunity', desc: 'Excellent match for your research profile', time: '3 days ago', icon: FaBolt, color: 'text-blue-400', bg: 'bg-blue-500' },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Notifications</h2>
          <p className="text-slate-400 text-sm">Stay updated with funding and research alerts</p>
        </div>
        <button className="text-sm text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-full px-4 py-2 transition-colors">
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notif, idx) => (
          <div key={idx} className="bg-[#1c2438] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 mt-1 rounded-full ${notif.bg} flex items-center justify-center text-white shadow-lg`}>
                <notif.icon size={16} />
              </div>
              <div>
                <h3 className="text-white font-bold">{notif.title}</h3>
                <p className="text-sm text-slate-400 mb-1">{notif.desc}</p>
                <p className="text-xs text-slate-500">{notif.time}</p>
              </div>
            </div>
            <button className="text-slate-500 hover:text-slate-300 transition-colors p-2">
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
