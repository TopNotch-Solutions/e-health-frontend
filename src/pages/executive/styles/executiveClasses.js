import { nurse as base, topbar } from '../../nurse/styles/nurseClasses';
import { searchCard } from '../../front_office/styles/frontOfficeClasses';
import { greenCard, greenOn } from '../../styles/cardSurfaces';

export const ex = {
  ...base,
  topbar,
  body: 'mx-auto flex w-full min-h-0 max-w-[1600px] flex-1 flex-col overflow-hidden lg:flex-row',
  sidebar:
    'flex min-h-0 w-full shrink-0 flex-col border-b border-slate-200 bg-white px-4 py-5 sm:px-5 lg:w-[17rem] lg:max-w-xs lg:border-b-0 lg:border-r lg:py-6',
  sidebarTitle: 'text-lg font-bold tracking-tight text-slate-900',
  sidebarSub: 'mt-0.5 text-sm text-slate-500',
  sidebarGroup:
    'mt-4 text-[0.65rem] font-bold uppercase tracking-wide text-teal-800/80 first:mt-2',
  navList: 'mt-1.5 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-2',
  navItem:
    'flex w-full items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50/50 hover:text-teal-900 sm:text-sm',
  navItemActive:
    'border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-500/25 shadow-sm',
  main: 'flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50 p-3 sm:p-4',
  mainScroll: 'min-h-0 flex-1 overflow-y-auto pr-1',
  readOnlyBanner:
    'mb-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600',
  hero:
    'relative overflow-hidden rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-4 text-white shadow-lg shadow-teal-900/15 sm:p-5',
  heroTitle: 'text-lg font-bold tracking-tight sm:text-xl',
  heroSub: 'mt-1 max-w-2xl text-xs leading-snug text-teal-100',
  kpiGrid: 'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  kpiCard: `${greenCard} px-3 py-2.5`,
  kpiValue: 'text-lg font-bold tabular-nums text-white sm:text-xl',
  kpiLabel: `mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${greenOn.fieldLabel}`,
  chartGrid: 'mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-2',
  chartPanel: `${greenCard} p-3 sm:p-4`,
  chartBox: 'mt-3 h-56 w-full sm:h-60',
  sectionTitle: greenOn.titleSm,
  sectionDesc: greenOn.desc,
  footerLink: 'font-semibold text-teal-700 hover:underline',
};

export const EXECUTIVE_SECTIONS = [
  { group: 'Summary', items: [{ id: 'overview', label: 'Executive overview' }] },
  {
    group: 'Clinical modules',
    items: [
      { id: 'front_office', label: 'Front office' },
      { id: 'nursing', label: 'Nursing' },
      { id: 'doctor', label: 'Doctor / clinical' },
      { id: 'pharmacy', label: 'Pharmacy' },
      { id: 'laboratory', label: 'Laboratory' },
      { id: 'radiology', label: 'Radiology / sonar' },
      { id: 'ward', label: 'Ward & admissions' },
      { id: 'kitchen', label: 'Kitchen & diet' },
    ],
  },
  {
    group: 'National analytics',
    items: [
      { id: 'patients', label: 'Patients' },
      { id: 'employees', label: 'Employees' },
      { id: 'revenue', label: 'Revenue & billing' },
      { id: 'departments', label: 'Departments & queues' },
      { id: 'admissions', label: 'Admissions flow' },
      { id: 'mortality', label: 'Mortality & mortuary' },
    ],
  },
];
