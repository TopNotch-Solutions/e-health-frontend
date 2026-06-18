import { apiRequest } from './client';

export function getMaternityStateHospitals() {
  return apiRequest('/api/v1/maternity/state-hospitals');
}

export function getMaternityConfig() {
  return apiRequest('/api/v1/maternity/config');
}

export function getMaternityMedicalHistory(patientId) {
  return apiRequest(`/api/v1/maternity/patients/${patientId}/medical-history`);
}

export function registerMaternityPatient(body) {
  return apiRequest('/api/v1/maternity/front-office/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function routeFromMaternityFrontOffice(body) {
  return apiRequest('/api/v1/maternity/front-office/route', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getMaternityEpisode(visitId) {
  return apiRequest(`/api/v1/maternity/episode/${visitId}`);
}

export function getAncSessions(visitId) {
  return apiRequest(`/api/v1/maternity/anc/${visitId}/sessions`);
}

export function completeAncSession(body) {
  return apiRequest('/api/v1/maternity/anc/complete', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getAnwRecords(visitId) {
  return apiRequest(`/api/v1/maternity/anw/${visitId}/records`);
}

export function signOffAnwDaily(body) {
  return apiRequest('/api/v1/maternity/anw/sign-off', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getPnwRecords(visitId) {
  return apiRequest(`/api/v1/maternity/pnw/${visitId}/records`);
}

export function signOffPnwDaily(body) {
  return apiRequest('/api/v1/maternity/pnw/sign-off', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getIcuRecords(visitId) {
  return apiRequest(`/api/v1/maternity/icu/${visitId}/records`);
}

export function signOffIcuDaily(body) {
  return apiRequest('/api/v1/maternity/icu/sign-off', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getNicuRecords(visitId) {
  return apiRequest(`/api/v1/maternity/nicu/${visitId}/records`);
}

export function registerNewborn(body) {
  return apiRequest('/api/v1/maternity/nicu/register-newborn', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
