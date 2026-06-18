import { validateRefusalDischargeReason } from '../../utils/dischargeDocumentation';

export const CLINIC_DISPOSITIONS = [
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'follow_up', label: 'Follow-up appointment' },
  { value: 'booking_room', label: 'Booking Room' },
  { value: 'emergency_unit', label: 'Emergency Unit' },
];

export function emptyClinicDoctorForm() {
  return {
    icd10Code: '',
    icd10Description: '',
    notes: '',
    disposition: '',
    follow_up_date: '',
    discharge_reason: '',
  };
}

export function isDiagnosisComplete(form) {
  return Boolean(form.icd10Code?.trim() && form.icd10Description?.trim());
}

export function validateDiagnosisField(form) {
  if (!form.icd10Code?.trim()) {
    return { icd10Code: 'Select an ICD-10 code before disposition.' };
  }
  if (!form.icd10Description?.trim()) {
    return { icd10Code: 'Choose a valid ICD-10 code from the catalog.' };
  }
  return {};
}

export function validateFollowUpForm(form) {
  const errors = { ...validateDiagnosisField(form) };
  if (!form.follow_up_date) errors.follow_up_date = 'Select a follow-up date.';
  return errors;
}

export function validatePharmacyDisposition(form, prescriptionLines) {
  const errors = { ...validateDiagnosisField(form) };
  if (!prescriptionLines.length) {
    errors.prescription = 'Add at least one medication to route to pharmacy.';
  }
  return errors;
}

export function validateDischargeDisposition(form) {
  return validateRefusalDischargeReason(form.discharge_reason);
}

export function dispositionButtonLabel(form, loading, hasPrescription = false) {
  if (loading) return 'Submitting…';
  if (form.disposition === 'pharmacy') return 'Submit & route to Pharmacy';
  if (form.disposition === 'follow_up') {
    return hasPrescription
      ? 'Prescribe, schedule follow-up & complete'
      : 'Schedule follow-up & complete';
  }
  if (form.disposition === 'booking_room') {
    return hasPrescription
      ? 'Prescribe & transfer to Booking Room'
      : 'Transfer to Booking Room';
  }
  if (form.disposition === 'emergency_unit') return 'Transfer to Emergency Unit';
  return 'Complete disposition';
}

export function dispositionRequiresPrescription(disposition) {
  return disposition === 'pharmacy';
}

export function dispositionShowsPrescription(disposition) {
  return ['pharmacy', 'follow_up', 'booking_room'].includes(disposition);
}

export function dispositionRequiresFollowUpDate(disposition) {
  return disposition === 'follow_up';
}

export function pathTypeLabel(pathType) {
  if (pathType === 'follow_up') return 'Follow-up visit — Parameter Nurse handover';
  if (pathType === 'sick') return 'Sick visit — Parameter & Screening Nurse handover';
  return 'Clinical handover';
}
