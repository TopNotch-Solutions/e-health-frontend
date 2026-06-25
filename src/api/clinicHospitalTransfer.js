import { apiRequest } from './client';

export function getHospitalDepartments({ visitId, sourceRole } = {}) {
  const params = new URLSearchParams();
  if (visitId) params.set('visit_id', visitId);
  if (sourceRole) params.set('source_role', sourceRole);
  const qs = params.toString();
  return apiRequest(`/api/v1/clinic-hospital-transfer/hospital-departments${qs ? `?${qs}` : ''}`);
}

export function getTransferByVisit(visitId) {
  return apiRequest(`/api/v1/clinic-hospital-transfer/visit/${visitId}`);
}

export function initiateClinicHospitalTransport(body) {
  return apiRequest('/api/v1/clinic-hospital-transfer/initiate', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function confirmClinicDeparture(body) {
  return apiRequest('/api/v1/clinic-hospital-transfer/confirm-departure', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function confirmDepartmentReceipt(body) {
  return apiRequest('/api/v1/clinic-hospital-transfer/confirm-receipt', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
