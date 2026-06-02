import { apiRequest } from './client';

export function getStateHospitalFacilities() {
  return apiRequest('/api/v1/booking-room/state-hospitals');
}

export function getBookingRoomHandover(visitId) {
  return apiRequest(`/api/v1/booking-room/handover/${visitId}`);
}

export function completeBookingRoomDisposition(body) {
  return apiRequest('/api/v1/booking-room/disposition', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
