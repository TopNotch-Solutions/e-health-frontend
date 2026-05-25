import { apiRequest } from './client';

export function getSonarScanCatalog() {
  return apiRequest('/api/v1/sonar/scans');
}

export function getSonarQueue() {
  return apiRequest('/api/v1/sonar/queue');
}

export function getSonarRequest(id) {
  return apiRequest(`/api/v1/sonar/request/${id}`);
}

export function startSonarScan(id) {
  return apiRequest(`/api/v1/sonar/requests/${id}/start`, { method: 'PUT' });
}

export function saveSonarImaging(id, body) {
  return apiRequest(`/api/v1/sonar/requests/${id}/imaging`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function submitSonarResults(id, body) {
  return apiRequest(`/api/v1/sonar/requests/${id}/results`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function getSonarResultsByVisit(visitId) {
  return apiRequest(`/api/v1/sonar/visit/${visitId}`);
}
