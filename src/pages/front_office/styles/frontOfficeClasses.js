export const topbar = {
  root:
    'flex w-full shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm shadow-slate-200/40 backdrop-blur-md sm:px-6',
  brand: 'flex min-w-0 items-center',
  signOut:
    'rounded-xl border border-red-500/20 bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
};

export const searchCard = {
  wrapper: 'mx-auto w-full max-w-lg',
  card: 'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8',
  title: 'text-center text-lg font-bold text-slate-900',
  subtitle: 'mb-6 text-center text-sm leading-relaxed text-slate-500',
  toggleGroup: 'mb-6 flex rounded-xl bg-slate-100 p-1',
  toggleActive:
    'flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-md transition-colors',
  toggleInactive:
    'flex-1 rounded-lg py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:text-teal-700',
  field: 'space-y-1.5',
  label: 'block text-sm font-medium text-slate-700',
  input:
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30',
  submit:
    'w-full rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
};

export const returningPanel = {
  card: 'rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm',
  badge: 'inline-flex rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white',
  intakeSection: 'mt-5 rounded-xl border border-teal-100 bg-white/80 p-4',
  intakeTitle: 'text-sm font-bold uppercase tracking-wide text-teal-800',
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
