import { apiRequest } from './client';

export function getDepartmentQueue(department) {
  return apiRequest(`/api/v1/queue/${department}`);
}

export function startQueueEntry(entryId) {
  return apiRequest(`/api/v1/queue/${entryId}/start`, { method: 'PUT' });
}

export function releaseQueueEntry(entryId) {
  return apiRequest(`/api/v1/queue/${entryId}/release`, { method: 'PUT' });
}

export function completeQueueEntry(entryId, body = {}) {
  return apiRequest(`/api/v1/queue/${entryId}/complete`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
