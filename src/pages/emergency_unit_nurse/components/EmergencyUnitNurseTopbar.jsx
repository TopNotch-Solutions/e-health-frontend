/* topbar-signout-v2 */
import { topbar } from '../../nurse/styles/nurseClasses';
import TopbarSignOutButton from '../../../components/TopbarSignOutButton';

export default function EmergencyUnitNurseTopbar({ nurseLabel, initials, live }) {

  return (
    <header className={`${topbar.root} shrink-0`}>
      <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <span className={topbar.brand}>E-Health Management system</span>
        <span className="text-sm font-medium text-slate-500">Emergency Unit · Vitals, screening &amp; routing</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <span className="hidden items-center gap-1.5 text-xs font-medium text-slate-500 sm:inline-flex">
          <span className={live ? 'h-2 w-2 rounded-full bg-emerald-500' : 'h-2 w-2 rounded-full bg-amber-400'} />
          {live ? 'Live' : 'Connecting…'}
        </span>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white" aria-hidden>
            {initials}
          </span>
          <span className="max-w-[140px] truncate text-sm font-semibold text-slate-700 sm:max-w-none">{nurseLabel}</span>
        </div>
        <TopbarSignOutButton moduleLabel='Emergency Unit' className={topbar.signOut} />
      </div>
    </header>
  );
}
