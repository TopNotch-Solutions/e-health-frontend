import { apiRequest } from './client';

export function searchPatients({ id_number, date_of_birth, name }) {
  const qs = new URLSearchParams();
  if (id_number) qs.set('id_number', id_number);
  if (date_of_birth) qs.set('date_of_birth', date_of_birth);
  if (name) qs.set('name', name);
  return apiRequest(`/api/v1/patients/search?${qs}`);
}

export function getPatient(id) {
  return apiRequest(`/api/v1/patients/${id}`);
}

export function getPatientHistory(id) {
  return apiRequest(`/api/v1/patients/${id}/history`);
}

export function registerPatient(body) {
  return apiRequest('/api/v1/patients', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function registerEmergencyPatient(body) {
  return apiRequest('/api/v1/patients/emergency', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function createPatientVisit(patientId, intake = {}) {
  const body = {};
  if (intake.mode_of_arrival) body.mode_of_arrival = intake.mode_of_arrival;
  if (intake.accompanied_by) body.accompanied_by = intake.accompanied_by;
  if (intake.is_emergency) body.is_emergency = true;
  if (intake.immediate_triage) body.immediate_triage = true;
  if (intake.routing_destination) body.routing_destination = intake.routing_destination;
  return apiRequest(`/api/v1/patients/${patientId}/visits`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updatePatient(patientId, body) {
  return apiRequest(`/api/v1/patients/${patientId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
