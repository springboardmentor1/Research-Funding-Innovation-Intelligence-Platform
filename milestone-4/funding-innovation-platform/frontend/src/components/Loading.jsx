/**
 * Shared loading placeholder. `className` defaults to the most common
 * usage across the app (a centered, muted status line with generous
 * vertical padding); pass a different `className` to match a specific
 * spot's spacing (e.g. inline chart placeholders with no padding/centering).
 */
export default function Loading({ message = "Loading…", className = "py-10 text-center text-sm text-ink-900/40" }) {
  return <p className={className}>{message}</p>;
}
