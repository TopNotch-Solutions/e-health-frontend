import { validateRefusalDischargeReason } from '../../utils/dischargeDocumentation';

export const EU_DOCTOR_DISPOSITIONS = [
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'booking_room', label: 'Booking Room' },
];

export function emptyEmergencyDoctorForm() {
  return {
    icd10Code: '',
    icd10Description: '',
    notes: '',
    disposition: '',
    discharge_reason: '',
    destination_department: '',
    equipment_required: 'stretcher',
    critical_notes: '',
    external_porter_notes: '',
    internal_porter_notes: '',
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
  if (form.disposition === 'booking_room') {
    return hasPrescription
      ? 'Prescribe & transfer to Booking Room'
      : 'Transfer to Booking Room';
  }
  return 'Complete disposition';
}

export function dispositionShowsPrescription(disposition) {
  return disposition === 'pharmacy' || disposition === 'booking_room';
}

export function dispositionRequiresPrescription(disposition) {
  return disposition === 'pharmacy';
}
