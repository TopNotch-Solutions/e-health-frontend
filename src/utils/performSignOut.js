import { clearSession } from '../api/authSession';
import { disconnectSocket } from '../api/socket';
import { confirmSignOut } from './confirmAction';

/**
 * Confirmed sign-out for module topbars (no custom hook — ESLint-safe).
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {string} [moduleLabel]
 */
export async function performSignOut(navigate, moduleLabel = '') {
  if (!(await confirmSignOut(moduleLabel))) return;
  disconnectSocket();
  clearSession();
  navigate('/login', { replace: true });
}
