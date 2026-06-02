export const EU_DOCTOR_DISPOSITIONS = [
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'booking_room', label: 'Booking Room' },
];

export function emptyEmergencyDoctorForm() {
  return { diagnosis: '', notes: '', disposition: '' };
}

export function isDiagnosisComplete(form) {
  return Boolean(form.diagnosis?.trim());
}

export function validateDiagnosisField(form) {
  if (!form.diagnosis?.trim()) return { diagnosis: 'Diagnosis / assessment is required.' };
  return {};
}

export function validatePharmacyDisposition(form, prescriptionLines) {
  const errors = { ...validateDiagnosisField(form) };
  if (!prescriptionLines.length) {
    errors.prescription = 'Add at least one medication to route to pharmacy.';
  }
  return errors;
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
