import { apiRequest } from './client';

export function getTransportQueue() {
  return apiRequest('/api/v1/transport/queue');
}

export function getTransportRequest(id) {
  return apiRequest(`/api/v1/transport/${id}`);
}

export function markTransportPickedUp(id) {
  return apiRequest(`/api/v1/transport/${id}/start`, { method: 'PUT' });
}

export function markTransportDelivered(id) {
  return apiRequest(`/api/v1/transport/${id}/complete`, { method: 'PUT' });
}
