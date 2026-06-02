import { submitButtonClass } from '../nurse/utils/submitButtonClasses';

export const FINAL_DISPOSITIONS = [
  { value: 'state_hospital', label: 'Transfer to State Hospital', variant: 'primary' },
  { value: 'mortuary', label: 'Process to Mortuary', variant: 'emergency' },
];

export function emptyBookingForm() {
  return {
    disposition: '',
    destination_facility_id: '',
    reason: '',
    notes: '',
    cause_of_death: '',
    date_of_death: '',
  };
}

export function dispositionButtonClass(disposition) {
  const opt = FINAL_DISPOSITIONS.find((d) => d.value === disposition);
  return submitButtonClass(opt?.variant || 'primary');
}

export function dispositionButtonLabel(form, loading) {
  if (loading) return 'Submitting…';
  if (form.disposition === 'state_hospital') return 'Confirm transfer to State Hospital';
  if (form.disposition === 'mortuary') return 'Confirm process to Mortuary';
  return 'Complete disposition';
}
