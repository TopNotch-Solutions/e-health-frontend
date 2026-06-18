/**
 * Auth pages (login) — aligned with front office / lookup visual system.
 */

export const auth = {
  shell: 'flex min-h-screen min-h-[100dvh] flex-col bg-white',
  main: 'flex min-h-0 flex-1 flex-col',
  split: 'flex min-h-0 flex-1 flex-col lg:flex-row',
  /** Left / top promo panel — 60% width on large screens */
  heroPanel:
    'flex w-full flex-col justify-between bg-gradient-to-br from-slate-900 via-teal-900 to-teal-800 text-white lg:w-[60%] lg:min-h-0',
  heroInner: 'flex flex-1 flex-col justify-center p-8 sm:p-10 lg:p-12',
  heroBrand: 'text-2xl font-bold tracking-tight sm:text-3xl',
  heroKicker: 'mt-6 text-xs font-semibold uppercase tracking-widest text-teal-200/90 sm:mt-8',
  heroTitle: 'mt-2 text-3xl font-bold tracking-tight sm:text-4xl',
  heroMeta: 'mt-3 text-sm text-teal-100/90',
  heroLead: 'mt-4 max-w-lg text-sm leading-relaxed text-teal-100/80 sm:text-base',
  heroFooter: 'border-t border-white/10 px-8 py-4 text-xs text-teal-100/70 sm:px-10 lg:px-12',
  /** Right panel — 40% width on large screens */
  formPanel:
    'flex w-full items-center justify-center bg-slate-50 px-4 py-8 sm:px-8 lg:w-[40%] lg:py-12',
  formInner: 'w-full max-w-md',
  card: 'rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-xl shadow-slate-300/30 backdrop-blur-sm sm:p-8',
  cardTitle: 'text-center text-lg font-bold text-slate-900',
  cardSubtitle: 'mb-6 text-center text-sm text-slate-500',
  coat: 'mx-auto mb-4 h-20 w-20 object-contain',
  field: 'space-y-1.5',
  label: 'block text-sm font-medium text-slate-700',
  input:
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30',
  passwordWrap: 'relative',
  passwordToggle:
    'absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700',
  submit:
    'w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/25 transition hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  error: 'rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800',
  devHint:
    'mb-4 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-center text-xs text-teal-900',
};
