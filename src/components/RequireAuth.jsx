import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken, getStoredUser, clearSession } from '../api/authSession';
import { authRoleSlug, homePathForRole, isRoleAllowedForPath } from '../utils/homePathForRole';

/**
 * Requires a valid session. Optional `role` restricts the route to that role only.
 * Wrong role or missing token → login page (session cleared on role mismatch).
 */
export default function RequireAuth({ children, role, roles }) {
  const location = useLocation();
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const user = getStoredUser();
  const userRole = authRoleSlug(user).toLowerCase();

  const allowedRoles = roles?.length
    ? roles.map((r) => String(r).toLowerCase())
    : role
      ? [String(role).toLowerCase()]
      : null;

  if (allowedRoles) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      const home = homePathForRole(userRole);
      if (userRole && home && home !== location.pathname) {
        return <Navigate to={home} replace />;
      }
      clearSession();
      return (
        <Navigate
          to="/login?forbidden=1"
          replace
          state={{ attemptedRole: userRole, attemptedPath: location.pathname }}
        />
      );
    }
  } else if (!isRoleAllowedForPath(location.pathname, user)) {
    const home = homePathForRole(userRole);
    if (userRole && home && home !== location.pathname) {
      return <Navigate to={home} replace />;
    }
    clearSession();
    return (
      <Navigate
        to="/login?forbidden=1"
        replace
        state={{ attemptedRole: userRole, attemptedPath: location.pathname }}
      />
    );
  }

  return children;
}
