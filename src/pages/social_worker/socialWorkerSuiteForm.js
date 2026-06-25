import { submitButtonClass as baseSubmitButtonClass } from '../nurse/utils/submitButtonClasses';

export function emptyAssessmentForm(assessment) {
  return {
    social_assessment_details: assessment?.social_assessment_details || '',
    case_history: assessment?.case_history || '',
    clinical_notes: assessment?.clinical_notes || '',
    isSevere: assessment?.severity === 'severe',
    destination_department: '',
    equipment_required: 'stretcher',
    critical_notes: '',
    external_porter_notes: '',
    internal_porter_notes: '',
  };
}

export function severityForApi(form) {
  return form.isSevere ? 'severe' : 'routine';
}

export function validateAssessmentForm(form) {
  const errors = {};
  if (!form.social_assessment_details?.trim()) errors.social_assessment_details = 'Required';
  if (!form.case_history?.trim()) errors.case_history = 'Required';
  if (!form.clinical_notes?.trim()) errors.clinical_notes = 'Required';
  return errors;
}

export function isAssessmentFormComplete(form) {
  return Object.keys(validateAssessmentForm(form)).length === 0;
}

export function submitButtonClass(isSevere) {
  return baseSubmitButtonClass(isSevere ? 'emergency' : 'primary');
}

export function submitButtonLabel(loading, isSevere) {
  if (loading) return 'Saving…';
  if (isSevere) return 'Save & escalate to Booking Room';
  return 'Save assessment';
}
