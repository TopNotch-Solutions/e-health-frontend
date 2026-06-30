import { topbar } from '../../front_office/styles/frontOfficeClasses';

export { topbar };

export const reporting = {
  page: 'flex min-h-screen flex-col bg-gradient-to-b from-slate-100 via-slate-50 to-white text-slate-900',
  header: `${topbar.root} sticky top-0 z-20`,
  body: 'mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:py-8',
  hero:
    'relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/50 sm:p-8',
  heroGlow:
    'pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-400/10 blur-3xl',
  heroGlowAlt:
    'pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl',
  backLink:
    'inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 transition hover:text-teal-900',
  title: 'text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl',
  subtitle: 'mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base',
  heroMeta:
    'mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500',
  heroPill:
    'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1',
  layout: 'flex flex-col gap-6 lg:gap-8',
  formPanel: 'w-full',
  formGrid: 'grid gap-6 lg:grid-cols-2 lg:gap-8',
  formActions: 'flex justify-end pt-2',
  panel:
    'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6',
  panelTitle: 'text-lg font-bold tracking-tight text-slate-900',
  panelDesc: 'mt-1 text-sm leading-relaxed text-slate-500',
  label: 'block text-xs font-bold uppercase tracking-wide text-slate-600',
  input:
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25',
  textarea:
    'mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-900 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25',
  typeGrid: 'mt-3 grid grid-cols-1 gap-3 md:grid-cols-3',
  typeOption:
    'relative flex min-h-[5.5rem] cursor-pointer flex-col justify-center rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-left transition hover:border-teal-200 hover:bg-teal-50/40 focus-within:ring-2 focus-within:ring-teal-500/30 md:min-h-[7rem] md:px-4 md:py-5',
  typeOptionActive:
    'border-teal-500 bg-gradient-to-br from-teal-50 to-white shadow-sm shadow-teal-500/10 ring-1 ring-teal-500/20',
  typeOptionTitle: 'text-base font-bold text-slate-900',
  typeOptionDesc: 'mt-1.5 text-sm leading-relaxed text-slate-500',
  charRow: 'mt-2 flex items-center justify-between gap-3',
  charCount: 'text-xs text-slate-500',
  charBar: 'h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100',
  charBarFill: 'h-full rounded-full bg-teal-500 transition-all duration-200',
  uploadZone:
    'mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center transition hover:border-teal-300 hover:bg-teal-50/30',
  uploadZoneActive: 'border-teal-400 bg-teal-50/40',
  uploadIcon:
    'flex h-11 w-11 items-center justify-center rounded-full bg-white text-teal-600 shadow-sm ring-1 ring-slate-200',
  uploadTitle: 'mt-3 text-sm font-semibold text-slate-800',
  uploadHint: 'mt-1 text-xs text-slate-500',
  imagePreviewCard:
    'mt-3 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3',
  imagePreview:
    'h-20 w-20 shrink-0 rounded-lg border border-slate-200 bg-white object-cover shadow-sm',
  imagePreviewMeta: 'text-xs leading-relaxed text-slate-500',
  btnRemoveImage:
    'mt-2 text-xs font-semibold text-rose-700 transition hover:text-rose-900',
  btnPrimary:
    'inline-flex min-h-[2.75rem] min-w-[12rem] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-6 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  alert:
    'flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800',
  toast:
    'pointer-events-auto fixed right-4 top-20 z-30 flex max-w-sm items-start gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 shadow-lg shadow-emerald-900/10',
  listHeader: 'flex flex-wrap items-end justify-between gap-3',
  listCount: 'text-xs font-semibold uppercase tracking-wide text-slate-500',
  reportCard:
    'rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-5',
  reportCardTop: 'flex flex-wrap items-start justify-between gap-3',
  reportMeta: 'text-xs text-slate-500',
  reportDescription: 'mt-3 text-sm leading-relaxed text-slate-800',
  reportAttachment: 'mt-3 flex flex-wrap items-center gap-3',
  badgeType:
    'inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-slate-700',
  badgePending:
    'inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase text-amber-900',
  badgeProgress:
    'inline-flex rounded-full bg-sky-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase text-sky-900',
  badgeDone:
    'inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase text-emerald-900',
  responseBox:
    'mt-3 rounded-xl border border-teal-100 bg-teal-50/50 px-3.5 py-3 text-sm leading-relaxed text-slate-700',
  responseLabel:
    'mb-1 text-[0.65rem] font-bold uppercase tracking-wide text-teal-800',
  linkBtn:
    'inline-flex items-center gap-1 text-xs font-semibold text-teal-700 transition hover:text-teal-900',
  empty:
    'flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center',
  emptyIcon:
    'flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200',
  emptyTitle: 'mt-3 text-sm font-semibold text-slate-700',
  emptyDesc: 'mt-1 text-sm text-slate-500',
  reportList: 'mt-4 space-y-3',
  skeleton: 'animate-pulse rounded-xl border border-slate-200 bg-slate-100 h-28',
  pagination: 'mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600',
  paginationBtn:
    'inline-flex min-h-[2.25rem] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm',
};

export function statusBadgeClass(status) {
  if (status === 'in_progress') return reporting.badgeProgress;
  if (status === 'completed') return reporting.badgeDone;
  return reporting.badgePending;
}

export function statusLabel(status) {
  if (status === 'in_progress') return 'In progress';
  if (status === 'completed') return 'Completed';
  return 'Pending';
}

export function issueTypeLabel(type) {
  return ISSUE_TYPE_LABELS[type] || type;
}

const ISSUE_TYPE_LABELS = {
  enquiry: 'Enquiry',
  issue: 'Issue',
  improvement: 'Improvement',
};

export const ISSUE_TYPE_CARDS = [
  {
    value: 'enquiry',
    title: 'Enquiry',
    description: 'Ask a question or request information.',
  },
  {
    value: 'issue',
    title: 'Issue',
    description: 'Report something broken or not working.',
  },
  {
    value: 'improvement',
    title: 'Improvement',
    description: 'Suggest a feature or workflow enhancement.',
  },
];
