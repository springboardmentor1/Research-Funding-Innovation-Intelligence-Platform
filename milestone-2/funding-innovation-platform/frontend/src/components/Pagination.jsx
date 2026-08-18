export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-900/60 transition hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            p === page ? "bg-signal-emerald text-white" : "text-ink-900/70 hover:bg-surface-100"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-900/60 transition hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
