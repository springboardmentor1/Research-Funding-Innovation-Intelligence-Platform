import React from 'react';

export default function KpiCard({ title, value, icon: Icon, color = 'blue' }) {
  // Map color schemes for borders and gradients
  const colorMap = {
    blue: 'from-blue-500/20 to-indigo-500/5 text-blue-400 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-teal-500/5 text-emerald-400 border-emerald-500/30',
    purple: 'from-purple-500/20 to-pink-500/5 text-purple-400 border-purple-500/30',
    amber: 'from-amber-500/20 to-orange-500/5 text-amber-400 border-amber-500/30',
    rose: 'from-rose-500/20 to-red-500/5 text-rose-400 border-rose-500/30',
    cyan: 'from-cyan-500/20 to-blue-500/5 text-cyan-400 border-cyan-500/30',
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/50 group">
      {/* Background glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${scheme} rounded-full blur-2xl opacity-40 group-hover:opacity-65 transition-opacity duration-300`} />

      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">{title}</p>
          <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
        </div>

        {Icon && (
          <div className={`p-4 bg-slate-800/80 border border-slate-700/50 rounded-xl ${scheme.split(' ')[2]} shadow-inner transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
