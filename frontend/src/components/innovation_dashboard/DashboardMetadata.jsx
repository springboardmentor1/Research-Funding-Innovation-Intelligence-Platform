import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiClock, FiCpu, FiTag } from 'react-icons/fi';

export default function DashboardMetadata({ metadata }) {
  if (!metadata) return null;

  const status = metadata.analytics_status || 'Healthy';

  const getStatusBadge = (statusStr) => {
    switch (statusStr.toLowerCase()) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <FiCheckCircle className="w-3.5 h-3.5" />
            Healthy
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <FiAlertCircle className="w-3.5 h-3.5" />
            Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            <FiAlertCircle className="w-3.5 h-3.5" />
            Unavailable
          </span>
        );
    }
  };

  const formattedTime = metadata.generated_at
    ? new Date(metadata.generated_at).toLocaleString()
    : 'Just now';

  return (
    <div className="mb-8 p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4" data-testid="DashboardMetadata">
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <FiTag className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">Version:</span>
          <span className="font-semibold text-slate-200">v{metadata.dashboard_version || '1.0'}</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <span className="text-slate-400">Analytics Status:</span>
          {getStatusBadge(status)}
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <FiCpu className="w-4 h-4 text-purple-400" />
          <span className="text-slate-400">Modules Loaded:</span>
          <span className="font-semibold text-slate-200">{metadata.modules_loaded ?? 4} / 4</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <FiClock className="w-4 h-4 text-yellow-400" />
        <span>Last Generated:</span>
        <span className="font-mono text-slate-300">{formattedTime}</span>
      </div>
    </div>
  );
}
