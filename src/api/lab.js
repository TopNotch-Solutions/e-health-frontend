import { apiRequest } from './client';

export function getLabTestCatalog() {
  return apiRequest('/api/v1/lab/tests');
}

export function getLabQueue() {
  return apiRequest('/api/v1/lab/queue');
}

export function getLabRequest(id) {
  return apiRequest(`/api/v1/lab/request/${id}`);
}

export function startLabProcessing(id) {
  return apiRequest(`/api/v1/lab/requests/${id}/processing`, { method: 'PUT' });
}

export function submitLabResults(id, body) {
  return apiRequest(`/api/v1/lab/requests/${id}/results`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function getLabResultsByVisit(visitId) {
  return apiRequest(`/api/v1/lab/visit/${visitId}`);
}
