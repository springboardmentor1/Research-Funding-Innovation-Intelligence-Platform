import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

// Optionally pass `roles` prop to restrict by role:
// <Route element={<ProtectedRoute roles={["ADMINISTRATOR"]} />}>
export default function ProtectedRoute({ roles }) {
  const { user, hasRole } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !hasRole(...roles)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}