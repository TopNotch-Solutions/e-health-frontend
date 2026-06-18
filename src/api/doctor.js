import { apiRequest } from './client';

/** Doctor module routes are mounted at /api/v1/consultations in the backend. */
const BASE = '/api/v1/consultations';

export function createConsultation(body) {
  return apiRequest(BASE, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getConsultationsByVisit(visitId) {
  return apiRequest(`${BASE}/visit/${visitId}`);
}

export function updateConsultation(id, body) {
  return apiRequest(`${BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function createPrescription(body) {
  return apiRequest(`${BASE}/prescriptions`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function admitPatient(body) {
  return apiRequest(`${BASE}/admissions`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function dischargeVisit(visitId, body = {}) {
  return apiRequest(`${BASE}/visits/${visitId}/discharge`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function getAvailableBeds() {
  return apiRequest('/api/v1/wards/beds/available');
}

export function createLabOrder(body) {
  return apiRequest(`${BASE}/lab-requests`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function createSonarReferral(body) {
  return apiRequest(`${BASE}/sonar-requests`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function prescribeDiet(body) {
  return apiRequest(`${BASE}/diet-prescriptions`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function clinicScheduleFollowUp(body) {
  return apiRequest(`${BASE}/clinic/follow-up`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function clinicTransferEmergencyUnit(body) {
  return apiRequest('/api/v1/consultations/clinic/emergency-unit', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function clinicTransferBookingRoom(body) {
  return apiRequest(`${BASE}/clinic/booking-room`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function clinicDischargePatient(body) {
  return apiRequest(`${BASE}/clinic/discharge`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
