import { formatDateTime, formatLabel, formatVitalsLine, patientAge } from '../../pages/front_office/utils/ehrUtils';
import { formatDob, patientName } from '../../pages/front_office/patientUtils';

function displayValue(value) {
  if (value == null) return '—';
  const s = String(value).trim();
  return s || '—';
}

function pushDetail(lines, label, value) {
  const text = displayValue(value);
  if (text !== '—') lines.push({ label, value: text });
}

function vitalsDetailLines(vitals) {
  if (!vitals) return [];
  const lines = [];
  const summary = formatVitalsLine(vitals);
  if (summary) lines.push({ label: 'Vitals', value: summary });
  [
    ['chief_complaint', 'Chief complaint'],
    ['allergies', 'Allergies'],
    ['current_medications', 'Current medications'],
    ['immunization_status', 'Immunization status'],
    ['social_history', 'Social history'],
    ['physical_examination', 'Physical examination'],
    ['notes', 'Notes'],
  ].forEach(([key, label]) => pushDetail(lines, label, vitals[key]));
  return lines;
}

function consultationDetailLines(rows) {
  const lines = [];
  (rows || []).forEach((row) => {
    pushDetail(lines, 'Diagnosis', row.diagnosis);
    pushDetail(lines, 'Notes', row.notes);
    if (row.actions_taken) {
      const actions = typeof row.actions_taken === 'string'
        ? row.actions_taken
        : JSON.stringify(row.actions_taken);
      pushDetail(lines, 'Actions taken', actions);
    }
    if (row.created_at) pushDetail(lines, 'Recorded', formatDateTime(row.created_at));
  });
  return lines;
}

function prescriptionDetailLines(prescriptions) {
  const lines = [];
  (prescriptions || []).forEach((rx) => {
    (rx.items || []).forEach((item) => {
      const parts = [item.dosage, item.frequency, item.quantity != null ? `Qty ${item.quantity}` : null, item.instructions]
        .filter(Boolean);
      lines.push({
        label: item.medication_name || 'Medication',
        value: parts.length ? parts.join(' · ') : displayValue(rx.status),
      });
    });
    if (!rx.items?.length && rx.status) {
      lines.push({ label: 'Prescription', value: formatLabel(rx.status) });
    }
  });
  return lines;
}

function objectDetailLines(obj, skipKeys = []) {
  if (!obj || typeof obj !== 'object') return [];
  const lines = [];
  Object.entries(obj).forEach(([key, value]) => {
    if (skipKeys.includes(key) || value == null || value === '') return;
    if (Array.isArray(value)) {
      if (!value.length) return;
      pushDetail(lines, formatLabel(key), value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join('; '));
      return;
    }
    if (typeof value === 'object') {
      pushDetail(lines, formatLabel(key), JSON.stringify(value));
      return;
    }
    pushDetail(lines, formatLabel(key), value);
  });
  return lines;
}

const EXCLUDED_BOOK_DEPARTMENTS = new Set(['front_office', 'billing']);

export function isBookDepartment(department) {
  return department && !EXCLUDED_BOOK_DEPARTMENTS.has(department);
}

export function formatStopClinicalDetails(stop) {
  const clinical = stop?.clinical;
  const lines = [];

  if (!clinical) return lines;

  if (clinical.vitals) lines.push(...vitalsDetailLines(clinical.vitals));
  if (clinical.consultations?.length) lines.push(...consultationDetailLines(clinical.consultations));
  if (clinical.prescriptions?.length) lines.push(...prescriptionDetailLines(clinical.prescriptions));
  if (clinical.screening_assessment) {
    lines.push(...objectDetailLines(clinical.screening_assessment));
  }
  if (clinical.lab_requests?.length) {
    clinical.lab_requests.forEach((lab) => {
      lines.push({
        label: 'Lab request',
        value: [lab.test_type, lab.status ? formatLabel(lab.status) : null, lab.clinical_notes].filter(Boolean).join(' · '),
      });
    });
  }
  if (clinical.imaging_requests?.length) {
    clinical.imaging_requests.forEach((img) => {
      lines.push({
        label: 'Imaging',
        value: [img.scan_type, img.status ? formatLabel(img.status) : null, img.clinical_notes].filter(Boolean).join(' · '),
      });
    });
  }
  if (clinical.emergency_interventions?.length) {
    clinical.emergency_interventions.forEach((row, idx) => {
      lines.push(...objectDetailLines(row, []).map((line) => ({
        ...line,
        label: `Intervention ${idx + 1}${line.label !== 'Notes' ? ` · ${line.label}` : ''}`,
      })));
    });
  }

  const handled = new Set([
    'vitals', 'consultations', 'prescriptions', 'screening_assessment',
    'lab_requests', 'imaging_requests', 'emergency_interventions',
  ]);
  Object.entries(clinical).forEach(([key, value]) => {
    if (handled.has(key) || value == null || value === '') return;
    lines.push(...objectDetailLines({ [key]: value }));
  });

  return lines;
}

