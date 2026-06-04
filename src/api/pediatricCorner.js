import { apiRequest } from './client';

export function getPediatricHandover(visitId) {
  return apiRequest(`/api/v1/pediatric-corner/handover/${visitId}`);
}

export function routePediatricToMasterDoctor(body) {
  return apiRequest('/api/v1/pediatric-corner/route-master-doctor', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
