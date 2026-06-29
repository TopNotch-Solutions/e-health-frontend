export const INPATIENT_WARD_TYPES = [
  { value: 'icu', label: 'ICU' },
  { value: 'specialized_inpatient', label: 'Specialized inpatient' },
  { value: 'surgical_complex', label: 'Surgical complex' },
  { value: 'outpatient_specialist', label: 'Outpatient specialist' },
];

export const DEFAULT_ADMIT_WARD_TYPES = ['icu', 'specialized_inpatient', 'surgical_complex'];

export const CLINICAL_WORKSPACE_DEPARTMENTS = [
  'pediatric_outpatient',
  'ent_outpatient',
  'hospital_emergency_unit',
  'orthopedic_outpatient',
  'adult_outpatient',
  'physiotherapy_rehabilitation',
  'big_room_specialist',
  'urology_outpatient',
  'mental_health_outpatient',
];

const DEPARTMENT_CONFIG = {
  pediatric_outpatient: {
    vitalsTitle: 'Pediatric outpatient vitals',
    vitalsHint: 'Record temperature and pulse — they are saved when you admit to a ward or discharge.',
    vitalsRequiredMessage: 'Enter temperature and pulse',
    criticalHint:
      'Mark if the child needs urgent ICU care. ICU admission is recommended when beds are available.',
    sessionTitle: 'Active pediatric outpatient session',
    sessionMessage:
      'Review the referring consultation, capture vitals, then route to a ward or discharge.',
    idleText:
      'Select a referred patient from the queue. The referring clinic consultation will be shown, then record temperature and pulse before admitting to ICU, specialized inpatient, or surgical complex — or discharge the patient to complete the visit.',
    dischargeConfirmText: (name) =>
      `Complete the pediatric outpatient consultation and discharge ${name}?`,
    fields: [
      {
        key: 'temperature',
        label: 'Temperature (°C)',
        inputMode: 'decimal',
        placeholder: 'e.g. 37.2',
      },
      {
        key: 'pulse_rate',
        label: 'Pulse (bpm)',
        inputMode: 'numeric',
        placeholder: 'e.g. 88',
      },
    ],
  },
  ent_outpatient: {
    vitalsTitle: 'ENT vitals',
    vitalsHint: 'Record oxygen saturation and heart rate — they are saved when you admit to a ward or discharge.',
    vitalsRequiredMessage: 'Enter oxygen saturation and heart rate',
    criticalHint:
      'Mark if the patient needs urgent ICU care. ICU admission is recommended when beds are available.',
    sessionTitle: 'Active ENT session',
    sessionMessage:
      'Review the referring consultation, capture vitals, then route to a ward or discharge.',
    idleText:
      'Select a referred patient from the queue. The referring clinic consultation will be shown, then record oxygen saturation and heart rate before admitting to ICU, specialized inpatient, or surgical complex — or discharge the patient to complete the visit.',
    dischargeConfirmText: (name) =>
      `Complete the ENT consultation and discharge ${name}?`,
    fields: [
      {
        key: 'oxygen_saturation',
        label: 'Oxygen saturation (%)',
        inputMode: 'decimal',
        placeholder: 'e.g. 98',
      },
      {
        key: 'pulse_rate',
        label: 'Heart rate (bpm)',
        inputMode: 'numeric',
        placeholder: 'e.g. 72',
      },
    ],
  },
  hospital_emergency_unit: {
    vitalsTitle: 'Emergency unit vitals',
    vitalsHint:
      'Record blood pressure, respiratory rate, GCS, oxygen saturation, and heart rate — they are saved when you admit to a ward or discharge.',
    vitalsRequiredMessage:
      'Enter blood pressure, respiratory rate, GCS, oxygen saturation, and heart rate',
    criticalHint:
      'Mark if the patient needs urgent ICU care. ICU admission is recommended when beds are available.',
    sessionTitle: 'Active emergency unit session',
    sessionMessage:
      'Review the referring consultation, capture vitals, then route to a ward or discharge.',
    idleText:
      'Select a referred patient from the queue. The referring clinic consultation will be shown, then record blood pressure, respiratory rate, GCS, oxygen saturation, and heart rate before admitting to ICU, specialized inpatient, or surgical complex — or discharge the patient to complete the visit.',
    dischargeConfirmText: (name) =>
      `Complete the emergency unit consultation and discharge ${name}?`,
    fields: [
      {
        key: 'blood_pressure_systolic',
        label: 'Blood pressure — systolic (mmHg)',
        inputMode: 'numeric',
        placeholder: 'e.g. 120',
      },
      {
        key: 'blood_pressure_diastolic',
        label: 'Blood pressure — diastolic (mmHg)',
        inputMode: 'numeric',
        placeholder: 'e.g. 80',
      },
      {
        key: 'respiratory_rate',
        label: 'Respiratory rate (/min)',
        inputMode: 'numeric',
        placeholder: 'e.g. 18',
      },
      {
        key: 'gcs_score',
        label: 'GCS (3–15)',
        inputMode: 'numeric',
        placeholder: 'e.g. 15',
        min: 3,
        max: 15,
      },
      {
        key: 'oxygen_saturation',
        label: 'Oxygen saturation (%)',
        inputMode: 'decimal',
        placeholder: 'e.g. 98',
      },
      {
        key: 'pulse_rate',
        label: 'Heart rate (bpm)',
        inputMode: 'numeric',
        placeholder: 'e.g. 72',
      },
    ],
  },
  orthopedic_outpatient: {
    vitalsTitle: 'Orthopedic outpatient vitals',
    vitalsHint:
      'Record blood pressure and pain score — they are saved when you admit to a ward or discharge.',
    vitalsRequiredMessage: 'Enter blood pressure and pain score',
    showCritical: false,
    wardTypes: ['specialized_inpatient', 'surgical_complex'],
    sessionTitle: 'Active orthopedic outpatient session',
    sessionMessage:
      'Review the referring consultation, capture vitals, then route to a ward or discharge.',
    idleText:
      'Select a referred patient from the queue. The referring clinic consultation will be shown, then record blood pressure and pain score before admitting to specialized inpatient or surgical complex — or discharge the patient to complete the visit.',
    dischargeConfirmText: (name) =>
      `Complete the orthopedic outpatient consultation and discharge ${name}?`,
    fields: [
      {
        key: 'blood_pressure_systolic',
        label: 'Blood pressure — systolic (mmHg)',
        inputMode: 'numeric',
        placeholder: 'e.g. 120',
      },
      {
        key: 'blood_pressure_diastolic',
        label: 'Blood pressure — diastolic (mmHg)',
        inputMode: 'numeric',
        placeholder: 'e.g. 80',
      },
      {
        key: 'pain_score',
        label: 'Pain score index (0–10)',
        inputMode: 'numeric',
        placeholder: 'e.g. 4',
        min: 0,
        max: 10,
      },
    ],
  },
  adult_outpatient: {
    vitalsTitle: 'Adult outpatient vitals',
    vitalsHint:
      'Record blood pressure, weight, and blood glucose — they are saved when you admit to a ward or discharge.',
    vitalsRequiredMessage: 'Enter blood pressure, weight, and blood glucose',
    showCritical: false,
    wardTypes: ['specialized_inpatient', 'surgical_complex'],
    sessionTitle: 'Active adult outpatient session',
    sessionMessage:
      'Review the referring consultation, capture vitals, then route to a ward or discharge.',
    idleText:
      'Select a referred patient from the queue. The referring clinic consultation will be shown, then record blood pressure, weight, and blood glucose before admitting to specialized inpatient or surgical complex — or discharge the patient to complete the visit.',
    dischargeConfirmText: (name) =>
      `Complete the adult outpatient consultation and discharge ${name}?`,
    fields: [
      {
        key: 'blood_pressure_systolic',
        label: 'Blood pressure — systolic (mmHg)',
        inputMode: 'numeric',
        placeholder: 'e.g. 120',
      },
      {
        key: 'blood_pressure_diastolic',
        label: 'Blood pressure — diastolic (mmHg)',
        inputMode: 'numeric',
        placeholder: 'e.g. 80',
      },
      {
        key: 'weight',
        label: 'Weight (kg)',
        inputMode: 'decimal',
        placeholder: 'e.g. 72.5',
      },
      {
        key: 'blood_glucose',
        label: 'Blood glucose (mmol/L)',
        inputMode: 'decimal',
        placeholder: 'e.g. 5.6',
      },
    ],
  },
  physiotherapy_rehabilitation: {
    vitalsTitle: 'Physiotherapy vitals',
    vitalsHint:
      'Record oxygen saturation and heart rate — they are saved when you admit to a ward or discharge.',
    vitalsRequiredMessage: 'Enter oxygen saturation and heart rate',
    showCritical: false,
    wardTypes: ['specialized_inpatient'],
    sessionTitle: 'Active physiotherapy session',
    sessionMessage:
      'Review the referring consultation, capture vitals, then route to a ward or discharge.',
    idleText:
      'Select a referred patient from the queue. The referring clinic consultation will be shown, then record oxygen saturation and heart rate before admitting to specialized inpatient — or discharge the patient to complete the visit.',
    dischargeConfirmText: (name) =>
      `Complete the physiotherapy consultation and discharge ${name}?`,
    fields: [
      {
        key: 'oxygen_saturation',
        label: 'Oxygen saturation (%)',
        inputMode: 'decimal',
        placeholder: 'e.g. 98',
      },
      {
        key: 'pulse_rate',
        label: 'Heart rate (bpm)',
        inputMode: 'numeric',
        placeholder: 'e.g. 72',
      },
    ],
  },
  big_room_specialist: {
    vitalsTitle: 'Big room specialist vitals',
    vitalsHint:
      'Record oxygen saturation, heart rate, temperature, and blood pressure — they are saved when you admit to a ward or discharge.',
    vitalsRequiredMessage:
      'Enter oxygen saturation, heart rate, temperature, and blood pressure',
    showCritical: false,
    wardTypes: ['specialized_inpatient'],
    sessionTitle: 'Active big room specialist session',
    sessionMessage:
      'Review the referring consultation, capture vitals, then route to a ward or discharge.',
    idleText:
      'Select a referred patient from the queue. The referring clinic consultation will be shown, then record oxygen saturation, heart rate, temperature, and blood pressure before admitting to specialized inpatient — or discharge the patient to complete the visit.',
    dischargeConfirmText: (name) =>
      `Complete the big room specialist consultation and discharge ${name}?`,
    fields: [
      {
        key: 'oxygen_saturation',
        label: 'Oxygen saturation (%)',
        inputMode: 'decimal',
        placeholder: 'e.g. 98',
      },
      {
        key: 'pulse_rate',
        label: 'Heart rate (bpm)',
        inputMode: 'numeric',
        placeholder: 'e.g. 72',
      },
      {
        key: 'temperature',
        label: 'Temperature (°C)',
        inputMode: 'decimal',
        placeholder: 'e.g. 37.2',
      },
      {
        key: 'blood_pressure_systolic',
        label: 'Blood pressure — systolic (mmHg)',
        inputMode: 'numeric',
        placeholder: 'e.g. 120',
      },
      {
        key: 'blood_pressure_diastolic',
        label: 'Blood pressure — diastolic (mmHg)',
        inputMode: 'numeric',
        placeholder: 'e.g. 80',
      },
    ],
  },
  urology_outpatient: {
    vitalsTitle: 'Urology vitals',
    vitalsHint:
      'Record blood pressure and temperature — they are saved when you admit to a ward or discharge.',
    vitalsRequiredMessage: 'Enter blood pressure and temperature',
    criticalHint:
      'Mark if the patient needs urgent ICU care. ICU admission is recommended when beds are available.',
    wardTypes: ['icu', 'outpatient_specialist', 'surgical_complex'],
    sessionTitle: 'Active urology session',
    sessionMessage:
      'Review the referring consultation, capture vitals, then route to a ward or discharge.',
    idleText:
      'Select a referred patient from the queue. The referring clinic consultation will be shown, then record blood pressure and temperature before admitting to outpatient specialist, surgical complex, or ICU (if critical) — or discharge the patient to complete the visit.',
    dischargeConfirmText: (name) =>
      `Complete the urology consultation and discharge ${name}?`,
    fields: [
      {
        key: 'blood_pressure_systolic',
        label: 'Blood pressure — systolic (mmHg)',
        inputMode: 'numeric',
        placeholder: 'e.g. 120',
      },
      {
        key: 'blood_pressure_diastolic',
        label: 'Blood pressure — diastolic (mmHg)',
        inputMode: 'numeric',
        placeholder: 'e.g. 80',
      },
      {
        key: 'temperature',
        label: 'Temperature (°C)',
        inputMode: 'decimal',
        placeholder: 'e.g. 37.2',
      },
    ],
  },
  mental_health_outpatient: {
    vitalsTitle: 'Mental health vitals',
    vitalsHint:
      'Record pulse, blood pressure, and pupillary check — they are saved when you admit to a ward or discharge.',
    vitalsRequiredMessage: 'Enter pulse, blood pressure, and pupillary check',
    showCritical: false,
    wardTypes: ['specialized_inpatient', 'outpatient_specialist'],
    sessionTitle: 'Active mental health session',
    sessionMessage:
      'Review the referring consultation, capture vitals, then route to a ward or discharge.',
    idleText:
      'Select a referred patient from the queue. The referring clinic consultation will be shown, then record pulse, blood pressure, and pupillary check before admitting to specialized inpatient or outpatient specialist — or discharge the patient to complete the visit.',
    dischargeConfirmText: (name) =>
      `Complete the mental health consultation and discharge ${name}?`,
    fields: [
      {
        key: 'pulse_rate',
        label: 'Pulse (bpm)',
        inputMode: 'numeric',
        placeholder: 'e.g. 72',
      },
      {
        key: 'blood_pressure_systolic',
        label: 'Blood pressure — systolic (mmHg)',
        inputMode: 'numeric',
        placeholder: 'e.g. 120',
      },
      {
        key: 'blood_pressure_diastolic',
        label: 'Blood pressure — diastolic (mmHg)',
        inputMode: 'numeric',
        placeholder: 'e.g. 80',
      },
      {
        key: 'pupillary_check',
        label: 'Pupillary check',
        type: 'select',
        options: [
          { value: '', label: 'Select pupillary finding…' },
          { value: 'equal_reactive', label: 'Equal and reactive to light' },
          { value: 'unequal', label: 'Unequal pupils' },
          { value: 'sluggish', label: 'Sluggish reaction' },
          { value: 'fixed', label: 'Fixed pupils' },
          { value: 'not_assessed', label: 'Not assessed' },
        ],
      },
    ],
  },
};

