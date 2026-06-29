import { useEffect } from 'react';
import {
  accessTokenExpiresInMs,
  ensureAccessTokenFresh,
  getAccessToken,
  handleSessionExpired,
  isAccessTokenExpired,
} from '../api/authSession';

/**
 * While the employee is signed in, refresh before expiry or redirect to login when the session ends.
 */
export default function SessionExpiryWatcher() {
  useEffect(() => {
    let cancelled = false;
    let timerId = null;

    async function onExpired() {
      const stillValid = await ensureAccessTokenFresh();
      if (cancelled) return;
      if (!stillValid) {
        handleSessionExpired();
        return;
      }
      schedule();
    }

    function schedule() {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      const token = getAccessToken();
      if (!token) return;

      if (isAccessTokenExpired(token)) {
        onExpired();
        return;
      }

      const ms = accessTokenExpiresInMs(token);
      if (ms == null) return;

      timerId = setTimeout(onExpired, Math.max(ms, 0) + 250);
    }

    schedule();

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        schedule();
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
}
