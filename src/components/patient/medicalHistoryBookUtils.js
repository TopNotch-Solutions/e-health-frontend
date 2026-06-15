import { formatDateTime, formatLabel, formatVitalsLine, patientAge } from '../../pages/front_office/utils/ehrUtils';
import { formatDob, patientName } from '../../pages/front_office/patientUtils';

export const BOOK_CHAPTERS = [
  { id: 'medications', number: 1, title: 'Active Medications & Allergies' },
  { id: 'vitals', number: 2, title: 'Recorded Vitals Overview' },
  { id: 'chronic', number: 3, title: 'Chronic Illnesses & Past Medical History' },
  { id: 'immunization', number: 4, title: 'Immunization & Clinical Notes' },
];

const VITAL_DETAIL_FIELDS = [
  ['chief_complaint', 'Chief complaint'],
  ['allergies', 'Allergies'],
  ['current_medications', 'Current medications'],
  ['immunization_status', 'Immunization status'],
  ['social_history', 'Social history'],
  ['physical_examination', 'Physical examination'],
  ['onset_at', 'Onset'],
  ['aggravating_factors', 'Aggravating factors'],
  ['alleviating_factors', 'Alleviating factors'],
  ['visit_classification', 'Visit classification'],
  ['notes', 'Notes'],
];

const NUMERIC_VITAL_FIELDS = [
  ['temperature', 'Temperature', (v) => (v != null ? `${v}°C` : null)],
  ['blood_pressure_systolic', 'Blood pressure', (v, vitals) =>
    (vitals.blood_pressure_systolic != null && vitals.blood_pressure_diastolic != null
      ? `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`
      : null)],
  ['pulse_rate', 'Pulse rate', (v) => (v != null ? `${v} bpm` : null)],
  ['respiratory_rate', 'Respiratory rate', (v) => (v != null ? `${v} /min` : null)],
  ['oxygen_saturation', 'SpO₂', (v) => (v != null ? `${v}%` : null)],
  ['weight', 'Weight', (v) => (v != null ? `${v} kg` : null)],
  ['height', 'Height', (v) => (v != null ? `${v} cm` : null)],
];

function displayValue(value) {
  if (value == null) return '—';
  const s = String(value).trim();
  return s || '—';
}

function pushSection(sections, label, value) {
  const text = displayValue(value);
  if (text !== '—') sections.push({ label, value: text });
}

function vitalsDetailSections(vitals) {
  if (!vitals) return [];
  const sections = [];
  NUMERIC_VITAL_FIELDS.forEach(([key, label, fmt]) => {
    pushSection(sections, label, fmt(vitals[key], vitals));
  });
  VITAL_DETAIL_FIELDS.forEach(([key, label]) => pushSection(sections, label, vitals[key]));
  return sections;
}

function hasVitalsContent(vitals) {
  if (!vitals) return false;
  return vitalsDetailSections(vitals).length > 0;
}

function visitsWithVitals(visits) {
  return (visits || []).filter((v) => hasVitalsContent(v.vitals));
}

