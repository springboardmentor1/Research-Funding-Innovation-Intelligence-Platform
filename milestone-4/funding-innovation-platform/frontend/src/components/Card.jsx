/**
 * Thin wrapper around the existing `.card-panel` utility class (defined in
 * index.css). Renders as a <div> by default; pass `as="form"` for the two
 * call sites that need the panel styling on a <form> element. Extra
 * `className` is appended after `card-panel`, matching how call sites
 * already combine classes today (e.g. "card-panel flex items-center …").
 */
export default function Card({ children, className = "", as: Component = "div", ...rest }) {
  const combinedClassName = ["card-panel", className].filter(Boolean).join(" ");
  return (
    <Component className={combinedClassName} {...rest}>
      {children}
    </Component>
  );
}
