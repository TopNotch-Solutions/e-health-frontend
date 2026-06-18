import { apiRequest } from './client';

export function getVitalsByVisit(visitId) {
  return apiRequest(`/api/v1/vitals/visit/${visitId}`);
}

export function getHandoverVitals(visitId) {
  return apiRequest(`/api/v1/vitals/handover/${visitId}`);
}

export function getClinicalTimeline(visitId) {
  return apiRequest(`/api/v1/vitals/clinical-timeline/${visitId}`);
}

export function recordVitalsAndPushToDoctor(body) {
  return apiRequest('/api/v1/vitals/push-to-doctor', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function recordParameterNurseVitalsAndPush(body) {
  return apiRequest('/api/v1/vitals/parameter-nurse/push', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function recordScreeningNurseAssessmentAndPush(body) {
  return apiRequest('/api/v1/vitals/screening-nurse/push', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function dischargeParameterNursePatient(body) {
  return apiRequest('/api/v1/vitals/parameter-nurse/discharge', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function dischargeScreeningNursePatient(body) {
  return apiRequest('/api/v1/vitals/screening-nurse/discharge', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