export function hasClinicalWorkspace(department) {
  return CLINICAL_WORKSPACE_DEPARTMENTS.includes(department);
}

export function getClinicalDepartmentConfig(department) {
  return DEPARTMENT_CONFIG[department] || null;
}

export function getWardTypesForDepartment(department) {
  const config = getClinicalDepartmentConfig(department);
  const types = config?.wardTypes || DEFAULT_ADMIT_WARD_TYPES;
  return INPATIENT_WARD_TYPES.filter((type) => types.includes(type.value));
}

function isNumericVitalField(field) {
  return field.type !== 'select' && field.type !== 'text';
}

export function emptyOutpatientForm(department, vitals) {
  const base = {
    temperature: '',
    pulse_rate: '',
    oxygen_saturation: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    respiratory_rate: '',
    gcs_score: '',
    pain_score: '',
    weight: '',
    blood_glucose: '',
    pupillary_check: '',
    is_critical: false,
    notes: vitals?.notes || '',
    discharge_reason: '',
    selected_ward_type: '',
    critical_notes: '',
  };
  const config = getClinicalDepartmentConfig(department);
  if (!config) return base;
  for (const field of config.fields) {
    if (vitals?.[field.key] != null) {
      base[field.key] = String(vitals[field.key]);
    }
  }
  return base;
}

