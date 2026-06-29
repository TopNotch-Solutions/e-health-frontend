import { apiRequest } from './client';

export function getHospitalOutpatientQueue() {
  return apiRequest('/api/v1/hospital-outpatient/queue');
}

export function getHospitalInboundTransfers() {
  return apiRequest('/api/v1/hospital-outpatient/inbound');
}

export function getQueueEntryTransfer(queueEntryId) {
  return apiRequest(`/api/v1/hospital-outpatient/queue/${queueEntryId}/transfer`);
}

export function confirmHospitalDepartmentReceipt(body) {
  return apiRequest('/api/v1/hospital-outpatient/confirm-receipt', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function startHospitalOutpatientSession(queueEntryId) {
  return apiRequest('/api/v1/hospital-outpatient/session/start', {
    method: 'POST',
    body: JSON.stringify({ queue_entry_id: queueEntryId }),
  });
}

export function getHospitalOutpatientWorkspace(queueEntryId) {
  return apiRequest(`/api/v1/hospital-outpatient/queue/${queueEntryId}/workspace`);
}

export function saveHospitalOutpatientVitals(body) {
  return apiRequest('/api/v1/hospital-outpatient/vitals', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function admitHospitalOutpatientPatient(body) {
  return apiRequest('/api/v1/hospital-outpatient/admit', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function dischargeHospitalOutpatientPatient(body) {
  return apiRequest('/api/v1/hospital-outpatient/discharge', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
