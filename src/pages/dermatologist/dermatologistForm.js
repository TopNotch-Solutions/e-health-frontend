import { submitButtonClass } from '../nurse/utils/submitButtonClasses';

export const DERMATOLOGIST_DISPOSITIONS = [
  { value: 'complete_session', label: 'Save & complete session', variant: 'primary' },
  { value: 'pharmacy', label: 'Pharmacy', variant: 'primary' },
  { value: 'booking_room', label: 'Booking Room', variant: 'amber' },
];

export function emptyObservationForm(assessment) {
  return {
    clinical_observations: assessment?.clinical_observations || '',
    skin_assessment: assessment?.skin_assessment || '',
    differential_diagnosis: assessment?.differential_diagnosis || '',
    treatment_plan: assessment?.treatment_plan || '',
    disposition: '',
  };
}

export function validateObservationForm(form) {
  const errors = {};
  if (!form.clinical_observations?.trim()) errors.clinical_observations = 'Required';
  if (!form.skin_assessment?.trim()) errors.skin_assessment = 'Required';
  return errors;
}

export function isObservationFormComplete(form) {
  return Object.keys(validateObservationForm(form)).length === 0;
}

export function validateDisposition(form, prescriptionLines) {
  const errors = { ...validateObservationForm(form) };
  if (!form.disposition) {
    errors.disposition = 'Select what to do next.';
    return errors;
  }
  if (form.disposition === 'pharmacy' && !prescriptionLines.length) {
    errors.prescription = 'Add at least one medication to save the prescription.';
  }
  return errors;
}

export function dispositionButtonLabel(form, loading, hasPrescription, allOutOfStock = false) {
  if (loading) return 'Submitting…';
  if (form.disposition === 'complete_session') return 'Save & complete session';
  if (form.disposition === 'pharmacy') {
    return allOutOfStock
      ? 'Save prescription (pharmacy skipped)'
      : 'Prescribe & route to Pharmacy';
  }
  if (form.disposition === 'booking_room') {
    return hasPrescription
      ? 'Save & route to Booking Room (with prescription)'
      : 'Save & route to Booking Room';
  }
  return 'Complete action';
}

export function dispositionButtonClass(form) {
  const opt = DERMATOLOGIST_DISPOSITIONS.find((d) => d.value === form.disposition);
  return submitButtonClass(opt?.variant || 'primary');
}

export function dispositionShowsPrescription(disposition) {
  return disposition === 'pharmacy';
}
