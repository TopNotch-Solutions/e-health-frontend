import { apiRequest } from './client';

export function getNurseSupervisorMetrics() {
  return apiRequest('/api/v1/vitals/supervisor-metrics');
}

export function getDoctorSupervisorMetrics() {
  return apiRequest('/api/v1/consultations/supervisor-metrics');
}

export function getLaboratorySupervisorMetrics() {
  return apiRequest('/api/v1/lab/supervisor-metrics');
}

export function getRadiologistSupervisorMetrics() {
  return apiRequest('/api/v1/sonar/supervisor-metrics');
}
