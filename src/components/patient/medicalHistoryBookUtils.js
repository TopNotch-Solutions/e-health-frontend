import { formatDateTime, formatLabel, formatVitalsLine, patientAge } from '../../pages/front_office/utils/ehrUtils';
import { formatMaternityStopDetails } from './maternityMedicalHistoryBookUtils';
import { formatHospitalStopDetails, wardDepartmentLabel } from './hospitalMedicalHistoryBookUtils';
import { formatDob, patientName } from '../../pages/front_office/patientUtils';
import { departmentLabel as hospitalDepartmentLabel, TRANSFER_STATUS_LABELS } from '../../constants/hospitalOutpatientDepartments';
import {
  displayValue,
  formatClinicalObjectLines,
  formatScalarValue,
  parseJsonValue,
  pushDetail,
} from './clinicalDetailFormatters';
import { formatPrescriptionScheduleLabel } from '../../utils/prescriptionSchedule';

const DEPARTMENT_LABELS = {
  nurse: 'Nurse',
  doctor: 'Doctor',
  master_doctor: 'Master Doctor',
  pharmacy: 'Pharmacy',
  lab: 'Lab',
  sonar: 'Sonar',
  billing: 'Billing',
  transport: 'Transport',
  emergency_unit: 'Emergency Unit',
  emergency_unit_doctor: 'Emergency Unit Doctor',
  parameter_nurse: 'Parameter Nurse',
  anc_nurse: 'ANC Nurse',
  pediatric: 'Pediatric',
  prep: 'PrEP',
  pap_smear: 'Pap Smear',
  social_worker: 'Social Worker',
  screening_nurse: 'Screening Nurse',
  hiv_tester: 'HIV Testing Room',
  art_nurse: 'ART — Antiretroviral Therapy',
  family_planning: 'Family Planning',
  booking_room: 'Booking Room',
  dermatologist: 'Dermatologist',
};

const DISPOSITION_LABELS = {
  follow_up: 'Follow-up scheduled',
  emergency_unit: 'Transferred to Emergency Unit',
  booking_room: 'Transferred to Booking Room',
  discharge: 'Discharged',
  pharmacy: 'Prescription sent to pharmacy',
};

const ACTIONS_TAKEN_SKIP_KEYS = new Set([
  'emergency_unit_nurse',
  'emergency_unit_doctor',
  'source',
]);

function departmentLabel(value) {
  if (!value) return '—';
  if (value === 'icu_ward' || value === 'surgical_complex_ward' || value === 'specialized_inpatient_ward' || value === 'adult_outpatient_ward' || value?.startsWith('ward_')) {
    return wardDepartmentLabel(value);
  }
  return DEPARTMENT_LABELS[value] || hospitalDepartmentLabel(value) || formatLabel(value);
}

function formatActionsTakenLines(raw) {
  const parsed = parseJsonValue(raw);
  if (parsed == null) return [];
  if (typeof parsed === 'string') {
    return [{ label: 'Actions taken', value: parsed }];
  }
  if (Array.isArray(parsed)) {
    return [{ label: 'Actions taken', value: parsed.map((item) => formatScalarValue(item) || String(item)).join('; ') }];
  }

  const lines = [];
  const disposition = parsed.clinic_disposition || parsed.disposition || parsed.hospital_outpatient_disposition;
  if (disposition) {
    let outcome = DISPOSITION_LABELS[disposition] || formatLabel(disposition);
    if (parsed.hospital_outpatient_disposition === 'admit') {
      outcome = 'Admitted to ward';
    }
    if (parsed.hospital_outpatient_disposition === 'discharge') {
      outcome = 'Discharged from hospital outpatient';
    }
    if (parsed.documentation_type === 'patient_refused_care') {
      outcome = 'Patient declined care';
    }
    pushDetail(lines, 'Outcome', outcome);
  }

  pushDetail(lines, 'Discharge reason', parsed.discharge_reason);
  if (parsed.follow_up_date) {
    pushDetail(lines, 'Follow-up date', formatDateTime(parsed.follow_up_date));
  }
  if (parsed.prescribed != null) {
    pushDetail(lines, 'Prescription issued', formatScalarValue(parsed.prescribed));
  }
  if (parsed.visit_classification) {
    pushDetail(lines, 'Visit classification', formatLabel(parsed.visit_classification));
  }
  if (parsed.routed_to) {
    pushDetail(lines, 'Routed to', departmentLabel(parsed.routed_to));
  }
  if (parsed.nurse_intake) {
    formatClinicalObjectLines(parsed.nurse_intake).forEach((line) => {
      pushDetail(lines, `Intake · ${line.label}`, line.value);
    });
  }

  const handled = new Set([
    'clinic_disposition',
    'disposition',
    'documentation_type',
    'discharge_reason',
    'follow_up_date',
    'prescribed',
    'visit_classification',
    'routed_to',
    'nurse_intake',
    ...ACTIONS_TAKEN_SKIP_KEYS,
  ]);

  Object.entries(parsed).forEach(([key, value]) => {
    if (handled.has(key) || ACTIONS_TAKEN_SKIP_KEYS.has(key)) return;
    if (value === true) return;
    if (value == null || value === '') return;
    if (typeof value === 'object') {
      formatClinicalObjectLines({ [key]: value }).forEach((line) => {
        pushDetail(lines, line.label, line.value);
      });
      return;
    }
    pushDetail(lines, formatLabel(key), formatScalarValue(value));
  });

  return lines;
}

