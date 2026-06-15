import { submitButtonClass } from '../nurse/utils/submitButtonClasses';

export const EMERGENCY_VISIT_CLASSIFICATION = 'sick';

export const NURSE_ROUTING_DESTINATIONS = [
  { value: 'pharmacy', label: 'Pharmacist', buttonClass: 'pharmacy' },
  { value: 'emergency_unit_doctor', label: 'Emergency Unit Doctor', buttonClass: 'primary' },
];

export function emptyEmergencyNurseForm() {
  return {
    visit_classification: EMERGENCY_VISIT_CLASSIFICATION,
    temperature: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    oxygen_saturation: '',
    symptoms: '',
    reason: '',
    diagnosis: '',
    interventions: '',
    notes: '',
    routing_destination: '',
  };
}

function parseNum(value) {
  if (value === '' || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function validateVitals(form) {
  const errors = {};
  if (!form.temperature) errors.temperature = 'Required';
  if (!form.blood_pressure_systolic) errors.blood_pressure_systolic = 'Required';
  if (!form.blood_pressure_diastolic) errors.blood_pressure_diastolic = 'Required';
  if (!form.oxygen_saturation) errors.oxygen_saturation = 'Required';
  return errors;
}

function validateScreening(form) {
  const errors = {};
  if (!form.symptoms?.trim()) errors.symptoms = 'Required';
  if (!form.reason?.trim()) errors.reason = 'Required';
  if (!form.diagnosis?.trim()) errors.diagnosis = 'Required';
  return errors;
}

export function validateEmergencyNurseForm(form, hasPrescription) {
  const errors = {
    ...validateVitals(form),
    ...validateScreening(form),
  };

  if (!form.interventions?.trim()) errors.interventions = 'Clinical interventions are required.';
  if (!form.routing_destination) {
    errors.routing_destination = 'Select a routing destination.';
  } else if (form.routing_destination === 'pharmacy' && !hasPrescription) {
    errors.prescription = 'Add at least one medication to route to the pharmacist.';
  }

  return errors;
}

export function buildEmergencyNursePayload(form, { visitId, queueEntryId, items }) {
  const payload = {
    visit_id: visitId,
    queue_entry_id: queueEntryId,
    next_department: form.routing_destination,
    visit_classification: EMERGENCY_VISIT_CLASSIFICATION,
    symptoms: form.symptoms.trim(),
    reason: form.reason.trim(),
    diagnosis: form.diagnosis.trim(),
    interventions: form.interventions.trim(),
    notes: form.notes.trim() || null,
    items,
    temperature: parseNum(form.temperature),
    blood_pressure_systolic: parseNum(form.blood_pressure_systolic),
    blood_pressure_diastolic: parseNum(form.blood_pressure_diastolic),
    oxygen_saturation: parseNum(form.oxygen_saturation),
  };

  return payload;
}

export function routeButtonClass(form) {
  const dest = NURSE_ROUTING_DESTINATIONS.find((d) => d.value === form.routing_destination);
  const variant = dest?.buttonClass === 'pharmacy' ? 'primary' : dest?.buttonClass === 'primary' ? 'primary' : 'lab';
  return submitButtonClass(variant === 'lab' ? 'lab' : 'primary');
}

export function routeButtonLabel(form, loading, hasPrescription) {
  if (loading) return 'Submitting…';
  if (form.routing_destination === 'pharmacy') {
    return hasPrescription ? 'Prescribe & route to Pharmacist' : 'Add medications to route to Pharmacist';
  }
  if (form.routing_destination === 'emergency_unit_doctor') {
    return 'Transfer to Emergency Unit Doctor';
  }
  return 'Submit & route patient';
}
