import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50">
        <div className="flex items-center gap-3 text-ink-900/60">
          <span className="h-2.5 w-2.5 animate-ping rounded-full bg-signal-emerald" />
          <span className="text-sm font-medium">Loading your workspace…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
