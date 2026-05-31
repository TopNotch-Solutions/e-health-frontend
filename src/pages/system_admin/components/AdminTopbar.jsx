import { useNavigate } from 'react-router-dom';
import { clearSession } from '../../../api/authSession';
import { disconnectSocket } from '../../../api/socket';
import { admin as c } from '../styles/adminClasses';

export default function AdminTopbar({ adminLabel, initials }) {
  const navigate = useNavigate();

  function handleSignOut() {
    disconnectSocket();
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <header className={`${c.topbar.root} shrink-0`}>
      <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <span className={c.topbar.brand}>E-Health Management system</span>
        <span className="text-sm font-medium text-teal-700">
          National administrator · all hospitals &amp; clinics
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-800 text-xs font-bold text-white shadow-md">
            {initials}
          </span>
          <span className="max-w-[160px] truncate text-sm font-semibold text-slate-700 sm:max-w-none">
            {adminLabel}
          </span>
        </div>
        <button type="button" className={c.topbar.signOut} onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
