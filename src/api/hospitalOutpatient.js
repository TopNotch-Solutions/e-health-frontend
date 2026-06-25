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
