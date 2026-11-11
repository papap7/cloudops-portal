import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";
import { isTokenExpired } from "../lib/tokenExpiry";

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  // A token can run out while the tab stays open. Checking here as well
  // as on page load means a protected page never renders with a token
  // the API would refuse.
  const expired = token !== null && isTokenExpired(token);

  // Clearing the session is a side effect, so it runs after render.
  useEffect(() => {
    if (expired) logout();
  }, [expired, logout]);

  if (token === null || expired) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
