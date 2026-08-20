import Navbar from "./Navbar";

/**
 * Shared shell for every authenticated page: renders the Navbar plus a
 * centered <main> content container. `maxWidth` controls the container's
 * width (pages currently range from max-w-2xl to max-w-6xl), and
 * `className` overrides the inner spacing/alignment classes for the rare
 * pages that render a centered status message (loading/error/empty)
 * instead of full page content.
 */
export default function Layout({ children, maxWidth = "max-w-6xl", className = "py-10" }) {
  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className={`mx-auto ${maxWidth} px-6 ${className}`}>{children}</main>
    </div>
  );
}
