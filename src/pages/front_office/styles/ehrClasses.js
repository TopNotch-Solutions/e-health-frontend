/** Tailwind class tokens for the EHR interface. */

export const ehr = {
  page: 'mx-auto w-full max-w-6xl space-y-6',
  backLink:
    'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800',
  hero:
    'overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-teal-900 to-teal-800 text-white shadow-lg',
  heroInner: 'flex flex-wrap items-start justify-between gap-6 p-6 sm:p-8',
  avatar:
    'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold ring-2 ring-white/30 sm:h-20 sm:w-20 sm:text-3xl',
  heroTitle: 'text-2xl font-bold tracking-tight sm:text-3xl',
  heroMeta: 'mt-1 text-sm text-teal-100/90',
  badge:
    'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
  badgeBrand: 'bg-teal-500/30 text-teal-50 ring-1 ring-teal-400/40',
  badgeSuccess: 'bg-emerald-500/25 text-emerald-50 ring-1 ring-emerald-400/30',
  badgeActive: 'bg-sky-500/25 text-sky-50 ring-1 ring-sky-400/30',
  badgeDanger: 'bg-rose-500/25 text-rose-50 ring-1 ring-rose-400/30',
  badgeNeutral: 'bg-white/15 text-slate-100 ring-1 ring-white/20',
  statsGrid: 'grid gap-4 sm:grid-cols-3',
  statCard:
    'rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md',
  statLabel: 'text-xs font-semibold uppercase tracking-wide text-slate-500',
  statValue: 'mt-1 text-2xl font-bold text-slate-900',
  layout: 'grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]',
  panel:
    'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm',
  panelTitle: 'text-sm font-bold uppercase tracking-wide text-teal-800',
  fieldLabel: 'text-xs font-medium uppercase tracking-wide text-slate-400',
  fieldValue: 'mt-0.5 text-sm font-semibold text-slate-900',
  fieldValueMuted: 'mt-0.5 text-sm text-slate-700',
  timelineHead: 'mb-4 flex flex-wrap items-center justify-between gap-2',
  timelineTitle: 'text-lg font-bold text-slate-900',
  visitCard:
    'rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-teal-200',
  visitCardOpen: 'border-teal-300 ring-1 ring-teal-100',
  visitHeader:
    'flex w-full flex-wrap items-start justify-between gap-3 p-4 text-left transition hover:bg-slate-50/80',
  visitBody: 'border-t border-slate-100 bg-slate-50/50 px-4 py-4',
  sectionBlock: 'rounded-lg border border-slate-200 bg-white p-3',
  sectionTitle: 'text-xs font-bold uppercase tracking-wide text-slate-500',
  empty:
    'rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500',
  skeleton: 'animate-pulse rounded-lg bg-slate-200',
  tabBar: 'flex gap-1 rounded-xl bg-slate-100 p-1',
  tabActive: 'rounded-lg bg-white px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm',
  tabInactive: 'rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:text-teal-700',
};

export function statusBadgeClass(tone) {
  const map = {
    brand: ehr.badgeBrand,
    success: ehr.badgeSuccess,
    active: ehr.badgeActive,
    danger: ehr.badgeDanger,
    info: ehr.badgeActive,
    neutral: ehr.badgeNeutral,
  };
  return `${ehr.badge} ${map[tone] || map.neutral}`;
}