export function buildConsultationSteps(visit) {
  return (visit.stops || [])
    .filter((stop) => isBookDepartment(stop.department))
    .map((stop, index) => ({
      id: `${stop.department}-${index}`,
      label: stop.department_label || formatLabel(stop.department),
      department: stop.department,
      timestamp: stop.arrived_at || stop.started_at,
      startedAt: stop.started_at,
      completedAt: stop.completed_at,
      details: formatStopClinicalDetails(stop),
    }));
}

function visitsWithVitals(visits) {
  return (visits || []).filter((v) => v.vitals && vitalsDetailLines(v.vitals).length > 0);
}

function latestVitalsFromHistory(visits) {
  for (const visit of visitsWithVitals(visits)) return visit.vitals;
  return null;
}

function collectAllergies(visits) {
  const seen = new Set();
  const items = [];
  visitsWithVitals(visits).forEach((visit) => {
    const text = visit.vitals?.allergies?.trim();
    if (text && !seen.has(text.toLowerCase())) {
      seen.add(text.toLowerCase());
      items.push(text);
    }
  });
  return items;
}

function collectMedications(visits) {
  const meds = [];
  const seen = new Set();
  visitsWithVitals(visits).forEach((visit) => {
    const text = visit.vitals?.current_medications?.trim();
    if (text && !seen.has(text.toLowerCase())) {
      seen.add(text.toLowerCase());
      meds.push(text);
    }
  });
  return meds;
}

