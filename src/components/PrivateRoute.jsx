import { Navigate, useLocation } from "react-router-dom";
import { getUser } from "../utils/session";

/**
 * Usage:
 *  <PrivateRoute role="user"><UserProfile /></PrivateRoute>
 *  <PrivateRoute role="admin"><AdminProfile /></PrivateRoute>
 *  <PrivateRoute><AnyLoggedInPage /></PrivateRoute>
 */
export default function PrivateRoute({ role, children }) {
  const user = getUser();
  const location = useLocation();

  // not logged in -> send to login, keep where they were going
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // role mismatch -> send them to a sensible home
  if (role && user.role !== role) {
    // if they’re admin but hit a user page, go to admin home
    if (user.role === "admin") return <Navigate to="/admin/profile" replace />;
    // if they’re user but hit an admin page, go to user home
    return <Navigate to="/user/profile" replace />;
  }

  return children;
}