function vitalsDetailLines(vitals) {
  if (!vitals) return [];
  const lines = [];
  const summary = formatVitalsLine(vitals);
  if (summary) lines.push({ label: 'Vitals', value: summary });
  if (vitals.height != null) pushDetail(lines, 'Height', `${vitals.height} cm`);
  [
    ['visit_classification', 'Visit classification'],
    ['chief_complaint', 'Chief complaint'],
    ['onset_at', 'Onset'],
    ['aggravating_factors', 'Aggravating factors'],
    ['alleviating_factors', 'Alleviating factors'],
    ['allergies', 'Allergies'],
    ['current_medications', 'Current medications'],
    ['immunization_status', 'Immunization status'],
    ['social_history', 'Social history'],
    ['physical_examination', 'Physical examination'],
    ['notes', 'Notes'],
  ].forEach(([key, label]) => {
    let value = vitals[key];
    if (value == null || value === '') return;
    if (key === 'visit_classification') value = formatLabel(value);
    if (key === 'onset_at') value = formatDateTime(value);
    pushDetail(lines, label, value);
  });
  return lines;
}

function hospitalTransferDetailLines(transfer) {
  if (!transfer) return [];
  const lines = [];
  pushDetail(
    lines,
    'Hospital destination',
    transfer.destination_hospital || transfer.destination_hospital_name
  );
  pushDetail(
    lines,
    'Receiving department',
    transfer.destination_department_label
      || (transfer.destination_department ? hospitalDepartmentLabel(transfer.destination_department) : null)
  );
  pushDetail(
    lines,
    'Transfer status',
    transfer.transfer_status
      ? (TRANSFER_STATUS_LABELS[transfer.transfer_status] || formatLabel(transfer.transfer_status))
      : null
  );
  pushDetail(lines, 'Transfer reason', transfer.transfer_reason);
  pushDetail(lines, 'Equipment', transfer.equipment_required ? formatLabel(transfer.equipment_required) : null);
  pushDetail(lines, 'Equipment notes', transfer.equipment_notes);
  if (transfer.equipment_checklist) {
    lines.push(...formatClinicalObjectLines(transfer.equipment_checklist, [], 'Equipment checklist'));
  }
  pushDetail(lines, 'External porter notes', transfer.external_porter_notes);
  pushDetail(lines, 'Internal porter notes', transfer.internal_porter_notes);
  pushDetail(lines, 'Critical notes', transfer.critical_notes);
  return lines;
}

function referralDetailLines(referral) {
  if (!referral) return [];
  const lines = [];
  pushDetail(lines, 'Referral type', referral.referral_type ? formatLabel(referral.referral_type) : null);
  pushDetail(lines, 'Destination', referral.destination);
  pushDetail(lines, 'Reason', referral.reason);
  pushDetail(lines, 'Status', referral.status ? formatLabel(referral.status) : null);
  if (referral.created_at) pushDetail(lines, 'Recorded', formatDateTime(referral.created_at));
  return lines;
}

function mortuaryDetailLines(mortuary) {
  if (!mortuary) return [];
  const lines = [];
  pushDetail(lines, 'Cause of death', mortuary.cause_of_death);
  if (mortuary.date_of_death) pushDetail(lines, 'Date of death', formatDateTime(mortuary.date_of_death));
  pushDetail(lines, 'Notes', mortuary.notes);
  return lines;
}

const HIV_RESULT_LABELS = {
  negative: 'Negative',
  positive: 'Positive',
};

function hivTestResultDetailLines(test) {
  if (!test) return [];
  const lines = [];
  pushDetail(
    lines,
    'Result',
    test.result_label || (test.result ? HIV_RESULT_LABELS[test.result] || formatLabel(test.result) : null)
  );
  pushDetail(lines, 'Test method', test.test_method);
  pushDetail(lines, 'Kit batch', test.kit_batch);
  pushDetail(lines, 'Notes', test.notes);
  if (test.created_at) pushDetail(lines, 'Recorded', formatDateTime(test.created_at));
  return lines;
}

