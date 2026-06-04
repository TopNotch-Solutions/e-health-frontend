import { apiRequest } from './client';

export function getPrepSuiteHandover(visitId) {
  return apiRequest(`/api/v1/hiv-art/prep-suite/handover/${visitId}`);
}

export function recordPrepInjection(body) {
  return apiRequest('/api/v1/hiv-art/prep-suite/record-injection', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function completePrepSession(body) {
  return apiRequest('/api/v1/hiv-art/prep-suite/complete-session', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getPatientPrepHistory(patientId) {
  return apiRequest(`/api/v1/hiv-art/patients/${patientId}/prep-history`);
}
