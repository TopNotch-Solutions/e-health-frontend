/* topbar-signout-v2 */
import { ws } from '../styles/wardSupervisorClasses';
import TopbarSignOutButton from '../../../components/TopbarSignOutButton';
import AppBrand from '../../../components/brand/AppBrand';

export default function WardSupervisorTopbar({ supervisorLabel, initials }) {

  return (
    <header className={`${ws.topbar.root} shrink-0`}>
      <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <AppBrand className={ws.topbar.brand} />
        <span className="text-sm font-medium text-teal-700">Ward supervisor · Live dashboard</span>
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
        <TopbarSignOutButton moduleLabel='Ward Supervisor' className={ws.topbar.signOut} />
      </div>
    </header>
  );
}
