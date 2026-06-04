import { ageFromDob } from '../nurse/nurseQueueUtils';
import { submitButtonClass as baseSubmitButtonClass } from '../nurse/utils/submitButtonClasses';

export const MAX_PEDIATRIC_AGE = 12;

export function pediatricEligibility(patient) {
  const age = ageFromDob(patient?.date_of_birth);
  if (age == null) {
    return {
      eligible: false,
      age: null,
      message: 'Patient date of birth is required. Pediatric Corner only accepts children under 12 years.',
    };
  }
  if (age >= MAX_PEDIATRIC_AGE) {
    return {
      eligible: false,
      age,
      message: `This patient is ${age} years old. Pediatric Corner is only for patients under ${MAX_PEDIATRIC_AGE} years.`,
    };
  }
  return { eligible: true, age, message: null };
}

export function emptyAssessmentForm(assessment) {
  return {
    temperature: assessment?.temperature != null ? String(assessment.temperature) : '',
    weight: assessment?.weight != null ? String(assessment.weight) : '',
    general_assessment: assessment?.general_assessment || '',
  };
}

export function validateAssessmentForm(form) {
  const errors = {};
  const temp = form.temperature?.trim();
  if (!temp || Number.isNaN(Number(temp))) {
    errors.temperature = 'Required';
  }
  const weight = form.weight?.trim();
  if (!weight || Number.isNaN(Number(weight))) {
    errors.weight = 'Required';
  }
  if (!form.general_assessment?.trim()) {
    errors.general_assessment = 'Required';
  }
  return errors;
}

export function buildPayload(form, visitId, queueEntryId) {
  return {
    visit_id: visitId,
    queue_entry_id: queueEntryId,
    temperature: Number(form.temperature),
    weight: Number(form.weight),
    general_assessment: form.general_assessment.trim(),
  };
}

export function submitButtonClass() {
  return baseSubmitButtonClass('primary');
}

export function submitButtonLabel(loading) {
  return loading ? 'Saving…' : 'Save & send to Master Doctor';
}
