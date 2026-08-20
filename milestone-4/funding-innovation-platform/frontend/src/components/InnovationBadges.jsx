const MATURITY_META = {
  emerging: { label: "Emerging", className: "bg-signal-amberSoft text-signal-amber" },
  growth: { label: "Growth", className: "bg-signal-emerald/10 text-signal-emeraldDark" },
  mature: { label: "Mature", className: "bg-ink-900/10 text-ink-900" },
  declining: { label: "Declining", className: "bg-signal-rose/10 text-signal-rose" },
};

const RECOMMENDATION_META = {
  productization: { label: "Productization", className: "bg-signal-emerald/10 text-signal-emeraldDark" },
  licensing: { label: "Licensing", className: "bg-ink-900/10 text-ink-900" },
  startup_creation: { label: "Startup Creation", className: "bg-signal-amberSoft text-signal-amber" },
  industry_partnership: { label: "Industry Partnership", className: "bg-surface-100 text-ink-900/70" },
};

export function MaturityBadge({ level }) {
  const meta = MATURITY_META[level] || { label: level, className: "bg-surface-100 text-ink-900/60" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

export function RecommendationTypeBadge({ type }) {
  const meta = RECOMMENDATION_META[type] || { label: type, className: "bg-surface-100 text-ink-900/60" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}
