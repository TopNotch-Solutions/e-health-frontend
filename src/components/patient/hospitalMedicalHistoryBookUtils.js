import { formatDateTime, formatLabel } from '../../pages/front_office/utils/ehrUtils';
import {
  displayValue,
  formatScalarValue,
  parseJsonValue,
  pushDetail,
} from './clinicalDetailFormatters';

const WARD_TYPE_LABELS = {
  icu: 'ICU',
  specialized_inpatient: 'Specialized inpatient',
  surgical_complex: 'Surgical complex',
  outpatient_specialist: 'Outpatient specialist',
  adult_outpatient: 'Adult outpatient',
};

const HOSPITAL_OUTPATIENT_DISPOSITION_LABELS = {
  admit: 'Admitted to ward',
  discharge: 'Discharged from hospital outpatient',
};

function wardTypeLabel(value) {
  if (!value) return null;
  return WARD_TYPE_LABELS[value] || formatLabel(value);
}

function hospitalOutpatientVitalsLines(vitals) {
  if (!vitals) return [];
  const lines = [];
  const parts = [];
  if (vitals.temperature != null) parts.push(`${vitals.temperature}°C`);
  if (vitals.blood_pressure_systolic != null && vitals.blood_pressure_diastolic != null) {
    parts.push(`BP ${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`);
  }
  if (vitals.pulse_rate != null) parts.push(`Pulse ${vitals.pulse_rate}`);
  if (vitals.respiratory_rate != null) parts.push(`RR ${vitals.respiratory_rate}`);
  if (vitals.oxygen_saturation != null) parts.push(`SpO₂ ${vitals.oxygen_saturation}%`);
  if (vitals.weight != null) parts.push(`${vitals.weight} kg`);
  if (vitals.gcs_score != null) parts.push(`GCS ${vitals.gcs_score}`);
  if (vitals.pain_score != null) parts.push(`Pain ${vitals.pain_score}/10`);
  if (vitals.blood_glucose != null) parts.push(`Glucose ${vitals.blood_glucose}`);
  if (parts.length) pushDetail(lines, 'Vitals', parts.join(' · '));

  pushDetail(lines, 'Pupillary check', vitals.pupillary_check);
  pushDetail(lines, 'Chief complaint', vitals.chief_complaint);
  pushDetail(lines, 'Notes', vitals.notes);
  return lines;
}

function hospitalOutpatientConsultationLines(rows) {
  const lines = [];
  (rows || []).forEach((row) => {
    pushDetail(lines, 'Diagnosis', row.diagnosis);
    pushDetail(lines, 'Notes', row.notes);

    const actions = parseJsonValue(row.actions_taken);
    if (actions?.hospital_outpatient_disposition) {
      const disposition = HOSPITAL_OUTPATIENT_DISPOSITION_LABELS[actions.hospital_outpatient_disposition]
        || formatLabel(actions.hospital_outpatient_disposition);
      pushDetail(lines, 'Outcome', disposition);
      pushDetail(lines, 'Discharge reason', actions.discharge_reason);
      if (actions.ward_type) {
        pushDetail(lines, 'Ward type', wardTypeLabel(actions.ward_type));
      }
    }

    if (row.created_at) pushDetail(lines, 'Recorded', formatDateTime(row.created_at));
  });
  return lines;
}

function wardAdmissionLines(admission, location) {
  const lines = [];
  if (location) {
    const place = [
      location.ward_name,
      location.room_number ? `Room ${location.room_number}` : null,
      location.bed_number ? `Bed ${location.bed_number}` : null,
    ].filter(Boolean).join(' — ');
    pushDetail(lines, 'Location', place || wardTypeLabel(location.ward_type));
  }
  if (admission) {
    pushDetail(lines, 'Admission status', admission.status ? formatLabel(admission.status) : null);
    if (admission.admitted_at) pushDetail(lines, 'Arrived', formatDateTime(admission.admitted_at));
    if (admission.discharged_at) pushDetail(lines, 'Discharged', formatDateTime(admission.discharged_at));
    pushDetail(lines, 'Discharge notes', admission.discharge_notes);
  }
  return lines;
}

function icuDailyRecordLines(records) {
  const lines = [];
  (records || []).forEach((record, idx) => {
    const dayLabel = record.record_date
      ? `ICU daily · ${record.record_date}`
      : `ICU daily ${idx + 1}`;

    const vitals = [
      record.heart_rate != null ? `HR ${record.heart_rate}` : null,
      record.oxygen_saturation != null ? `SpO₂ ${record.oxygen_saturation}%` : null,
      record.respiration_rate != null ? `RR ${record.respiration_rate}` : null,
      record.body_temperature != null ? `${record.body_temperature}°C` : null,
      record.blood_pressure_systolic != null && record.blood_pressure_diastolic != null
        ? `BP ${record.blood_pressure_systolic}/${record.blood_pressure_diastolic}`
        : null,
    ].filter(Boolean);

    if (vitals.length) pushDetail(lines, dayLabel, vitals.join(' · '));
    pushDetail(lines, `${dayLabel} · Ventilator`, record.ventilator_pressures_volumes);
    pushDetail(lines, `${dayLabel} · Urine output`, record.urine_output);
    pushDetail(lines, `${dayLabel} · Arterial blood gases`, record.arterial_blood_gases);
    pushDetail(lines, `${dayLabel} · Neurological checks`, record.neurological_checks);
    if (record.created_at) {
      pushDetail(lines, `${dayLabel} · Recorded`, formatDateTime(record.created_at));
    }
  });
  return lines;
}

