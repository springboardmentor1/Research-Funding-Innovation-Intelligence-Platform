const ROLE_META = {
  researcher: { label: "Researcher", className: "bg-signal-emerald/10 text-signal-emeraldDark" },
  startup_founder: { label: "Startup Founder", className: "bg-signal-amberSoft text-signal-amber" },
  innovation_manager: { label: "Innovation Manager", className: "bg-ink-900/10 text-ink-900" },
  administrator: { label: "Administrator", className: "bg-signal-rose/10 text-signal-rose" },
};

export default function RoleBadge({ role }) {
  const meta = ROLE_META[role] || { label: role, className: "bg-surface-100 text-ink-900/70" };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}
