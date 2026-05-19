import { apiRequest } from './client';

export function createConsultation(body) {
  return apiRequest('/api/v1/doctor', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getConsultationsByVisit(visitId) {
  return apiRequest(`/api/v1/doctor/visit/${visitId}`);
}

export function createPrescription(body) {
  return apiRequest('/api/v1/doctor/prescriptions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function admitPatient(body) {
  return apiRequest('/api/v1/doctor/admissions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function dischargeVisit(visitId, body = {}) {
  return apiRequest(`/api/v1/doctor/visits/${visitId}/discharge`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function getAvailableBeds() {
  return apiRequest('/api/v1/ward/beds/available');
}