function latestVitalsFromHistory(visits) {
  for (const visit of visitsWithVitals(visits)) {
    return visit.vitals;
  }
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

function extractImmunizationAndNotes(visits) {
  const rows = [];
  visitsWithVitals(visits).forEach((visit) => {
    const vitals = visit.vitals;
    const imm = vitals.immunization_status?.trim();
    if (imm) {
      rows.push({
        date: visit.created_at,
        visit: visit.visit_number,
        label: 'Immunization status',
        detail: imm,
      });
    }
    const notes = vitals.notes?.trim();
    if (notes) {
      rows.push({
        date: visit.created_at,
        visit: visit.visit_number,
        label: 'Clinical notes',
        detail: notes,
      });
    }
  });
  return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function buildVitalsSummary(visits) {
  const withVitals = visitsWithVitals(visits);
  if (!withVitals.length) return ['No vitals captured on file'];
  return withVitals.map((visit) => {
    const line = formatVitalsLine(visit.vitals);
    const complaint = visit.vitals?.chief_complaint?.trim();
    return [
      `${formatDateTime(visit.created_at)} · ${visit.visit_number}`,
      line || 'Vitals recorded',
      complaint ? `Chief complaint: ${complaint}` : null,
    ]
      .filter(Boolean)
      .join(' · ');
  });
}

function buildVitalsPage(visit) {
  const vitals = visit.vitals;
  const sections = vitalsDetailSections(vitals);

  return {
    kind: 'vitals',
    chapterId: 'vitals',
    date: visit.created_at,
    visitNumber: visit.visit_number,
    visitType: formatLabel(visit.visit_type),
    visitStatus: formatLabel(visit.status),
    recordedAt: formatDateTime(visit.created_at),
    chiefComplaint: displayValue(vitals?.chief_complaint),
    vitalsLine: displayValue(formatVitalsLine(vitals)),
    clinicalNotes: displayValue(vitals?.physical_examination || vitals?.notes),
    allergies: displayValue(vitals?.allergies),
    currentMedications: displayValue(vitals?.current_medications),
    socialHistory: displayValue(vitals?.social_history),
    immunizationStatus: displayValue(vitals?.immunization_status),
    clinicalSections: sections,
  };
}

function flattenVitalsPages(visits) {
  return visitsWithVitals(visits)
    .map((visit) => ({
      page: buildVitalsPage(visit),
      sortAt: new Date(visit.created_at).getTime(),
    }))
    .sort((a, b) => b.sortAt - a.sortAt)
    .map((row) => row.page);
}

export function buildStatSummary(patient, history) {
  const visits = history?.visits || [];
  const allergies = collectAllergies(visits);
  const medications = collectMedications(visits);
  const lastVitals = latestVitalsFromHistory(visits);
  const vitalsCount = visitsWithVitals(visits).length;

  return {
    allergies: allergies.length ? allergies : ['None recorded'],
    medications: medications.length ? medications : ['None recorded'],
    diagnoses: [],
    lastVitals: formatVitalsLine(lastVitals) || 'No vitals on file',
    patientName: patientName(patient),
    patientId: patient?.patient_number || patient?.id_number || '—',
    vitalsCount,
  };
}

export function buildBookPages(patient, history) {
  const visits = history?.visits || [];
  const allergies = collectAllergies(visits);
  const medications = collectMedications(visits);
  const chronic = extractChronicHistory(visits);
  const immunizationNotes = extractImmunizationAndNotes(visits);
  const latestVitals = latestVitalsFromHistory(visits);
  const vitalsPages = flattenVitalsPages(visits);
  const vitalsSummary = buildVitalsSummary(visits);
  const vitalsCaptureCount = vitalsPages.length;

  const criticalAlerts = [];
  if (allergies.length) criticalAlerts.push({ type: 'Allergy', text: allergies.join('; ') });
  if (chronic.length) {
    criticalAlerts.push({ type: 'Clinical history', text: chronic[0].text.slice(0, 200) });
  }
  if (patient?.is_emergency) {
    criticalAlerts.push({ type: 'Flag', text: 'Patient flagged as emergency on registration' });
  }

  const cover = {
    kind: 'cover',
    title: 'Patient Medical Record Book',
    fullName: patientName(patient),
    patientId: patient?.patient_number || '—',
    nationalId: patient?.id_number || '—',
    dateOfBirth: formatDob(patient?.date_of_birth),
    age: patientAge(patient?.date_of_birth),
    gender: formatLabel(patient?.sex),
    emergencyContact: {
      name: patient?.emergency_contact_name || '—',
      relationship: patient?.emergency_contact_relationship || '—',
      phone: patient?.emergency_contact_phone || '—',
    },
    criticalAlerts,
    visitCount: visits.length,
    vitalsCount: vitalsCaptureCount,
  };

  const toc = { kind: 'toc', chapters: BOOK_CHAPTERS };

  const chapterPages = [
    {
      kind: 'chapter',
      chapterId: 'medications',
      title: BOOK_CHAPTERS[0].title,
      sections: [
        { label: 'Active allergies (from vitals)', items: allergies.length ? allergies : ['None recorded'] },
        { label: 'Current medications (from vitals)', items: medications.length ? medications : ['None recorded'] },
      ],
    },
    {
      kind: 'chapter',
      chapterId: 'vitals',
      title: BOOK_CHAPTERS[1].title,
      sections: [
        {
          label: 'All vitals captures (newest first)',
          items: vitalsSummary,
        },
      ],
    },
    {
      kind: 'chapter',
      chapterId: 'chronic',
      title: BOOK_CHAPTERS[2].title,
      sections: [
        {
          label: 'Social & examination history (from vitals)',
          items: chronic.length
            ? chronic.map((row) => `${formatDateTime(row.date)} · ${row.visit} · ${row.source}: ${row.text}`)
            : ['No chronic illness or past history recorded in vitals'],
        },
      ],
    },
    {
      kind: 'chapter',
      chapterId: 'immunization',
      title: BOOK_CHAPTERS[3].title,
      sections: [
        {
          label: 'Immunization & notes (from vitals)',
          items: immunizationNotes.length
            ? immunizationNotes.map(
              (row) => `${formatDateTime(row.date)} · ${row.visit} · ${row.label}: ${row.detail}`
            )
            : ['No immunization or clinical notes recorded in vitals'],
        },
      ],
    },
  ];

  const pages = [cover, toc, ...chapterPages, ...vitalsPages];

  const chapterPageIndex = {};
  chapterPages.forEach((ch, idx) => {
    chapterPageIndex[ch.chapterId] = idx + 2;
  });
  if (vitalsPages.length) {
    chapterPageIndex.vitalsTimeline = chapterPages.length + 2;
  }

  return {
    pages,
    chapterPageIndex,
    statSummary: buildStatSummary(patient, history),
    meta: {
      totalVisits: visits.length,
      vitalsCaptures: vitalsCaptureCount,
      latestVitals: formatVitalsLine(latestVitals),
      allergies,
      medications,
    },
  };
}

export function displayValueSafe(value) {
  return displayValue(value);
}
