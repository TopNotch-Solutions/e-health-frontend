/* topbar-signout-v2 */
import { topbar } from '../../doctor/styles/doctorLayoutClasses';
import TopbarSignOutButton from '../../../components/TopbarSignOutButton';
import AppBrand from '../../../components/brand/AppBrand';

export default function RevenueTopbar({ officerLabel, facilityLabel, initials }) {
  return (
    <header className={`${topbar.root} shrink-0`}>
      <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <AppBrand className={topbar.brand} />
        <span className="text-sm font-medium text-slate-500">
          Revenue office{facilityLabel ? ` · ${facilityLabel}` : ''}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-xs font-bold text-white">
            {initials}
          </span>
          <span className="max-w-[160px] truncate text-sm font-semibold text-slate-700 sm:max-w-none">
            {officerLabel}
          </span>
        </div>
        <TopbarSignOutButton moduleLabel="Revenue office" className={topbar.signOut} />
      </div>
    </header>
  );
}
