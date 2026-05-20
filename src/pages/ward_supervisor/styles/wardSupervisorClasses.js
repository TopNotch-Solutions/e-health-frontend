import { nurse as base, topbar } from '../../nurse/styles/nurseClasses';

/** Ward supervisor — same shell as clinical modules, teal/green accent. */
export const ws = {
  ...base,
  topbar,
  main: 'flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50 p-3 sm:p-4',
  hero:
    'relative overflow-hidden rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-4 text-white shadow-lg shadow-teal-900/15 sm:p-5',
  heroTitle: 'text-lg font-bold tracking-tight sm:text-xl',
  heroSub: 'mt-1 max-w-xl text-xs leading-snug text-teal-100',
  kpiGrid: 'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4',
  kpiCard:
    'rounded-lg border border-white/20 bg-white/10 px-2.5 py-2 backdrop-blur-sm transition hover:bg-white/15',
  kpiValue: 'text-lg font-bold tabular-nums sm:text-xl',
  kpiLabel: 'mt-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-teal-100',
  wardCard:
    'w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-teal-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500/30',
  wardCardActive: 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20',
  wardTypePill:
    'inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-slate-600',
  miniStatRow: 'mt-3 flex flex-wrap gap-2',
  miniStat:
    'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.65rem] font-bold',
  bedGrid: 'mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  bedTile:
    'relative flex flex-col rounded-lg border p-2 shadow-sm transition hover:shadow-md',
  bedTileAvailable: 'border-emerald-200 bg-gradient-to-b from-emerald-50 to-white',
  bedTileOccupied: 'border-amber-200 bg-gradient-to-b from-amber-50 to-white',
  bedTileOos: 'border-slate-300 bg-gradient-to-b from-slate-100 to-slate-50 opacity-90',
  bedRoom: 'text-xs font-bold uppercase tracking-wide text-slate-500',
  bedNumber: 'mt-0.5 text-base font-bold text-slate-900',
  bedStatus:
    'mt-2 inline-flex w-fit rounded-full px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide',
  sectionPanel:
    'rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4',
  sectionTitle: 'text-sm font-bold text-slate-900',
  panelHeader: 'flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3',
  tabBtn:
    'rounded-lg px-3 py-2 text-sm font-semibold transition',
  tabBtnActive: 'bg-teal-600 text-white shadow-sm',
  tabBtnIdle: 'text-slate-600 hover:bg-slate-100',
  btnPrimary:
    'inline-flex min-h-[2.25rem] items-center justify-center rounded-lg bg-teal-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60 sm:text-sm sm:min-h-[2.5rem]',
  btnGhost:
    'inline-flex min-h-[2.25rem] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:text-sm sm:min-h-[2.5rem]',
  idle:
    'flex flex-col items-center justify-center px-4 py-8 text-center',
  idleTitle: 'mt-3 text-base font-bold text-slate-900',
  idleText: 'mt-1.5 max-w-md text-xs leading-relaxed text-slate-500',
  footerLink: 'font-semibold text-teal-700 hover:underline',
  queueCount: 'font-bold text-teal-700',
  /** Main column: header stays full height; only workspace scrolls */
  mainInner: 'flex min-h-0 flex-1 flex-col gap-2 overflow-hidden',
  wardInfoHeader: 'shrink-0',
  workspaceScroll: 'min-h-0 flex-1 overflow-y-auto',
};
