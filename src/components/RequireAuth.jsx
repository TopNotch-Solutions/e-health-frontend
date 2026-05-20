import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken, getStoredUser, clearSession } from '../api/authSession';
import { authRoleSlug, isRoleAllowedForPath } from '../utils/homePathForRole';

/**
 * Requires a valid session. Optional `role` restricts the route to that role only.
 * Wrong role or missing token → login page (session cleared on role mismatch).
 */
export default function RequireAuth({ children, role }) {
  const location = useLocation();
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const user = getStoredUser();
  const userRole = authRoleSlug(user).toLowerCase();

  if (role) {
    const expected = String(role).toLowerCase();
    if (!userRole || userRole !== expected) {
      clearSession();
      return <Navigate to="/login?forbidden=1" replace />;
    }
  } else if (!isRoleAllowedForPath(location.pathname, user)) {
    clearSession();
    return <Navigate to="/login?forbidden=1" replace />;
  }

  return children;
}
