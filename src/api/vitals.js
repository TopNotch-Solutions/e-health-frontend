import { apiRequest } from './client';

export function getVitalsByVisit(visitId) {
  return apiRequest(`/api/v1/vitals/visit/${visitId}`);
}

export function recordVitalsAndPushToDoctor(body) {
  return apiRequest('/api/v1/vitals/push-to-doctor', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
