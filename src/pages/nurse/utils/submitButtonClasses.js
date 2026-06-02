/** Full-width primary action buttons (screening route, HIV confirm, ART milestones). */
const STRUCTURE =
  'w-full rounded-lg py-3 text-sm font-semibold text-white shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const COLORS = {
  primary: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500',
  lab: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
  emergency: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
  amber: 'bg-amber-700 hover:bg-amber-800 focus:ring-amber-500',
};

export function submitButtonClass(variant = 'primary') {
  return `${STRUCTURE} ${COLORS[variant] || COLORS.primary}`;
}
