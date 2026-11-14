import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth";

/** Only signed-in users may see the dashboard (replaces the inline auth guard). */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Signed-in users are sent straight to the dashboard from Login/Register. */
export function PublicRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
