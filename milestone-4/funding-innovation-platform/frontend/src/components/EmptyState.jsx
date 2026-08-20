import { Link } from "react-router-dom";

/**
 * Shared "no data" placeholder. Two variants, matching what already exists
 * across the app:
 *  - bare centered message (default) — pass `className` to match a
 *    specific spot's padding (py-4 / py-6 / py-10 all appear today)
 *  - message + CTA button inside a card — pass `action={{ to, label }}`
 *    (used by Bookmarks/Applications' "browse funding opportunities" prompts)
 */
export default function EmptyState({ message, className = "py-10 text-center text-sm text-ink-900/40", action }) {
  if (action) {
    return (
      <div className="card-panel text-center">
        <p className="text-sm text-ink-900/50">{message}</p>
        <Link to={action.to} className="btn-primary mt-4 inline-flex">
          {action.label}
        </Link>
      </div>
    );
  }

  return <p className={className}>{message}</p>;
}
