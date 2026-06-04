import { apiRequest } from './client';

export function getFamilyPlanningHandover(visitId) {
  return apiRequest(`/api/v1/family-planning-suite/handover/${visitId}`);
}

export function saveFamilyPlanningRecord(body) {
  return apiRequest('/api/v1/family-planning-suite/save-record', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function completeFamilyPlanningSession(body) {
  return apiRequest('/api/v1/family-planning-suite/complete-session', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function routeFamilyPlanningToPharmacy(body) {
  return apiRequest('/api/v1/family-planning-suite/route-pharmacy', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
