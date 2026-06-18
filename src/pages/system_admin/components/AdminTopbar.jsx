/* topbar-signout-v2 */
import { admin as c } from '../styles/adminClasses';
import TopbarSignOutButton from '../../../components/TopbarSignOutButton';
import AppBrand from '../../../components/brand/AppBrand';

export default function AdminTopbar({ adminLabel, initials }) {

  return (
    <header className={`${c.topbar.root} shrink-0`}>
      <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <AppBrand className={c.topbar.brand} />
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
        <TopbarSignOutButton moduleLabel='System Admin' className={c.topbar.signOut} />
      </div>
    </header>
  );
}
