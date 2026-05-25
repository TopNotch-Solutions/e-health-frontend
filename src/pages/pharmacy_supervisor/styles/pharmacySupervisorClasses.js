import { nurse as base, topbar } from '../../nurse/styles/nurseClasses';

/** Pharmacy supervisor — same shell as ward supervisor, teal pharmacy accent. */
export const ps = {
  ...base,
  topbar,
  main: 'flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50 p-3 sm:p-4',
  hero:
    'relative overflow-hidden rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 p-4 text-white shadow-lg shadow-teal-900/15 sm:p-5',
  heroTitle: 'text-lg font-bold tracking-tight sm:text-xl',
  heroSub: 'mt-1 max-w-xl text-xs leading-snug text-teal-100',
  kpiGrid: 'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4',
  kpiCard:
    'rounded-lg border border-white/20 bg-white/10 px-2.5 py-2 backdrop-blur-sm transition hover:bg-white/15',
  kpiValue: 'text-lg font-bold tabular-nums sm:text-xl',
  kpiLabel: 'mt-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-teal-100',
  tabGroup:
    'mb-3 flex shrink-0 gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm',
  tabBtn:
    'min-h-[2.25rem] flex-1 rounded-md px-3 py-2 text-xs font-semibold transition sm:text-sm',
  tabBtnActive: 'bg-teal-600 text-white shadow-sm',
  tabBtnIdle: 'text-slate-600 hover:bg-slate-50',
  sectionPanel:
    'rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4',
  sectionTitle: 'text-sm font-bold text-slate-900',
  panelHeader: 'flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3',
  btnPrimary:
    'inline-flex min-h-[2.25rem] items-center justify-center rounded-lg bg-teal-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60 sm:text-sm sm:min-h-[2.5rem]',
  btnGhost:
    'inline-flex min-h-[2.25rem] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:text-sm sm:min-h-[2.5rem]',
  alertCard:
    'rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-left shadow-sm transition hover:border-rose-300',
  alertCardTitle: 'text-sm font-bold text-rose-900',
  alertCardMeta: 'mt-0.5 text-xs text-rose-700',
  inventoryRow:
    'flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm',
  inventoryName: 'text-sm font-bold text-slate-900',
  inventoryMeta: 'text-xs text-slate-500',
  stockBadge:
    'inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide',
  stockOk: 'bg-emerald-100 text-emerald-800',
  stockLow: 'bg-rose-100 text-rose-800',
  rxCard: 'rounded-lg border border-slate-200 bg-white p-3 shadow-sm',
  rxDoctor: 'text-xs font-semibold text-teal-700',
  rxItem: 'mt-1 text-xs text-slate-600',
  formInput:
    'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20',
  formSelect:
    'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
  formLabel: 'text-xs font-semibold text-slate-700',
  mainInner: 'flex min-h-0 flex-1 flex-col gap-2 overflow-hidden',
  workspaceScroll: 'min-h-0 flex-1 overflow-y-auto',
  chartGrid: 'grid grid-cols-1 gap-3 lg:grid-cols-2',
  chartPanel: 'rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4',
  chartBox: 'mt-3 h-56 w-full sm:h-60',
  footerLink: 'font-semibold text-teal-700 hover:underline',
  toastLow:
    'mx-4 mb-2 shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900',
};