function surgicalComplexDailyRecordLines(records) {
  const lines = [];
  (records || []).forEach((record, idx) => {
    const dayLabel = record.record_date
      ? `Surgical complex daily · ${record.record_date}`
      : `Surgical complex daily ${idx + 1}`;

    const vitals = [
      record.heart_rate != null ? `HR ${record.heart_rate}` : null,
      record.oxygen_saturation != null ? `O₂ ${record.oxygen_saturation}%` : null,
      record.pulse_oximetry_spo2 != null ? `SpO₂ ${record.pulse_oximetry_spo2}%` : null,
      record.respiration_rate != null ? `RR ${record.respiration_rate}` : null,
      record.body_temperature != null ? `${record.body_temperature}°C` : null,
      record.blood_pressure_systolic != null && record.blood_pressure_diastolic != null
        ? `BP ${record.blood_pressure_systolic}/${record.blood_pressure_diastolic}`
        : null,
    ].filter(Boolean);

    if (vitals.length) pushDetail(lines, dayLabel, vitals.join(' · '));
    pushDetail(lines, `${dayLabel} · EtCO₂`, record.capnography_etco2);
    pushDetail(lines, `${dayLabel} · FiO₂`, record.fio2);
    pushDetail(lines, `${dayLabel} · Anesthesia / neuro`, record.anesthesia_neuro_monitoring);
    pushDetail(lines, `${dayLabel} · TOF`, record.neuromuscular_tof);
    pushDetail(lines, `${dayLabel} · Pain / sedation`, record.pain_sedation_scores);
    if (record.created_at) {
      pushDetail(lines, `${dayLabel} · Recorded`, formatDateTime(record.created_at));
    }
  });
  return lines;
}

function specializedInpatientDailyRecordLines(records) {
  const lines = [];
  (records || []).forEach((record, idx) => {
    const dayLabel = record.record_date
      ? `Specialized inpatient daily · ${record.record_date}`
      : `Specialized inpatient daily ${idx + 1}`;
    const vitals = [
      record.heart_rate != null ? `HR ${record.heart_rate}` : null,
      record.oxygen_saturation != null ? `SpO₂ ${record.oxygen_saturation}%` : null,
      record.respiration_rate != null ? `RR ${record.respiration_rate}` : null,
      record.body_temperature != null ? `${record.body_temperature}°C` : null,
      record.blood_pressure_systolic != null && record.blood_pressure_diastolic != null
        ? `BP ${record.blood_pressure_systolic}/${record.blood_pressure_diastolic}`
        : null,
    ].filter(Boolean);
    if (vitals.length) pushDetail(lines, dayLabel, vitals.join(' · '));
    if (record.created_at) pushDetail(lines, `${dayLabel} · Recorded`, formatDateTime(record.created_at));
  });
  return lines;
}

function adultOutpatientDailyRecordLines(records) {
  const lines = [];
  (records || []).forEach((record, idx) => {
    const dayLabel = record.record_date
      ? `Adult outpatient daily · ${record.record_date}`
      : `Adult outpatient daily ${idx + 1}`;
    const vitals = [
      record.heart_rate != null ? `HR ${record.heart_rate}` : null,
      record.oxygen_saturation != null ? `SpO₂ ${record.oxygen_saturation}%` : null,
      record.respiration_rate != null ? `RR ${record.respiration_rate}` : null,
      record.body_temperature != null ? `${record.body_temperature}°C` : null,
      record.blood_pressure_systolic != null && record.blood_pressure_diastolic != null
        ? `BP ${record.blood_pressure_systolic}/${record.blood_pressure_diastolic}`
        : null,
    ].filter(Boolean);
    if (vitals.length) pushDetail(lines, dayLabel, vitals.join(' · '));
    if (record.created_at) pushDetail(lines, `${dayLabel} · Recorded`, formatDateTime(record.created_at));
  });
  return lines;
}

export function formatHospitalStopDetails(clinical) {
  if (!clinical) return [];
  const lines = [];

  if (clinical.hospital_outpatient_vitals) {
    lines.push(...hospitalOutpatientVitalsLines(clinical.hospital_outpatient_vitals));
  }
  if (clinical.hospital_outpatient_consultations?.length) {
    lines.push(...hospitalOutpatientConsultationLines(clinical.hospital_outpatient_consultations));
  }
  if (clinical.ward_admission || clinical.ward_location) {
    lines.push(...wardAdmissionLines(clinical.ward_admission, clinical.ward_location));
  }
  if (clinical.icu_daily_records?.length) {
    lines.push(...icuDailyRecordLines(clinical.icu_daily_records));
  }
  if (clinical.surgical_complex_daily_records?.length) {
    lines.push(...surgicalComplexDailyRecordLines(clinical.surgical_complex_daily_records));
  }
  if (clinical.specialized_inpatient_daily_records?.length) {
    lines.push(...specializedInpatientDailyRecordLines(clinical.specialized_inpatient_daily_records));
  }
  if (clinical.adult_outpatient_daily_records?.length) {
    lines.push(...adultOutpatientDailyRecordLines(clinical.adult_outpatient_daily_records));
  }

  return lines;
}

export function wardDepartmentLabel(department) {
  if (department === 'icu_ward') return 'ICU';
  if (department === 'surgical_complex_ward') return 'Surgical complex';
  if (department === 'specialized_inpatient_ward') return 'Specialized inpatient';
  if (department === 'adult_outpatient_ward') return 'Adult outpatient';
  if (department?.startsWith('ward_')) {
    return `${wardTypeLabel(department.slice(5)) || formatLabel(department.slice(5))} Ward`;
  }
  return displayValue(department);
}
