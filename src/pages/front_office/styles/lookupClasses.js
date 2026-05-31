/**
 * Tailwind tokens for the Find patient record (lookup) interface.
 * Aligned with the EHR visual system (teal brand, cards, hero).
 */
import { fo } from './frontOfficeModuleClasses';

export const lookup = {
  page: 'mx-auto max-w-6xl space-y-6 pb-10',
  hero:
    'overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-teal-900 to-teal-800 text-white shadow-lg',
  heroInner: 'p-6 sm:p-8',
  heroKicker: 'text-xs font-semibold uppercase tracking-widest text-teal-200/90',
  heroTitle: 'mt-1 text-2xl font-bold tracking-tight sm:text-3xl',
  heroMeta: 'mt-2 text-sm text-teal-100/90',
  heroSteps: 'mt-4 flex flex-wrap gap-2',
  stepPill: 'rounded-full px-3 py-1 text-xs font-semibold',
  stepActive: 'bg-white/20 text-white ring-1 ring-white/30',
  stepDone: 'bg-emerald-500/30 text-emerald-50',
  stepPending: 'bg-white/10 text-teal-100/70',
  statsGrid: 'grid gap-4 sm:grid-cols-3',
  statCard: 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm',
  statLabel: 'text-xs font-semibold uppercase tracking-wide text-slate-500',
  statValue: 'mt-1 text-2xl font-bold text-slate-900',
  searchWrap: 'mx-auto w-full max-w-xl',
  searchCard:
    'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8',
  searchTitle: 'text-center text-lg font-bold text-slate-900',
  searchSubtitle: 'mb-6 text-center text-sm leading-relaxed text-slate-500',
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
  emergencyBanner:
    'rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm',
  emergencyBtn: 'font-semibold text-rose-700 hover:text-rose-800 hover:underline disabled:opacity-50',
  resultsPanel: 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6',
  resultsHead: 'mb-5 flex flex-wrap items-start justify-between gap-4',
  resultsTitle: 'text-lg font-bold text-slate-900',
  resultsSubtitle: 'mt-0.5 text-sm text-slate-500',
  btnSecondary:
    'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:bg-slate-50',
  btnPrimary:
    'rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60',
  btnGhost: 'rounded-lg px-3 py-1.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50',
  actionGrid: fo.actionGrid,
  actionCard: fo.actionCard,
  actionCardDanger: fo.actionCardEmergency,
  actionIcon: fo.actionIcon,
  actionIconBrand: fo.actionIconBrand,
  actionIconDanger: fo.actionIconDanger,
  actionTitle: fo.actionTitle,
  actionText: fo.actionText,
  returningCard:
    'rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50/80 to-white p-5 shadow-sm',
  returningBadge:
    'inline-flex rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white',
  intakeSection: 'mt-5 rounded-xl border border-teal-100 bg-white/90 p-4 shadow-inner',
  intakeTitle: 'text-sm font-bold uppercase tracking-wide text-teal-800',
  select:
    'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30',
  partialRow:
    'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4',
  hint: 'rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600',
  empty: 'rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500',
  emergencyToggle:
    'flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-rose-200',
  emergencyToggleOn: 'border-rose-300 bg-rose-50/80 ring-1 ring-rose-200/50',
  emergencyToggleIcon:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-lg font-bold text-rose-700',
  emergencyToggleTitle: 'block text-sm font-bold text-slate-900',
  emergencyToggleHint: 'block text-xs text-slate-500',
  emergencyToggleSwitch:
    'relative h-6 w-11 shrink-0 rounded-full bg-slate-200 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition',
  emergencyToggleSwitchOn: 'bg-rose-600 after:translate-x-5',
};
