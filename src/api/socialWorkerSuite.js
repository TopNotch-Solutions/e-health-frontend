import { apiRequest } from './client';

export function getSocialWorkerHandover(visitId) {
  return apiRequest(`/api/v1/social-worker-suite/handover/${visitId}`);
}

export function saveSocialWorkerAssessment(body) {
  return apiRequest('/api/v1/social-worker-suite/save-assessment', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function completeSocialWorkerSession(body) {
  return apiRequest('/api/v1/social-worker-suite/complete-session', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function escalateSocialWorkerToBookingRoom(body) {
  return apiRequest('/api/v1/social-worker-suite/escalate-booking-room', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
