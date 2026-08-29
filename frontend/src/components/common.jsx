// Small shared components used across pages.

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps any page that requires a logged-in user. If there is no user, it
// redirects to /login instead of rendering the page. Optionally restricts to
// specific roles - that is RBAC enforced in the UI (the backend enforces it
// too; the UI check is for UX, not security).
export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="card">
        <h2>Access denied</h2>
        <p>This page requires one of: {roles.join(", ")}.</p>
        <p>Your role is <strong>{user.role}</strong>.</p>
      </div>
    );
  }
  return children;
}

export function Spinner({ label = "Loading..." }) {
  return (
    <div className="spinner">
      <div className="spinner-dot" />
      <span>{label}</span>
    </div>
  );
}

// A consistent way to show an error from a failed API call.
export function ErrorBox({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="error-box">
      <strong>Something went wrong.</strong>
      <div>{error.message || String(error)}</div>
      {onRetry && (
        <button className="btn btn-sm" onClick={onRetry}>Retry</button>
      )}
    </div>
  );
}

// Simple stat card for dashboard headline numbers.
export function StatCard({ label, value, sub, small }) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={small ? { fontSize: 16, lineHeight: 1.3 } : undefined}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
