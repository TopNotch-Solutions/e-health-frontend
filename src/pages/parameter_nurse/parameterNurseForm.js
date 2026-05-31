export const PARAMETER_NURSE_CLASSIFICATIONS = {
  follow_up: {
    label: 'Follow-Up',
    destinations: [
      { value: 'master_doctor', label: 'Master Doctor' },
      { value: 'pharmacy', label: 'Pharmacy' },
    ],
  },
  sick: {
    label: 'Sick',
    destinations: [
      { value: 'screening_nurse', label: 'Screening Nurse' },
      { value: 'emergency_unit', label: 'Emergency Unit' },
    ],
  },
};

export function emptyParameterForm() {
  return {
    visit_classification: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    pulse_rate: '',
    temperature: '',
    oxygen_saturation: '',
    routing_destination: '',
  };
}

function parseNum(value) {
  if (value === '' || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function validateParameterForm(form) {
  const errors = {};

  if (!form.visit_classification) {
    errors.visit_classification = 'Select visit type (Follow-Up or Sick).';
  }
  if (!form.routing_destination) {
    errors.routing_destination = 'Select a routing destination.';
  } else if (form.visit_classification) {
    const allowed = PARAMETER_NURSE_CLASSIFICATIONS[form.visit_classification]?.destinations || [];
    if (!allowed.some((d) => d.value === form.routing_destination)) {
      errors.routing_destination = 'Destination not allowed for this visit type.';
    }
  }

  if (form.visit_classification === 'follow_up') {
    if (!form.blood_pressure_systolic) errors.blood_pressure_systolic = 'Required';
    if (!form.blood_pressure_diastolic) errors.blood_pressure_diastolic = 'Required';
    if (!form.pulse_rate) errors.pulse_rate = 'Required';
  }

  if (form.visit_classification === 'sick') {
    if (!form.temperature) errors.temperature = 'Required';
    if (!form.blood_pressure_systolic) errors.blood_pressure_systolic = 'Required';
    if (!form.blood_pressure_diastolic) errors.blood_pressure_diastolic = 'Required';
    if (!form.oxygen_saturation) errors.oxygen_saturation = 'Required';
  }

  return errors;
}

export function buildParameterPayload(form, { visitId, queueEntryId }) {
  const payload = {
    visit_id: visitId,
    queue_entry_id: queueEntryId,
    visit_classification: form.visit_classification,
    next_department: form.routing_destination,
  };

  if (form.visit_classification === 'follow_up') {
    payload.blood_pressure_systolic = parseNum(form.blood_pressure_systolic);
    payload.blood_pressure_diastolic = parseNum(form.blood_pressure_diastolic);
    payload.pulse_rate = parseNum(form.pulse_rate);
  }

  if (form.visit_classification === 'sick') {
    payload.temperature = parseNum(form.temperature);
    payload.blood_pressure_systolic = parseNum(form.blood_pressure_systolic);
    payload.blood_pressure_diastolic = parseNum(form.blood_pressure_diastolic);
    payload.oxygen_saturation = parseNum(form.oxygen_saturation);
  }

  return payload;
}

export function isParameterFormComplete(form) {
  if (!form.visit_classification || !form.routing_destination) return false;
  return Object.keys(validateParameterForm(form)).length === 0;
}

export function routingButtonLabel(form, loading) {
  if (loading) return 'Submitting…';
  if (!form.routing_destination) return 'Submit & route patient';
  const dest = PARAMETER_NURSE_CLASSIFICATIONS[form.visit_classification]?.destinations
    .find((d) => d.value === form.routing_destination);
  return dest ? `Submit & route to ${dest.label}` : 'Submit & route patient';
}
