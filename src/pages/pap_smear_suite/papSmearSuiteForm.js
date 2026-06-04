import { submitButtonClass as baseSubmitButtonClass } from '../nurse/utils/submitButtonClasses';

export function emptyScreeningForm(screening) {
  return {
    screening_details: screening?.screening_details || '',
    test_observations: screening?.test_observations || '',
    clinical_findings: screening?.clinical_findings || '',
    isSevere: screening?.severity === 'severe',
  };
}

export function severityForApi(form) {
  return form.isSevere ? 'severe' : 'routine';
}

export function validateScreeningForm(form) {
  const errors = {};
  if (!form.screening_details?.trim()) errors.screening_details = 'Required';
  if (!form.test_observations?.trim()) errors.test_observations = 'Required';
  if (!form.clinical_findings?.trim()) errors.clinical_findings = 'Required';
  return errors;
}

export function isScreeningFormComplete(form) {
  return Object.keys(validateScreeningForm(form)).length === 0;
}

export function submitButtonClass(isSevere) {
  return baseSubmitButtonClass(isSevere ? 'emergency' : 'primary');
}

export function submitButtonLabel(loading, isSevere) {
  if (loading) return 'Saving…';
  if (isSevere) return 'Save & escalate to Master Doctor';
  return 'Save screening';
}
