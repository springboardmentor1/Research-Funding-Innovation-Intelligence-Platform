import React from 'react';

const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-[#24527a]/10 border-[#24527a]/30 text-[#24527a]',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-[#e2ded4] relative overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#576574]">{title}</p>
          <h3 className="text-2xl font-extrabold text-[#1a2530] mt-1">{value}</h3>
          {change && (
            <p className="text-[11px] font-bold text-emerald-700 mt-1.5 flex items-center gap-1">
              <span>↑</span> {change}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl border ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
