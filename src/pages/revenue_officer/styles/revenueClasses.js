import { nurse as base } from '../../nurse/styles/nurseClasses';

/** Revenue office — emerald / teal financial theme. */
export const revenue = {
  ...base,
  main: 'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-slate-50/80 p-4',
  kpiGrid: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4',
  kpiCard:
    'rounded-xl border border-emerald-500/35 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 text-white shadow-md shadow-emerald-900/15 transition hover:shadow-lg hover:shadow-emerald-900/25 sm:p-6',
  kpiCardAlert:
    'rounded-xl border border-amber-400/50 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 p-5 text-white shadow-md shadow-amber-900/15 sm:p-6',
  kpiValue: 'mt-2 text-2xl font-bold tabular-nums text-white sm:text-3xl',
  kpiLabel: 'text-xs font-semibold uppercase tracking-wider text-emerald-100',
  kpiLabelAlert: 'text-xs font-semibold uppercase tracking-wide text-amber-100',
  kpiHint: 'mt-2 text-sm text-emerald-50/90',
  kpiHintAlert: 'mt-1 text-xs text-amber-50/90',
  sectionPanel:
    'rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5',
  sectionTitle: 'text-base font-bold text-emerald-900',
  sectionDesc: 'mt-1 text-sm text-slate-600',
  sectionHeader: 'flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-3',
  select:
    'rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-sm font-medium text-emerald-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/25',
  tableWrap: 'mt-4 overflow-x-auto rounded-lg border border-slate-200',
  table: 'w-full min-w-[480px] text-left text-sm',
  tableHead: 'bg-emerald-50 text-xs font-bold uppercase tracking-wide text-emerald-900',
  tableHeadCell: 'px-3 py-2.5',
  tableRow: 'border-t border-slate-100 transition hover:bg-emerald-50/40',
  tableCell: 'px-3 py-2.5 text-slate-700',
  tableCellStrong: 'px-3 py-2.5 font-semibold text-slate-900',
  summaryBar:
    'mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900',
  emptyState: 'py-8 text-center text-sm text-slate-500',
  shiftList: 'mt-4 space-y-4',
};
