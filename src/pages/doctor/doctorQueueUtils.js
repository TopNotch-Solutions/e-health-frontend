import { mapQueueEntry, formatSexLabel, ageFromDob } from '../nurse/nurseQueueUtils';

export { mapQueueEntry };

export function formatVitalsDisplay(vitals) {
  if (!vitals) {
    return { bpm: '—', bpSys: '—', bpDia: '—', temp: '—', spo2: '—' };
  }
  return {
    bpm: vitals.pulse_rate != null ? String(vitals.pulse_rate) : '—',
    bpSys: vitals.blood_pressure_systolic != null ? String(vitals.blood_pressure_systolic) : '—',
    bpDia: vitals.blood_pressure_diastolic != null ? String(vitals.blood_pressure_diastolic) : '—',
    temp: vitals.temperature != null ? `${vitals.temperature}°C` : '—',
    spo2: vitals.oxygen_saturation != null ? `${vitals.oxygen_saturation}%` : '—',
  };
}

export function nurseHandoverText(vitals) {
  if (!vitals) return 'No nurse handover recorded for this visit.';
  const parts = [];
  if (vitals.chief_complaint) parts.push(vitals.chief_complaint);
  if (vitals.notes) parts.push(vitals.notes);
  if (vitals.allergies) parts.push(`Allergies: ${vitals.allergies}`);
  return parts.length ? parts.join(' · ') : 'Vitals recorded; no chief complaint text.';
}

export function mapDoctorQueueEntry(entry) {
  const base = mapQueueEntry(entry);
  const vitals = entry.visit?.vitals;
  const patient = entry.visit?.patient;
  return {
    ...base,
    vitals,
    vitalsDisplay: formatVitalsDisplay(vitals),
    nurseHandover: nurseHandoverText(vitals),
    allergy: vitals?.allergies || null,
    sex: patient?.sex ? formatSexLabel(patient.sex) : '—',
    age: ageFromDob(patient?.date_of_birth),
    dob: patient?.date_of_birth || '—',
    paymentType: patient?.payment_type || 'state',
  };
}
