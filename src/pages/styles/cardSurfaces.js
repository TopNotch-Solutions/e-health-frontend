/** Shared green card surface — used across clinical, front office, admin, and supervisor modules. */
export const greenCard =
  'rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-600 via-teal-600 to-teal-700 text-white shadow-md shadow-emerald-900/20';

export const greenCardLg = `${greenCard} rounded-2xl`;

/** Typography and labels for content on green card backgrounds. */
export const greenOn = {
  title: 'text-base font-bold text-white',
  titleSm: 'text-sm font-bold text-white',
  desc: 'mt-0.5 text-sm text-emerald-100',
  body: 'text-sm text-emerald-50',
  label: 'block text-sm font-medium text-emerald-100',
  fieldLabel: 'text-emerald-100/90',
  fieldValue: 'font-medium text-white',
  hint: 'text-sm text-emerald-100/80',
  muted: 'text-sm text-emerald-100',
  link: 'font-semibold text-white underline decoration-white/40 hover:decoration-white',
  summary: 'space-y-2 text-sm text-emerald-50',
};

/** Table chrome for green card containers. */
export const greenTable = {
  wrap: `${greenCard} overflow-x-auto`,
  table: 'min-w-full divide-y divide-white/10 text-sm',
  th: 'bg-white/10 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-emerald-100',
  td: 'px-4 py-3 text-white',
  tdMuted: 'px-4 py-3 text-sm text-emerald-100',
  rowInactive: 'bg-black/10 text-emerald-100/70',
};

/** Nested table inside a green panel (slightly inset). */
export const greenTableNested = {
  wrap: 'overflow-x-auto rounded-xl border-0 bg-white/10 shadow-none',
};
