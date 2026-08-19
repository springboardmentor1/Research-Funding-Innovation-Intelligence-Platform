import React from 'react';

export default function KpiCard({ title, value, icon: Icon, color = 'blue' }) {
  // Map color schemes for borders and gradients
  const colorMap = {
    blue: 'from-amber-500/20 to-indigo-500/5 text-amber-400 border-amber-500/30',
    emerald: 'from-emerald-500/20 to-orange-500/5 text-emerald-400 border-emerald-500/30',
    purple: 'from-purple-500/20 to-pink-500/5 text-purple-400 border-purple-500/30',
    amber: 'from-amber-500/20 to-orange-500/5 text-amber-400 border-amber-500/30',
    rose: 'from-rose-500/20 to-red-500/5 text-rose-400 border-rose-500/30',
    cyan: 'from-yellow-500/20 to-amber-500/5 text-yellow-400 border-cyan-500/30',
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="relative overflow-hidden bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/80 hover:shadow-2xl hover:shadow-slate-950/50 group">
      {/* Dynamic bottom accent bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${scheme.split(' ')[0]} to-transparent opacity-80`} />
      
      {/* Background glow */}
      <div className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br ${scheme.split(' ')[0]} to-transparent rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />

      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{title}</p>
          <p className={`text-2xl font-black tracking-tight bg-gradient-to-r ${scheme.split(' ')[0]} to-slate-200 bg-clip-text text-transparent`}>{value}</p>
        </div>

        {Icon && (
          <div className={`p-3 bg-slate-950/80 border border-slate-800 rounded-xl ${scheme.split(' ')[2]} shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
