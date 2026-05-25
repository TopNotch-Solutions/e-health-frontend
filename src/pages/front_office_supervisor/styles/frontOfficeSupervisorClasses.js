import { nurse as base, topbar } from '../../nurse/styles/nurseClasses';

export const fos = {
  ...base,
  topbar,
  main: 'flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50 p-3 sm:p-4',
  hero:
    'relative overflow-hidden rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 p-4 text-white shadow-lg shadow-teal-900/15 sm:p-5',
  heroTitle: 'text-lg font-bold tracking-tight sm:text-xl',
  heroSub: 'mt-1 max-w-xl text-xs leading-snug text-teal-100',
  kpiGrid: 'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6',
  kpiCard:
    'rounded-lg border border-white/20 bg-white/10 px-2.5 py-2 backdrop-blur-sm transition hover:bg-white/15',
  kpiValue: 'text-lg font-bold tabular-nums sm:text-xl',
  kpiLabel: 'mt-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-teal-100',
  sectionPanel:
    'rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4',
  sectionTitle: 'text-sm font-bold text-slate-900',
  mainInner: 'flex min-h-0 flex-1 flex-col gap-2 overflow-hidden',
  workspaceScroll: 'min-h-0 flex-1 overflow-y-auto',
  chartGrid: 'grid grid-cols-1 gap-3 lg:grid-cols-2',
  chartPanel: 'rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4',
  chartBox: 'mt-3 h-56 w-full sm:h-60',
  footerLink: 'font-semibold text-teal-700 hover:underline',
  staffTable: 'mt-3 w-full text-left text-sm',
  staffTh:
    'border-b border-slate-200 pb-2 text-[0.65rem] font-bold uppercase tracking-wide text-slate-500',
  staffTd: 'border-b border-slate-100 py-2.5 align-top text-slate-800',
  staffName: 'font-semibold text-slate-900',
  staffMeta: 'text-xs text-slate-500',
  badge:
    'inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide',
  badgeActive: 'bg-emerald-100 text-emerald-800',
  badgeIdle: 'bg-slate-100 text-slate-600',
  badgeEmergency: 'bg-rose-100 text-rose-800',
  activityRow:
    'flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 py-2.5 last:border-0',
  activityPatient: 'text-sm font-semibold text-slate-900',
  activityMeta: 'text-xs text-slate-500',
};
