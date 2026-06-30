import { greenCard, greenCardLg, greenOn } from '../../styles/cardSurfaces';

export const topbar = {
  root:
    'flex w-full shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm shadow-slate-200/40 backdrop-blur-md sm:px-6',
  brand: 'flex min-w-0 items-center',
  signOut:
    'rounded-xl border border-red-500/20 bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
  reportingLink:
    'rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
};

export const searchCard = {
  wrapper: 'mx-auto w-full max-w-lg',
  card: `${greenCardLg} p-6 shadow-xl shadow-emerald-900/20 sm:p-8`,
  title: `${greenOn.title} text-center`,
  subtitle: `${greenOn.desc} mb-6 text-center leading-relaxed`,
  toggleGroup: 'mb-6 flex rounded-xl bg-slate-100 p-1',
  toggleActive:
    'flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-md transition-colors',
  toggleInactive:
    'flex-1 rounded-lg py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:text-teal-700',
  field: 'space-y-1.5',
  label: greenOn.label,
  input:
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30',
  submit:
    'w-full rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
};

export const returningPanel = {
  card: `${greenCardLg} border-2 border-emerald-400/50 p-5`,
  badge: 'inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white',
  intakeSection: `${greenCard} mt-5 p-4`,
  intakeTitle: `${greenOn.titleSm} uppercase tracking-wide`,
  select:
    'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30',
};

export const toast = {
  container: 'pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2',
  item: 'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm',
  error: 'border-red-200 bg-red-50 text-red-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  info: 'border-slate-200 bg-white text-slate-900',
  dismiss: 'ml-auto shrink-0 text-sm font-medium opacity-70 hover:opacity-100',
};

export const shell = {
  main: 'flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50 p-4 sm:p-6',
  footer:
    'shrink-0 border-t border-slate-200/80 bg-white/80 px-4 py-3 text-center text-xs text-slate-500 backdrop-blur-sm',
  footerLink: 'font-semibold text-teal-700 hover:underline',
};
