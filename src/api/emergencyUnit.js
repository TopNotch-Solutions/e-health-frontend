import { apiRequest } from './client';

export function getEmergencyNurseHandover(visitId) {
  return apiRequest(`/api/v1/emergency-unit/nurse/handover/${visitId}`);
}

export function submitEmergencyNurseRoute(body) {
  return apiRequest('/api/v1/emergency-unit/nurse/submit', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getEmergencyDoctorHandover(visitId) {
  return apiRequest(`/api/v1/emergency-unit/doctor/handover/${visitId}`);
}

export function emergencyDoctorTransferBookingRoom(body) {
  return apiRequest('/api/v1/emergency-unit/doctor/booking-room', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function emergencyDoctorPrescribePharmacy(body) {
  return apiRequest('/api/v1/emergency-unit/doctor/pharmacy', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
