/**
 * Front office forms — aligned with nurse module (teal primary, slate neutrals).
 */
import { searchCard, topbar } from './frontOfficeClasses';
import { greenCard, greenOn, greenTable } from '../../styles/cardSurfaces';

export { topbar };

export const fo = {
  page: 'mx-auto w-full max-w-3xl',
  header: 'mb-5',
  kicker: 'text-xs font-bold uppercase tracking-wide text-teal-700',
  title: 'text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl',
  sub: 'mt-1 text-sm text-slate-500',
  form: 'space-y-4',
  registrationIntro:
    'mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6',
  sectionPanel: 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6',
  sectionTitle: 'mb-4 text-base font-bold text-slate-900',
  fieldRow: 'grid gap-4 sm:grid-cols-2',
  field: searchCard.field,
  label: 'block text-sm font-medium text-slate-700',
  input: searchCard.input,
  select:
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30',
  textarea:
    'w-full min-h-[88px] resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30',
  actions:
    'mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5',
  btnPrimary:
    'inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-teal-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60',
  btnPrimaryBlock: searchCard.submit,
  btnOutline:
    'inline-flex min-h-[2.75rem] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30',
  btnDanger:
    'inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60',
  progressWrap: 'mb-4 flex items-center gap-4',
  progressTrack: 'h-2 flex-1 overflow-hidden rounded-full bg-slate-200',
  progressFill: 'h-full rounded-full bg-teal-600 transition-all',
  progressLabel: 'text-sm font-semibold text-slate-600',
  error: 'mt-3 text-sm font-medium text-red-600',
  summaryList: 'space-y-2 text-sm text-slate-700',
  actionGrid: 'grid gap-4 sm:grid-cols-2',
  stepper: 'mb-5 flex flex-wrap items-center justify-between gap-1 sm:gap-2',
  stepLine: 'mx-0.5 hidden h-0.5 w-4 flex-none bg-slate-200 sm:block sm:w-6',
  stepItem: 'flex min-w-0 flex-1 items-center gap-2',
  stepNum:
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
  stepNumActive: 'bg-teal-600 text-white',
  stepNumDone: 'bg-teal-700 text-white',
  stepNumPending: 'bg-slate-200 text-slate-600',
  stepLabel: 'truncate text-[0.65rem] font-bold uppercase tracking-wide text-slate-400 sm:text-xs',
  stepLabelActive: 'text-teal-800',
  stepLabelDone: 'text-teal-700',
  actionCard:
    `${greenCard} group w-full p-5 text-left transition hover:border-emerald-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500/40`,
  actionCardEmergency:
    'group w-full rounded-xl border border-rose-800 bg-gradient-to-br from-rose-600 via-rose-700 to-red-800 p-5 text-left text-white shadow-lg shadow-rose-900/30 transition hover:from-rose-700 hover:via-rose-800 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  actionIcon:
    'mb-3 flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold',
  actionIconBrand: 'bg-teal-100 text-teal-800 group-hover:bg-teal-200',
  actionIconDanger: 'bg-white/20 text-white group-hover:bg-white/30',
  actionTitle: greenOn.titleSm,
  actionText: greenOn.desc,
  actionTitleEmergency: 'text-sm font-bold text-white',
  actionTextEmergency: 'mt-0.5 text-sm text-rose-100',
  tableWrap: greenTable.wrap,
  table: greenTable.table,
  th: greenTable.th,
  td: greenTable.td,
};
