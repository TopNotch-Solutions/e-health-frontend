import { useNavigate } from 'react-router-dom';
import { clearSession } from '../../../api/authSession';
import { disconnectSocket } from '../../../api/socket';
import { wst } from '../styles/wardStaffClasses';

export default function WardStaffTopbar({ staffLabel, initials, live }) {
  const navigate = useNavigate();

  function handleSignOut() {
    disconnectSocket();
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <header className={`${wst.topbar.root} shrink-0`}>
      <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <span className={wst.topbar.brand}>E-Health Management system</span>
        <span className="text-sm font-medium text-teal-700">Ward staff · Arrivals</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <span
          className="hidden items-center gap-1.5 text-xs font-medium text-slate-500 sm:inline-flex"
          title={live ? 'Queue updates in real time' : 'Connecting to live queue…'}
        >
          <span className={live ? 'h-2 w-2 rounded-full bg-emerald-500' : 'h-2 w-2 rounded-full bg-amber-400'} />
          {live ? 'Live' : 'Connecting…'}
        </span>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-700 text-xs font-bold text-white shadow-md">
            {initials}
          </span>
          <span className="max-w-[160px] truncate text-sm font-semibold text-slate-700 sm:max-w-none">
            {staffLabel}
          </span>
        </div>
        <button type="button" className={wst.topbar.signOut} onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