export function validateOutpatientVitals(form, department) {
  const config = getClinicalDepartmentConfig(department);
  const errors = {};
  if (!config) return errors;

  for (const field of config.fields) {
    const raw = form[field.key]?.trim();
    if (!raw) {
      errors[field.key] = `${field.label.replace(/\s*\(.*\)$/, '').replace(/\s*—.*$/, '')} is required`;
    } else if (isNumericVitalField(field) && Number.isNaN(Number(raw))) {
      errors[field.key] = 'Enter a valid number';
    } else if (isNumericVitalField(field) && field.min != null && Number(raw) < field.min) {
      errors[field.key] = `Must be at least ${field.min}`;
    } else if (isNumericVitalField(field) && field.max != null && Number(raw) > field.max) {
      errors[field.key] = `Must be at most ${field.max}`;
    }
  }
  return errors;
}

export function buildVitalsPayload(form, visitId, queueEntryId) {
  return {
    visit_id: visitId,
    queue_entry_id: queueEntryId,
    temperature: form.temperature,
    pulse_rate: form.pulse_rate,
    oxygen_saturation: form.oxygen_saturation,
    blood_pressure_systolic: form.blood_pressure_systolic,
    blood_pressure_diastolic: form.blood_pressure_diastolic,
    respiratory_rate: form.respiratory_rate,
    gcs_score: form.gcs_score,
    pain_score: form.pain_score,
    weight: form.weight,
    blood_glucose: form.blood_glucose,
    pupillary_check: form.pupillary_check,
    is_critical: form.is_critical,
    notes: form.notes,
  };
}

export function buildAdmitPayload(form, visitId, queueEntryId) {
  return {
    visit_id: visitId,
    queue_entry_id: queueEntryId,
    ward_type: form.selected_ward_type,
    critical_notes: form.is_critical ? form.critical_notes || 'Critical patient' : form.critical_notes,
  };
}

export function buildDischargePayload(form, visitId, queueEntryId) {
  return {
    visit_id: visitId,
    queue_entry_id: queueEntryId,
    discharge_reason: form.discharge_reason,
    notes: form.notes,
  };
}

export function vitalsComplete(form, department) {
  const config = getClinicalDepartmentConfig(department);
  if (!config) return false;
  return config.fields.every((field) => {
    const raw = form[field.key]?.trim();
    if (!raw) return false;
    if (!isNumericVitalField(field)) return true;
    if (Number.isNaN(Number(raw))) return false;
    const num = Number(raw);
    if (field.min != null && num < field.min) return false;
    if (field.max != null && num > field.max) return false;
    return true;
  });
}
