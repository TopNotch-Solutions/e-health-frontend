import { apiRequest } from './client';

export function getDermatologistHandover(visitId) {
  return apiRequest(`/api/v1/dermatologist/handover/${visitId}`);
}

export function saveDermatologistObservations(body) {
  return apiRequest('/api/v1/dermatologist/save-observations', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function completeDermatologistSession(body) {
  return apiRequest('/api/v1/dermatologist/complete-session', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function routeDermatologistToPharmacy(body) {
  return apiRequest('/api/v1/dermatologist/route-to-pharmacy', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function routeDermatologistToBooking(body) {
  return apiRequest('/api/v1/dermatologist/route-to-booking', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
