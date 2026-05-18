/** Formatting helpers for the front-office EHR view. */

export function patientInitials(patient) {
  const first = patient?.first_name?.[0] || '';
  const last = patient?.last_name?.[0] || '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || '?';
}

export function patientAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatLabel(value) {
  if (!value) return '—';
  return String(value).replace(/_/g, ' ');
}

export function visitStatusTone(status) {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'active';
    case 'discharged':
      return 'neutral';
    case 'deceased':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function patientCategoryTone(category) {
  switch (category) {
    case 'returning':
      return 'info';
    case 'unknown':
      return 'danger';
    default:
      return 'brand';
  }
}

export function visitTypeTone(type) {
  switch (type) {
    case 'emergency':
      return 'danger';
    case 'follow_up':
      return 'info';
    case 'new':
      return 'brand';
    default:
      return 'neutral';
  }
}

export function formatVitalsLine(vitals) {
  if (!vitals) return null;
  const parts = [];
  if (vitals.temperature != null) parts.push(`${vitals.temperature}°C`);
  if (vitals.blood_pressure_systolic != null && vitals.blood_pressure_diastolic != null) {
    parts.push(`BP ${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`);
  }
  if (vitals.pulse_rate != null) parts.push(`Pulse ${vitals.pulse_rate}`);
  if (vitals.respiratory_rate != null) parts.push(`RR ${vitals.respiratory_rate}`);
  if (vitals.oxygen_saturation != null) parts.push(`SpO₂ ${vitals.oxygen_saturation}%`);
  if (vitals.weight != null) parts.push(`${vitals.weight} kg`);
  return parts.length ? parts.join(' · ') : null;
}

export function visitSummaryCounts(visit) {
  return {
    consultations: visit.consultations?.length ?? 0,
    prescriptions: visit.prescriptions?.length ?? 0,
    labs: visit.labRequests?.length ?? 0,
    imaging: visit.sonarRequests?.length ?? 0,
    hasAdmission: Boolean(visit.admission),
    hasVitals: Boolean(visit.vitals),
  };
}

export function computeEhrStats(visits) {
  const list = Array.isArray(visits) ? visits : [];
  const active = list.filter((v) => v.status === 'in_progress').length;
  const lastVisit = list[0]?.created_at ? new Date(list[0].created_at) : null;
  return {
    total: list.length,
    active,
    lastVisit,
  };
}
