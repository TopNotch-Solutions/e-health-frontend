import { nurse as base, topbar } from '../../nurse/styles/nurseClasses';
import { searchCard } from '../../front_office/styles/frontOfficeClasses';
import { greenCard, greenOn, greenTable } from '../../styles/cardSurfaces';

/** Shared green card surface for admin panels, tables, and metrics. */
/** System admin — same shell as clinical/supervisor modules (teal primary, slate neutrals). */
export const admin = {
  ...base,
  topbar,
  body: 'mx-auto flex w-full min-h-0 max-w-[1600px] flex-1 flex-col overflow-hidden lg:flex-row',
  sidebar:
    'flex min-h-0 w-full shrink-0 flex-col border-b border-slate-200 bg-white px-4 py-5 sm:px-5 lg:h-full lg:w-[17rem] lg:max-w-xs lg:overflow-hidden lg:border-b-0 lg:border-r lg:py-6',
  sidebarTitle: 'text-lg font-bold tracking-tight text-slate-900',
  sidebarSub: 'mt-0.5 text-sm text-slate-500',
  sidebarLabel:
    'mt-4 text-[0.65rem] font-bold uppercase tracking-wide text-teal-800/80 first:mt-0',
  navList:
    'mt-2 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-y-contain pr-1',
  navItem:
    'flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50/50 hover:text-teal-900',
  navItemActive:
    'border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-500/25 shadow-sm',
  navIcon: 'h-5 w-5 shrink-0 text-teal-600',
  main: 'flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50 p-3 sm:p-4',
  mainScroll: 'min-h-0 flex-1 overflow-y-auto pr-1',
  sectionTitle: 'text-base font-bold text-slate-900',
  sectionDesc: 'mt-0.5 text-sm text-slate-500',
  cardTitle: greenOn.title,
  cardDesc: greenOn.desc,
  cardBody: greenOn.body,
  cardFieldLabel: greenOn.fieldLabel,
  cardFieldValue: greenOn.fieldValue,
  cardLink: greenOn.link,  hero:
    'relative overflow-hidden rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-4 text-white shadow-lg shadow-teal-900/15 sm:p-5',
  heroTitle: 'text-lg font-bold tracking-tight sm:text-xl',
  heroSub: 'mt-1 max-w-xl text-xs leading-snug text-teal-100',
  kpiGrid: 'mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4',
  kpiCard:
    'rounded-lg border border-emerald-400/30 bg-emerald-900/25 px-3 py-2.5 backdrop-blur-sm transition hover:bg-emerald-900/35',
  kpiValue: 'text-xl font-bold tabular-nums sm:text-2xl',
  kpiLabel: 'mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-teal-100',
  kpiHint: 'mt-0.5 text-[0.6rem] text-teal-100/80',
  sectionPanel: `${greenCard} p-3 sm:p-4`,
  panelHeader: 'flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3',
  card: `${greenCard} p-4 sm:p-5`,
  metricGrid: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3',
  metricCard: `${greenCard} p-4 transition hover:border-emerald-300 hover:shadow-lg`,
  metricValue: 'text-2xl font-bold text-white tabular-nums',
  metricLabel: 'mt-1 text-sm font-semibold text-emerald-50',
  metricHint: 'mt-0.5 text-xs text-emerald-100',
  icd10StatGrid: 'grid gap-3 sm:grid-cols-2 max-w-2xl',
  icd10StatCard: `${greenCard} p-4`,
  icd10StatValue: 'text-2xl font-bold tabular-nums text-white sm:text-3xl',
  icd10StatLabel: 'mt-1 text-sm font-semibold text-white',
  icd10StatHint: 'mt-0.5 text-xs text-emerald-100',
  btnPrimary:
    'inline-flex min-h-[2.25rem] items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60 sm:text-sm sm:min-h-[2.5rem]',
  btnSecondary:
    'inline-flex min-h-[2.25rem] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 sm:text-sm sm:min-h-[2.5rem]',
  btnGhost:
    'inline-flex items-center rounded-lg px-2 py-1 text-sm font-semibold text-teal-700 transition hover:bg-teal-50',
  btnDanger:
    'inline-flex min-h-[2rem] items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 disabled:opacity-60',
  btnSuccess:
    'inline-flex min-h-[2rem] items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60',
  tableWrap: greenTable.wrap,
  table: greenTable.table,
  th: greenTable.th,
  td: greenTable.td,
  tdMuted: greenTable.tdMuted,
  rowInactive: greenTable.rowInactive,
  whiteTableWrap: 'overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm',
  whiteTable: 'min-w-full divide-y divide-slate-200 text-sm',
  whiteTh:
    'bg-slate-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600',
  whiteTd: 'px-4 py-3 text-slate-800',
  whiteTdMuted: 'px-4 py-3 text-sm text-slate-500',  badgeActive:
    'inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-emerald-800',
  badgeInactive:
    'inline-flex rounded-full bg-slate-200 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-slate-600',
  input: searchCard.input,
  label: 'block text-sm font-medium text-slate-900',
  modalBackdrop: 'fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-4',
  modal:
    'relative z-[201] w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50',
  modalTitle: 'text-lg font-bold text-slate-900',
  modalSub: 'mt-1 text-sm text-slate-500',
  facilityGrid: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
  facilityCard: `${greenCard} p-4 transition hover:border-emerald-300 hover:shadow-lg`,
  toolbar: 'mb-3 flex flex-wrap items-center gap-3 justify-between',
  filters: 'mb-3 flex flex-wrap items-center gap-2',
  footerLink: 'font-semibold text-teal-700 hover:underline',
  chartGrid: 'grid grid-cols-1 gap-3 lg:grid-cols-2',
  chartPanel: 'rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4',
  chartTitle: 'text-sm font-bold text-slate-900',
  chartDesc: 'mt-0.5 text-xs text-slate-500',
  chartBox: 'mt-3 h-56 w-full sm:h-60',
};

export const FACILITY_TYPE_OPTIONS = [
  { value: 'hospital', label: 'State Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'health_center', label: 'Health Center' },
];

export const NATIONAL_ADMIN_FACILITY_NAME = 'National Health Administration';

export function isOperationalFacility(facility) {
  return facility?.name !== NATIONAL_ADMIN_FACILITY_NAME;
}

export function facilityTypeLabel(type) {
  return FACILITY_TYPE_OPTIONS.find((o) => o.value === type)?.label || type || '—';
}

export const ADMIN_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: 'dashboard' },
  { id: 'facilities', label: 'Facility Management', icon: 'facility' },
  { id: 'employees', label: 'Employee Management', icon: 'employees' },
  { id: 'admins', label: 'System Administrators', icon: 'admins' },
  { id: 'patient-records', label: 'Patient Records', icon: 'records' },
  { id: 'user-reports', label: 'User Reports', icon: 'reports' },
  { id: 'transfer-timelines', label: 'Transfer Timelines', icon: 'transfers' },
  { id: 'icd10', label: 'ICD-10 Catalog', icon: 'icd10' },
  { id: 'settings', label: 'System Settings', icon: 'settings' },
];
