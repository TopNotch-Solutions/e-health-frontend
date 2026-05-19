/**
 * Nurse module UI — aligned with front office (teal primary, slate neutrals).
 */
import { searchCard, topbar } from '../../front_office/styles/frontOfficeClasses';

export { topbar };

export const nurse = {
  page: 'flex h-screen max-h-[100dvh] flex-col overflow-hidden bg-slate-50 text-slate-900',
  body: 'mx-auto flex w-full min-h-0 max-w-[1600px] flex-1 flex-col overflow-hidden lg:flex-row',
  queueAside:
    'flex min-h-0 w-full flex-col border-b border-slate-200 bg-white px-4 py-5 sm:px-5 lg:w-[38%] lg:max-w-md lg:border-b-0 lg:border-r lg:py-6',
  queueTitle: 'text-lg font-bold tracking-tight text-slate-900',
  queueSub: 'mt-0.5 text-sm text-slate-500',
  queueCount: 'font-bold text-teal-700',
  queueList: 'mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto',
  queueActivePanel:
    'mt-3 flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-teal-200 bg-teal-50/40 px-4 py-8 text-center',
  queueActiveBadge:
    'inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-800',
  queueActiveTitle: 'mt-4 text-base font-bold text-slate-900',
  queueActiveText: 'mt-2 max-w-xs text-sm leading-relaxed text-slate-600',
  queueActivePatient:
    'mt-5 w-full max-w-xs rounded-lg border border-teal-200 bg-white p-3 text-left shadow-sm',
  queueActivePatientName: 'text-sm font-bold text-slate-900',
  queueActivePatientMeta: 'mt-0.5 text-xs text-slate-500',
  queueCard:
    'rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition hover:border-teal-200',
  queueCardActive: 'border-teal-500 ring-1 ring-teal-500/25',
  queueCardLocked: 'opacity-75 bg-slate-50',
  queueCardEmergency: 'border-rose-300 bg-rose-50/40 ring-1 ring-rose-200/60',
  badgeEmergency:
    'inline-flex rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-rose-900 bg-rose-100',
  queueName: 'mt-1 text-sm font-bold leading-tight text-slate-900',
  queueMeta: 'text-xs leading-snug text-slate-500',
  queueId: 'text-[0.65rem] font-semibold leading-tight text-slate-600',
  searchInput: searchCard.input,
  searchWrap: 'mt-4',
  hint: 'text-sm text-slate-500',
  main: 'flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50 p-4 sm:p-6',
  idle:
    'flex flex-1 flex-col items-center justify-center px-6 py-12 text-center',
  idleTitle: 'mt-4 text-lg font-bold text-slate-900',
  idleText: 'mt-2 max-w-md text-sm leading-relaxed text-slate-500',
  banner:
    'grid gap-4 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-600 to-teal-700 p-5 text-white shadow-lg shadow-teal-900/15 sm:grid-cols-3',
  bannerLabel: 'text-xs font-semibold uppercase tracking-wide text-teal-100',
  bannerValue: 'mt-0.5 block text-base font-bold',
  formScroll: 'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4',
  readOnlyInput: 'cursor-default bg-slate-50 text-slate-700',
  btnAction:
    'inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60',
  btnSecondary:
    'inline-flex min-h-[2.75rem] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60',
  btnPharmacy:
    'bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1',
  btnAdmit:
    'bg-amber-700 text-white hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1',
  btnDischarge:
    'bg-slate-800 text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1',
  readOnlyBanner:
    'rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-slate-600',
  readOnlyGroup:
    'rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm sm:p-5',
  readOnlyGroupTitle: 'text-base font-bold text-slate-900',
  readOnlyBadge:
    'inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-slate-500',
  readOnlySectionCard:
    'rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm',
  readOnlySectionTitle:
    'border-b border-slate-100 pb-2 text-sm font-bold text-slate-900',
  readOnlyStatGrid: 'mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3',
  readOnlyStatCard:
    'rounded-lg border border-teal-100 bg-teal-50/50 px-3 py-2.5 text-center sm:text-left',
  readOnlyStatLabel: 'text-[0.65rem] font-bold uppercase tracking-wide text-teal-800/80',
  readOnlyStatValue: 'mt-1 text-base font-bold text-slate-900',
  readOnlyFieldCard: 'rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5',
  readOnlyFieldLabel: 'text-xs font-semibold text-slate-600',
  readOnlyFieldValue: 'mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800',
  tagList: 'mt-3 flex flex-wrap gap-2',
  tag:
    'inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-900',
  tagRemove:
    'ml-0.5 border-none bg-transparent p-0 text-base leading-none text-teal-700 hover:text-red-600',
  dispositionRow: 'mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2',
  sectionPanel:
    'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6',
  sectionTitle: 'text-base font-bold text-slate-900',
  vitalsGrid: 'mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3',
  textarea:
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 min-h-[88px] resize-y',
  select:
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30',
  field: searchCard.field,
  label: searchCard.label,
  input: searchCard.input,
  btnCardPrimary:
    'mt-2 w-full rounded-md bg-teal-600 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60',
  btnCardResume:
    'mt-2 w-full rounded-md border border-teal-600 bg-teal-50 py-1.5 text-xs font-semibold text-teal-800 transition hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 disabled:opacity-60',
  btnCardLocked:
    'mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-slate-200 bg-slate-100 py-1.5 text-xs font-semibold text-slate-400',
  btnComplete: `${searchCard.submit} mt-6`,
  cardDone:
    'mt-2 flex items-center justify-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-800',
  badgePending:
    'inline-flex rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-amber-800 bg-amber-100',
  badgeProgress:
    'inline-flex flex-wrap items-center gap-0.5 rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-teal-800 bg-teal-100',
  badgeCompleted:
    'inline-flex rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-emerald-800 bg-emerald-100',
  fieldError: 'mt-1 text-xs font-medium text-red-600',
  inputError: 'border-red-400 focus:border-red-500 focus:ring-red-500/30',
  submitError: 'mt-2 text-center text-sm font-medium text-red-600',
  lockTag: 'inline-flex items-center gap-0.5 text-[0.58rem] font-bold normal-case',
  alert:
    'mx-4 mt-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 sm:mx-6',
  toast:
    'fixed right-4 top-20 z-50 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg',
  footer:
    'shrink-0 border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500',
  footerLink: 'font-semibold text-teal-700 hover:underline',
  liveDot: 'inline-block h-2 w-2 rounded-full bg-emerald-500',
  liveDotOff: 'inline-block h-2 w-2 rounded-full bg-slate-300',
};
