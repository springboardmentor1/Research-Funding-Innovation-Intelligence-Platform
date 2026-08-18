export default function MiniBarChart({ data, labelKey, valueKey, color = "bg-signal-emerald" }) {
  if (!data || data.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-900/40">No data yet.</p>;
  }

  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="space-y-2.5">
      {data.map((row) => (
        <div key={row[labelKey]} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-xs text-ink-900/60" title={row[labelKey]}>
            {row[labelKey]}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-100">
            <div
              className={`h-full rounded-full ${color} transition-all`}
              style={{ width: `${Math.max((row[valueKey] / max) * 100, 4)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right font-mono text-xs text-ink-900/70">{row[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}
