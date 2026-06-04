import { submitButtonClass } from '../nurse/utils/submitButtonClasses';

export const INJECTION_SITE_OPTIONS = [
  { value: 'gluteal', label: 'Gluteal (preferred)' },
  { value: 'deltoid', label: 'Deltoid' },
  { value: 'ventrogluteal', label: 'Ventrogluteal' },
];

export const DEFAULT_MEDICATION = 'Cabotegravir 600 mg IM (long-acting PrEP)';

export function injectionButtonClass() {
  return submitButtonClass('primary');
}

export function finalizeButtonClass() {
  return submitButtonClass('lab');
}

export function injectionButtonLabel(loading) {
  if (loading) return 'Saving…';
  return 'Confirm injection · log administration';
}

export function finalizeButtonLabel(loading) {
  if (loading) return 'Finalizing…';
  return 'Finalize session · save to patient record';
}