function extractChronicHistory(visits) {
  const notes = [];
  visitsWithVitals(visits).forEach((visit) => {
    const vitals = visit.vitals;
    ['social_history', 'physical_examination'].forEach((key) => {
      const text = vitals[key]?.trim();
      if (text) {
        notes.push({
          date: visit.created_at,
          visit: visit.visit_number,
          text,
          source: formatLabel(key),
        });
      }
    });
  });
  return notes.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function buildConsultation(visit) {
  const steps = buildConsultationSteps(visit);
  const lastStep = [...steps].reverse().find((s) => s.completedAt || s.timestamp);

  return {
    id: visit.id,
    visitNumber: visit.visit_number,
    visitType: formatLabel(visit.visit_type),
    startedAt: visit.created_at,
    startedAtLabel: formatDateTime(visit.created_at),
    completedAt: visit.completed_at,
    completedAtLabel: visit.completed_at ? formatDateTime(visit.completed_at) : null,
    lastActivityAt: lastStep?.completedAt || lastStep?.timestamp || visit.created_at,
    lastActivityLabel: formatDateTime(lastStep?.completedAt || lastStep?.timestamp || visit.created_at),
    stepCount: steps.length,
    steps,
  };
}

function buildBookPagesList(identity, consultations) {
  const pages = [{ kind: 'identity', identity }];
  consultations.forEach((consultation, index) => {
    pages.push({
      kind: 'consultation',
      consultation,
      consultationIndex: index,
    });
  });
  return pages.map((page, index) => ({ ...page, pageNumber: index + 1 }));
}

export function buildBookSpreads(pages) {
  const spreads = [];
  for (let i = 0; i < pages.length; i += 2) {
    spreads.push({
      left: pages[i] || null,
      right: pages[i + 1] || null,
      spreadNumber: spreads.length + 1,
    });
  }
  return spreads;
}

function buildIdentity(patient, visits, allergies, medications, latestVitals) {
  const vitalsCount = visitsWithVitals(visits).length;
  return {
    fullName: patientName(patient),
    firstName: displayValue(patient?.first_name),
    lastName: displayValue(patient?.last_name),
    patientId: patient?.patient_number || '—',
    nationalId: patient?.id_number || '—',
    tempId: patient?.temp_id?.trim() || null,
    category: formatLabel(patient?.category),
    paymentType: formatLabel(patient?.payment_type),
    dateOfBirth: formatDob(patient?.date_of_birth),
    age: patientAge(patient?.date_of_birth),
    gender: formatLabel(patient?.sex),
    phone: displayValue(patient?.phone),
    address: displayValue(patient?.address),
    isEmergency: Boolean(patient?.is_emergency),
    registeredAt: patient?.created_at ? formatDateTime(patient.created_at) : '—',
    updatedAt: patient?.updated_at ? formatDateTime(patient.updated_at) : '—',
    emergencyContact: {
      name: patient?.emergency_contact_name || '—',
      phone: patient?.emergency_contact_phone || '—',
    },
    criticalAlerts: [],
    visitCount: visits.length,
    vitalsCount,
    latestVitalsLine: formatVitalsLine(latestVitals),
    allergies,
    medications,
  };
}

export function buildIdentityFields(identity) {
  const fields = [
    { label: 'First name', value: identity.firstName },
    { label: 'Last name', value: identity.lastName },
    { label: 'Patient number', value: identity.patientId, mono: true },
    { label: 'National ID', value: identity.nationalId, mono: true },
    { label: 'Category', value: identity.category },
    { label: 'Payment type', value: identity.paymentType },
    { label: 'Date of birth', value: identity.dateOfBirth },
    { label: 'Age', value: identity.age != null ? `${identity.age} years` : '—' },
    { label: 'Sex', value: identity.gender },
    { label: 'Phone', value: identity.phone },
    { label: 'Address', value: identity.address, fullWidth: true },
    { label: 'Registered', value: identity.registeredAt },
    { label: 'Last updated', value: identity.updatedAt },
    { label: 'Visits on file', value: String(identity.visitCount ?? 0) },
    { label: 'Vitals captures', value: String(identity.vitalsCount ?? 0) },
  ];

  if (identity.tempId) {
    fields.splice(4, 0, { label: 'Temporary ID', value: identity.tempId, mono: true });
  }

  if (identity.isEmergency) {
    fields.push({ label: 'Emergency flag', value: 'Yes', fullWidth: true });
  }

  return fields;
}

export function buildStatSummary(patient, history) {
  const visits = history?.visits || [];
  const allergies = collectAllergies(visits);
  const medications = collectMedications(visits);
  const lastVitals = latestVitalsFromHistory(visits);

  return {
    allergies: allergies.length ? allergies : ['None recorded'],
    medications: medications.length ? medications : ['None recorded'],
    diagnoses: [],
    lastVitals: formatVitalsLine(lastVitals) || 'No vitals on file',
    patientName: patientName(patient),
    patientId: patient?.patient_number || patient?.id_number || '—',
    vitalsCount: visitsWithVitals(visits).length,
  };
}

export function buildBookModel(patient, history) {
  const visits = history?.visits || [];
  const allergies = collectAllergies(visits);
  const medications = collectMedications(visits);
  const chronic = extractChronicHistory(visits);
  const latestVitals = latestVitalsFromHistory(visits);
  const consultations = visits.map(buildConsultation);
  const identity = buildIdentity(patient, visits, allergies, medications, latestVitals);

  const criticalAlerts = [];
  if (allergies.length) criticalAlerts.push({ type: 'Allergy', text: allergies.join('; ') });
  if (chronic.length) {
    criticalAlerts.push({ type: 'Clinical history', text: chronic[0].text.slice(0, 200) });
  }
  if (patient?.is_emergency) {
    criticalAlerts.push({ type: 'Flag', text: 'Patient flagged as emergency on registration' });
  }

  identity.criticalAlerts = criticalAlerts;

  const pages = buildBookPagesList(identity, consultations);
  const spreads = buildBookSpreads(pages);

  return {
    identity,
    consultations,
    pages,
    spreads,
    totalPages: pages.length,
    statSummary: buildStatSummary(patient, history),
    meta: {
      totalVisits: visits.length,
      vitalsCaptures: visitsWithVitals(visits).length,
      latestVitals: formatVitalsLine(latestVitals),
      allergies,
      medications,
    },
  };
}

/** @deprecated Use buildBookModel — kept for any legacy imports */
export function buildBookPages(patient, history) {
  const model = buildBookModel(patient, history);
  return {
    pages: [{ kind: 'spread', ...model }],
    chapterPageIndex: {},
    statSummary: model.statSummary,
    meta: model.meta,
  };
}

export function displayValueSafe(value) {
  return displayValue(value);
}

export function formatStepTime(step) {
  if (step.completedAt) return formatDateTime(step.completedAt);
  if (step.startedAt) return formatDateTime(step.startedAt);
  if (step.timestamp) return formatDateTime(step.timestamp);
  return '—';
}
