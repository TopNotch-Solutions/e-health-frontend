export const IMMUNIZATION_OPTIONS = ['Up to date', 'Partial / unknown', 'Declined'];

export function emptyIntakeForm() {
  return {
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    pulse_rate: '',
    temperature: '',
    weight: '',
    respiratory_rate: '',
    chief_complaint: '',
    onset_date: '',
    onset_time: '',
    aggravating_factors: '',
    alleviating_factors: '',
    current_medications: '',
    immunization_status: 'Up to date',
    social_history: '',
    physical_examination: '',
  };
}

function numOrNull(value) {
  if (value === '' || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function strOrNull(value) {
  const s = typeof value === 'string' ? value.trim() : value;
  return s ? s : null;
}

function buildOnsetAt(form) {
  if (!form.onset_date) return null;
  const time = form.onset_time || '00:00';
  const d = new Date(`${form.onset_date}T${time}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const REQUIRED_FIELDS = [
  { key: 'blood_pressure_systolic', label: 'Systolic blood pressure' },
  { key: 'blood_pressure_diastolic', label: 'Diastolic blood pressure' },
  { key: 'pulse_rate', label: 'Heart rate' },
  { key: 'temperature', label: 'Temperature' },
  { key: 'weight', label: 'Weight' },
  { key: 'respiratory_rate', label: 'Respiratory rate' },
  { key: 'chief_complaint', label: 'Chief complaint' },
  { key: 'onset_date', label: 'Onset date' },
  { key: 'onset_time', label: 'Onset time' },
  { key: 'aggravating_factors', label: 'Aggravating factors' },
  { key: 'alleviating_factors', label: 'Alleviating factors' },
  { key: 'current_medications', label: 'Current medications' },
  { key: 'immunization_status', label: 'Immunization status' },
  { key: 'social_history', label: 'Social history' },
  { key: 'physical_examination', label: 'Physical examination' },
];

const NUMERIC_FIELDS = new Set([
  'blood_pressure_systolic',
  'blood_pressure_diastolic',
  'pulse_rate',
  'temperature',
  'weight',
  'respiratory_rate',
]);

function isFilled(value) {
  return typeof value === 'string' && value.trim() !== '';
}

/** Returns { [fieldKey]: message } for empty or invalid values. */
export function validateIntakeForm(form) {
  const errors = {};

  for (const { key, label } of REQUIRED_FIELDS) {
    if (!isFilled(form[key])) {
      errors[key] = `${label} is required`;
    }
  }

  for (const key of NUMERIC_FIELDS) {
    if (errors[key]) continue;
    const n = Number(form[key]);
    if (!Number.isFinite(n)) {
      const label = REQUIRED_FIELDS.find((f) => f.key === key)?.label || key;
      errors[key] = `${label} must be a valid number`;
    }
  }

  return errors;
}

/** Map intake form state to API body for push-to-doctor. */
export function buildIntakePayload(form, { visitId, queueEntryId }) {
  return {
    visit_id: visitId,
    queue_entry_id: queueEntryId,
    temperature: numOrNull(form.temperature),
    blood_pressure_systolic: numOrNull(form.blood_pressure_systolic),
    blood_pressure_diastolic: numOrNull(form.blood_pressure_diastolic),
    pulse_rate: numOrNull(form.pulse_rate),
    respiratory_rate: numOrNull(form.respiratory_rate),
    weight: numOrNull(form.weight),
    chief_complaint: strOrNull(form.chief_complaint),
    onset_at: buildOnsetAt(form),
    aggravating_factors: strOrNull(form.aggravating_factors),
    alleviating_factors: strOrNull(form.alleviating_factors),
    current_medications: strOrNull(form.current_medications),
    immunization_status: strOrNull(form.immunization_status),
    social_history: strOrNull(form.social_history),
    physical_examination: strOrNull(form.physical_examination),
  };
}
