import { apiRequest } from './client';

export function getPapSmearHandover(visitId) {
  return apiRequest(`/api/v1/pap-smear-suite/handover/${visitId}`);
}

export function savePapSmearScreening(body) {
  return apiRequest('/api/v1/pap-smear-suite/save-screening', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function completePapSmearSession(body) {
  return apiRequest('/api/v1/pap-smear-suite/complete-session', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function escalatePapSmearToMasterDoctor(body) {
  return apiRequest('/api/v1/pap-smear-suite/escalate-master-doctor', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
