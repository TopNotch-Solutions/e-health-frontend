/* topbar-signout-v2 */
import { topbar } from '../../nurse/styles/nurseClasses';
import TopbarSignOutButton from '../../../components/TopbarSignOutButton';
import AppBrand from '../../../components/brand/AppBrand';

export default function EmergencyUnitDoctorTopbar({ doctorLabel, initials, live, viewMode, onViewModeChange }) {

  return (
    <header className={`${topbar.root} shrink-0`}>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
          <AppBrand className={topbar.brand} />
          <span className="text-sm font-medium text-slate-500">Emergency Unit Doctor · Advanced assessment</span>
        </div>
        {onViewModeChange ? (
          <nav className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold" aria-label="Workspace mode">
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 ${viewMode === 'queue' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'}`}
              onClick={() => onViewModeChange('queue')}
            >
              Emergency queue
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 ${viewMode === 'records' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'}`}
              onClick={() => onViewModeChange('records')}
            >
              Patient records
            </button>
          </nav>
        ) : null}
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
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white"
            aria-hidden
          >
            {initials}
          </span>
          <span className="max-w-[160px] truncate text-sm font-semibold text-slate-700 sm:max-w-none">
            {doctorLabel}
          </span>
        </div>
        <TopbarSignOutButton moduleLabel='Emergency Unit Doctor' className={topbar.signOut} />
      </div>
    </header>
  );
}
