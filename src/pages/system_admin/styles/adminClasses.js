import { nurse as base, topbar } from '../../nurse/styles/nurseClasses';
import { searchCard } from '../../front_office/styles/frontOfficeClasses';

/** System admin — same shell as clinical/supervisor modules (teal primary, slate neutrals). */
export const admin = {
  ...base,
  topbar,
  body: 'mx-auto flex w-full min-h-0 max-w-[1600px] flex-1 flex-col overflow-hidden lg:flex-row',
  sidebar:
    'flex min-h-0 w-full shrink-0 flex-col border-b border-slate-200 bg-white px-4 py-5 sm:px-5 lg:w-[17rem] lg:max-w-xs lg:border-b-0 lg:border-r lg:py-6',
  sidebarTitle: 'text-lg font-bold tracking-tight text-slate-900',
  sidebarSub: 'mt-0.5 text-sm text-slate-500',
  sidebarLabel:
    'mt-4 text-[0.65rem] font-bold uppercase tracking-wide text-teal-800/80 first:mt-0',
  navList: 'mt-2 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto',
  navItem:
    'flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50/50 hover:text-teal-900',
  navItemActive:
    'border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-500/25 shadow-sm',
  navIcon: 'h-5 w-5 shrink-0 text-teal-600',
  main: 'flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50 p-3 sm:p-4',
  mainScroll: 'min-h-0 flex-1 overflow-y-auto pr-1',
  sectionTitle: 'text-base font-bold text-slate-900',
  sectionDesc: 'mt-0.5 text-sm text-slate-500',
  hero:
    'relative overflow-hidden rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-4 text-white shadow-lg shadow-teal-900/15 sm:p-5',
  heroTitle: 'text-lg font-bold tracking-tight sm:text-xl',
  heroSub: 'mt-1 max-w-xl text-xs leading-snug text-teal-100',
  kpiGrid: 'mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3',
  kpiCard:
    'rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur-sm transition hover:bg-white/15',
  kpiValue: 'text-xl font-bold tabular-nums sm:text-2xl',
  kpiLabel: 'mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-teal-100',
  kpiHint: 'mt-0.5 text-[0.6rem] text-teal-100/80',
  sectionPanel:
    'rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4',
  panelHeader: 'flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3',
  card: 'rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5',
  metricGrid: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3',
  metricCard:
    'rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200',
  metricValue: 'text-2xl font-bold text-teal-800 tabular-nums',
  metricLabel: 'mt-1 text-sm font-semibold text-slate-700',
  metricHint: 'mt-0.5 text-xs text-slate-500',
  btnPrimary:
    'inline-flex min-h-[2.25rem] items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60 sm:text-sm sm:min-h-[2.5rem]',
  btnSecondary:
    'inline-flex min-h-[2.25rem] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 sm:text-sm sm:min-h-[2.5rem]',
  btnDanger:
    'inline-flex min-h-[2rem] items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 disabled:opacity-60',
  btnSuccess:
    'inline-flex min-h-[2rem] items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60',
  tableWrap: 'overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm',
  table: 'min-w-full divide-y divide-slate-200 text-sm',
  th: 'bg-slate-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500',
  td: 'px-4 py-3 text-slate-700',
  tdMuted: 'px-4 py-3 text-sm text-slate-500',
  rowInactive: 'bg-slate-50/90 text-slate-400',
  badgeActive:
    'inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-emerald-800',
  badgeInactive:
    'inline-flex rounded-full bg-slate-200 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-slate-600',
  input: searchCard.input,
  label: searchCard.label,
  modalBackdrop: 'fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-4',
  modal:
    'relative z-[201] w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50',
  modalTitle: 'text-lg font-bold text-slate-900',
  modalSub: 'mt-1 text-sm text-slate-500',
  facilityGrid: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
  facilityCard:
    'rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300 hover:shadow-md',
  toolbar: 'mb-3 flex flex-wrap items-center gap-3 justify-between',
  filters: 'mb-3 flex flex-wrap items-center gap-2',
  footerLink: 'font-semibold text-teal-700 hover:underline',
  chartGrid: 'grid grid-cols-1 gap-3 lg:grid-cols-2',
  chartPanel: 'rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4',
  chartBox: 'mt-3 h-56 w-full sm:h-60',
};

export const FACILITY_TYPE_OPTIONS = [
  { value: 'hospital', label: 'State Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'health_center', label: 'Health Center' },
];

export function facilityTypeLabel(type) {
  return FACILITY_TYPE_OPTIONS.find((o) => o.value === type)?.label || type || '—';
}

export const ADMIN_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: 'dashboard' },
  { id: 'facilities', label: 'Facility Management', icon: 'facility' },
  { id: 'employees', label: 'Employee Management', icon: 'employees' },
  { id: 'settings', label: 'System Settings', icon: 'settings' },
];
