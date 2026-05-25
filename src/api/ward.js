import { apiRequest } from './client';

export function getWards() {
  return apiRequest('/api/v1/wards');
}

/** Ward supervisor live analytics (KPIs + chart series). */
export function getWardSupervisorMetrics() {
  return apiRequest('/api/v1/wards/supervisor-metrics');
}

export function getWardDashboard(wardId) {
  return apiRequest(`/api/v1/wards/${wardId}/dashboard`);
}

export function createWard(body) {
  return apiRequest('/api/v1/wards', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Toggle active/inactive (empty body) or pass { status: 'available' | 'out_of_service' }. */
export function updateBed(bedId, body = {}) {
  return apiRequest(`/api/v1/wards/beds/${bedId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/** Ward staff: patients awaiting arrival confirmation. */
export function getWardStaffQueue() {
  return apiRequest('/api/v1/wards/staff-queue');
}

export function getWardAdmission(admissionId) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}`);
}

export function confirmPatientArrival(admissionId, body = {}) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/confirm-arrival`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
