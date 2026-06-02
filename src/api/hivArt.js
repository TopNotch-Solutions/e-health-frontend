import { apiRequest } from './client';

export function getHivTesterHandover(visitId) {
  return apiRequest(`/api/v1/hiv-art/hiv-tester/handover/${visitId}`);
}

export function submitHivTestResult(body) {
  return apiRequest('/api/v1/hiv-art/hiv-tester/submit', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getArtNurseHandover(visitId) {
  return apiRequest(`/api/v1/hiv-art/art-nurse/handover/${visitId}`);
}

export function updateArtPathway(body) {
  return apiRequest('/api/v1/hiv-art/art-nurse/pathway', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function completeArtSession(body) {
  return apiRequest('/api/v1/hiv-art/art-nurse/complete-session', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
