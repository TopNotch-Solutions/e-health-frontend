import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Show a one-time success toast from react-router location state.
 * Guards against React Strict Mode double-invoking effects for the same notice.
 */
export function useFlashNotice(showToast) {
  const location = useLocation();
  const navigate = useNavigate();
  const lastNoticeRef = useRef(null);

  useEffect(() => {
    const notice = location.state?.notice;
    if (!notice || lastNoticeRef.current === notice) return;
    lastNoticeRef.current = notice;
    showToast(notice, 'success');
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state?.notice, location.pathname, navigate, showToast]);
}
