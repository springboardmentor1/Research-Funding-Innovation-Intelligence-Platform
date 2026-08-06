export default function Panel({ label, children, style }) {
  return (
    <div className="panel" style={style}>
      {label && <div className="panel-label">{label}</div>}
      {children}
    </div>
  );
}
