import { ADMIT_TRANSPORT_CHECKLIST_OPTIONS } from '../../constants/admitTransportChecklist';

const REQUIRED_TRANSPORT_CHECKLIST_IDS = ['id_band', 'mobility_match', 'rails_bed'];

const SC_DAILY_TEXT_FIELDS = [
  ['capnography_etco2', 'Capnography (EtCO₂)'],
  ['fio2', 'Fraction of inspired oxygen (FiO₂)'],
  ['anesthesia_neuro_monitoring', 'Depth of anesthesia / neurological monitoring'],
  ['neuromuscular_tof', 'Neuromuscular transmission (TOF)'],
  ['pain_sedation_scores', 'Pain and sedation scores'],
];

export const TRANSFER_WARD_OPTIONS = [
  { value: 'general', label: 'General ward' },
  { value: 'icu', label: 'ICU' },
  { value: 'specialized_inpatient', label: 'Specialized inpatient' },
  { value: 'outpatient_specialist', label: 'Outpatient specialist' },
];

function parseRequiredNumber(value, { min, max, label }) {
  if (value === null || value === undefined || value === '') {
    return { error: `${label} is required` };
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return { error: `${label} must be a valid number` };
  }
  if (min != null && n < min) {
    return { error: `${label} must be at least ${min}` };
  }
  if (max != null && n > max) {
    return { error: `${label} must be at most ${max}` };
  }
  return { value: n };
}

function checklistSelection(checklist = {}) {
  return ADMIT_TRANSPORT_CHECKLIST_OPTIONS.filter((opt) => checklist[opt.id]).map((opt) => opt.id);
}

/** @returns {Record<string, string>} */
function validateSurgicalComplexBasicVitals(vitals = {}) {
  const errors = {};

  const hr = parseRequiredNumber(vitals.heart_rate, { min: 20, max: 300, label: 'Heart rate' });
  if (hr.error) errors.heart_rate = hr.error;

  const spo2 = parseRequiredNumber(vitals.oxygen_saturation, { min: 0, max: 100, label: 'Oxygen saturation' });
  if (spo2.error) errors.oxygen_saturation = spo2.error;

  const rr = parseRequiredNumber(vitals.respiration_rate, { min: 4, max: 80, label: 'Respiration rate' });
  if (rr.error) errors.respiration_rate = rr.error;

  const temp = parseRequiredNumber(vitals.body_temperature, { min: 30, max: 45, label: 'Body temperature' });
  if (temp.error) errors.body_temperature = temp.error;

  const sys = parseRequiredNumber(vitals.blood_pressure_systolic, {
    min: 50,
    max: 300,
    label: 'Blood pressure (systolic)',
  });
  if (sys.error) errors.blood_pressure_systolic = sys.error;

  const dia = parseRequiredNumber(vitals.blood_pressure_diastolic, {
    min: 30,
    max: 200,
    label: 'Blood pressure (diastolic)',
  });
  if (dia.error) errors.blood_pressure_diastolic = dia.error;

  if (!sys.error && !dia.error && sys.value <= dia.value) {
    errors.blood_pressure_systolic = 'Systolic must be higher than diastolic';
  }

  return errors;
}

/** Pre-operative ward arrival — basic vitals only (no theatre monitoring). */
export function validateSurgicalComplexArrivalRecord(vitals = {}) {
  return validateSurgicalComplexBasicVitals(vitals);
}

/** @returns {Record<string, string>} */
export function validateSurgicalComplexDailyRecord(vitals = {}) {
  const errors = validateSurgicalComplexBasicVitals(vitals);

  const pulseOx = parseRequiredNumber(vitals.pulse_oximetry_spo2, {
    min: 0,
    max: 100,
    label: 'Pulse oximetry (SpO₂)',
  });
  if (pulseOx.error) errors.pulse_oximetry_spo2 = pulseOx.error;

  for (const [field, label] of SC_DAILY_TEXT_FIELDS) {
    if (!String(vitals[field] ?? '').trim()) {
      errors[field] = `${label} is required`;
    }
  }

  return errors;
}

/** @returns {Record<string, string>} */
export function validateSurgicalComplexPorterTransport({
  equipmentRequired,
  equipmentNotes,
  criticalNotes,
  checklist,
}) {
  const errors = {};

  if (equipmentRequired === 'other' && !String(equipmentNotes ?? '').trim()) {
    errors.equipment_notes = 'Equipment notes are required when mode is Other';
  }

  if (!String(criticalNotes ?? '').trim()) {
    errors.critical_notes = 'Critical notes for the porter are required';
  }

  const checked = checklistSelection(checklist);
  for (const id of REQUIRED_TRANSPORT_CHECKLIST_IDS) {
    if (!checked.includes(id)) {
      const label = ADMIT_TRANSPORT_CHECKLIST_OPTIONS.find((o) => o.id === id)?.label || id;
      errors.equipment_checklist = `Required: ${label}`;
      break;
    }
  }

  return errors;
}

/** @returns {Record<string, string>} */
export function validateSurgicalComplexMortuaryTransfer({
  causeOfDeath,
  equipmentRequired,
  equipmentNotes,
  criticalNotes,
  checklist,
}) {
  const errors = validateSurgicalComplexPorterTransport({
    equipmentRequired,
    equipmentNotes,
    criticalNotes,
    checklist,
  });

  if (!String(causeOfDeath ?? '').trim()) {
    errors.cause_of_death = 'Cause of death is required';
  }

  return errors;
}

export function firstValidationMessage(errors) {
  const values = Object.values(errors || {});
  return values[0] || 'Please correct the highlighted fields.';
}
