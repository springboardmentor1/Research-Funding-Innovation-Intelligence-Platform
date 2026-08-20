export default function Modal({ open, onClose, title, children, maxWidth = "max-w-2xl" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/50 px-4 py-10">
      <div className={`w-full ${maxWidth} rounded-xl2 bg-white shadow-panel`}>
        <div className="flex items-center justify-between border-b border-ink-900/8 px-6 py-4">
          <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-900/40 transition hover:bg-surface-100 hover:text-ink-900"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