function prepEpisodeDetailLines(episode) {
  if (!episode) return [];
  const lines = [];
  pushDetail(lines, 'Session status', episode.status ? formatLabel(episode.status) : null);
  pushDetail(lines, 'Injection administered', episode.injection_administered ? 'Yes' : 'No');
  if (episode.enrolled_at) pushDetail(lines, 'Enrolled', formatDateTime(episode.enrolled_at));
  if (episode.injection_administered_at) {
    pushDetail(lines, 'Injection time', formatDateTime(episode.injection_administered_at));
  }
  if (episode.completed_at) pushDetail(lines, 'Session completed', formatDateTime(episode.completed_at));

  const injection = episode.session_data?.injection;
  if (injection) {
    pushDetail(lines, 'Medication', injection.medication);
    pushDetail(
      lines,
      'Injection site',
      injection.injection_site ? formatLabel(injection.injection_site) : null
    );
    pushDetail(lines, 'Lot number', injection.lot_number);
    pushDetail(lines, 'Injection notes', injection.notes);
    if (injection.administered_at) {
      pushDetail(lines, 'Administered', formatDateTime(injection.administered_at));
    }
  }
  pushDetail(lines, 'Counseling notes', episode.session_data?.counseling_notes);
  return lines;
}

function consultationDetailLines(rows) {
  const lines = [];
  (rows || []).forEach((row) => {
    pushDetail(lines, 'Diagnosis', row.diagnosis);
    pushDetail(lines, 'Notes', row.notes);
    if (row.actions_taken) {
      lines.push(...formatActionsTakenLines(row.actions_taken));
    }
    if (row.created_at) pushDetail(lines, 'Recorded', formatDateTime(row.created_at));
  });
  return lines;
}

function prescriptionDetailLines(prescriptions) {
  const lines = [];
  (prescriptions || []).forEach((rx) => {
    (rx.items || []).forEach((item) => {
      const parts = [
        item.dosage,
        item.frequency,
        item.quantity != null ? `Qty ${item.quantity}` : null,
        item.instructions,
        formatPrescriptionScheduleLabel(item),
      ].filter(Boolean);
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
    lines.push(...formatClinicalObjectLines(clinical.screening_assessment));
  }
  if (clinical.hospital_transfer) {
    lines.push(...hospitalTransferDetailLines(clinical.hospital_transfer));
  }
  if (clinical.referral) {
    lines.push(...referralDetailLines(clinical.referral));
  }
  if (clinical.mortuary) {
    lines.push(...mortuaryDetailLines(clinical.mortuary));
  }
  if (clinical.hiv_test_result) {
    lines.push(...hivTestResultDetailLines(clinical.hiv_test_result));
  }
  if (clinical.routing_outcome) {
    pushDetail(lines, 'Routing', clinical.routing_outcome);
  }
  if (clinical.prep_episode) {
    lines.push(...prepEpisodeDetailLines(clinical.prep_episode));
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
      lines.push(...formatClinicalObjectLines(row, []).map((line) => ({
        ...line,
        label: `Intervention ${idx + 1}${line.label !== 'Notes' ? ` · ${line.label}` : ''}`,
      })));
    });
  }

  const handled = new Set([
    'vitals', 'consultations', 'prescriptions', 'screening_assessment',
    'hospital_transfer', 'referral', 'mortuary',
    'lab_requests', 'imaging_requests', 'emergency_interventions',
    'dermatology_assessment', 'family_planning', 'prep_episode', 'art_episode',
    'pap_smear_screening', 'social_worker_assessment', 'pediatric_assessment', 'hiv_test_result',
    'routing_outcome',
    'maternity_anc_sessions', 'maternity_anw_daily_records', 'maternity_pnw_daily_records',
    'maternity_icu_daily_records', 'maternity_nicu_records', 'maternity_episode',
    'hospital_outpatient_vitals', 'hospital_outpatient_consultations',
    'ward_admission', 'ward_location', 'icu_daily_records', 'surgical_complex_daily_records',
    'specialized_inpatient_daily_records',
    'adult_outpatient_daily_records',
    'current_ward', 'status', 'admitted_at', 'discharged_at', 'front_office_visits',
    'anw_days', 'pnw_days', 'icu_days', 'feeding_counselling_done', 'six_week_follow_up_date',
  ]);
  Object.entries(clinical).forEach(([key, value]) => {
    if (handled.has(key) || value == null || value === '') return;
    lines.push(...formatClinicalObjectLines({ [key]: value }));
  });

  lines.push(...formatMaternityStopDetails(clinical));
  lines.push(...formatHospitalStopDetails(clinical));

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
