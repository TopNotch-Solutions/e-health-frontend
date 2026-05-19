/** Map API queue status to nurse UI status. */
export function uiStatusFromEntry(entry) {
  if (entry.status === 'in_progress') return 'in_progress';
  if (entry.status === 'completed') return 'completed';
  return 'pending';
}

export function patientDisplayName(patient) {
  if (!patient) return 'Unknown patient';
  const name = [patient.first_name, patient.last_name].filter(Boolean).join(' ').trim();
  if (name) return name;
  if (patient.temp_id) return `Unknown (${patient.temp_id})`;
  return 'Unknown patient';
}

export function formatSexLabel(sex) {
  if (!sex) return '—';
  const s = String(sex);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ageFromDob(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

export function formatSexAge(patient) {
  const sex = formatSexLabel(patient?.sex);
  const age = ageFromDob(patient?.date_of_birth);
  if (age != null) return `${sex}, ${age} Y/O`;
  return sex;
}

export function formatPatientId(patient) {
  const num = patient?.patient_number || patient?.temp_id;
  if (!num) return 'ID: —';
  const label = String(num).startsWith('PT-') ? num : `PT-${num}`;
  return `ID: #${label}`;
}

export function assignedNurseName(assignedTo) {
  if (!assignedTo) return null;
  return [assignedTo.first_name, assignedTo.last_name].filter(Boolean).join(' ').trim() || null;
}

export function mapQueueEntry(entry) {
  const patient = entry.visit?.patient;
  const isEmergency =
    entry.priority === 'emergency' || Boolean(patient?.is_emergency);
  return {
    entryId: entry.id,
    visitId: entry.visit_id,
    status: uiStatusFromEntry(entry),
    apiStatus: entry.status,
    priority: entry.priority,
    isEmergency,
    assignedToId: entry.assigned_to || null,
    assignedToName: assignedNurseName(entry.assignedTo),
    patient,
    name: patientDisplayName(patient),
    sexAge: formatSexAge(patient),
    patientIdLabel: formatPatientId(patient),
  };
}

export { getStoredUser } from '../../api/authSession';
