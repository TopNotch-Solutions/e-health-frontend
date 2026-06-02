import { submitButtonClass } from '../nurse/utils/submitButtonClasses';

export function confirmButtonClass(form) {
  return submitButtonClass(form.result === 'positive' ? 'lab' : 'primary');
}

export function confirmButtonLabel(form, loading) {
  if (loading) return 'Submitting…';
  if (form.result === 'positive') return 'Confirm positive · route to ART';
  if (form.result === 'negative') return 'Confirm negative · end session';
  return 'Confirm result';
}
