/* topbar-signout-v2 */
import { ex } from '../styles/executiveClasses';
import TopbarSignOutButton from '../../../components/TopbarSignOutButton';

export default function ExecutiveTopbar({ label, initials }) {

  return (
    <header className={`${ex.topbar.root} shrink-0`}>
      <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <span className={ex.topbar.brand}>E-Health Management system</span>
        <span className="text-sm font-medium text-teal-700">Executive · Read-only analytics</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-800 text-xs font-bold text-white shadow-md">
            {initials}
          </span>
          <span className="max-w-[160px] truncate text-sm font-semibold text-slate-700 sm:max-w-none">
            {label}
          </span>
        </div>
        <TopbarSignOutButton moduleLabel='Executive' className={ex.topbar.signOut} />
      </div>
    </header>
  );
}
