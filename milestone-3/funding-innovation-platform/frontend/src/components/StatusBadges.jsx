const OPPORTUNITY_STATUS_META = {
  draft: { label: "Draft", className: "bg-surface-100 text-ink-900/60" },
  published: { label: "Published", className: "bg-signal-emerald/10 text-signal-emeraldDark" },
  closed: { label: "Closed", className: "bg-signal-amberSoft text-signal-amber" },
  archived: { label: "Archived", className: "bg-ink-900/10 text-ink-900/50" },
};

const APPLICATION_STATUS_META = {
  draft: { label: "Draft", className: "bg-surface-100 text-ink-900/60" },
  submitted: { label: "Submitted", className: "bg-ink-900/10 text-ink-900" },
  under_review: { label: "Under Review", className: "bg-signal-amberSoft text-signal-amber" },
  accepted: { label: "Accepted", className: "bg-signal-emerald/10 text-signal-emeraldDark" },
  rejected: { label: "Rejected", className: "bg-signal-rose/10 text-signal-rose" },
  withdrawn: { label: "Withdrawn", className: "bg-surface-100 text-ink-900/40" },
};

export function OpportunityStatusBadge({ status }) {
  const meta = OPPORTUNITY_STATUS_META[status] || { label: status, className: "bg-surface-100 text-ink-900/60" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

export function ApplicationStatusBadge({ status }) {
  const meta = APPLICATION_STATUS_META[status] || { label: status, className: "bg-surface-100 text-ink-900/60" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}
