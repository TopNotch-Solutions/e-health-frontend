import { useNavigate } from 'react-router-dom';
import { clearSession } from '../../../api/authSession';
import { disconnectSocket } from '../../../api/socket';
import { ws } from '../styles/wardSupervisorClasses';

export default function WardSupervisorTopbar({ supervisorLabel, initials }) {
  const navigate = useNavigate();

  function handleSignOut() {
    disconnectSocket();
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <header className={`${ws.topbar.root} shrink-0`}>
      <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <span className={ws.topbar.brand}>E-Health Management system</span>
        <span className="text-sm font-medium text-teal-700">Ward supervisor · Bed management</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-700 text-xs font-bold text-white shadow-md">
            {initials}
          </span>
          <span className="max-w-[160px] truncate text-sm font-semibold text-slate-700 sm:max-w-none">
            {supervisorLabel}
          </span>
        </div>
        <button type="button" className={ws.topbar.signOut} onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
