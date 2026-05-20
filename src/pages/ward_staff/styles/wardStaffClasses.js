import { nurse as base, topbar } from '../../nurse/styles/nurseClasses';

export const wst = {
  ...base,
  topbar,
  footerLink: 'font-semibold text-teal-700 hover:underline',
  btnPrimary:
    'inline-flex min-h-[2.5rem] items-center justify-center rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60',
  btnGhost:
    'inline-flex min-h-[2.5rem] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60',
  infoGrid: 'mt-3 grid gap-3 text-sm sm:grid-cols-2',
  infoLabel: 'text-xs font-bold uppercase tracking-wide text-slate-500',
  infoValue: 'font-medium text-slate-900',
  placementCard:
    'rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-4',
  placementTitle: 'text-xs font-bold uppercase tracking-wide text-teal-800',
  placementMain: 'mt-1 text-lg font-bold text-slate-900',
  placementSub: 'mt-0.5 text-sm text-slate-600',
};
