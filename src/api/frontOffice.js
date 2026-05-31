import { apiRequest } from './client';

export function getFrontOfficeSupervisorMetrics() {
  return apiRequest('/api/v1/front-office/supervisor-metrics');
}

export function getFrontOfficeRoutingOptions() {
  return apiRequest('/api/v1/front-office/routing-options');
}

export function getMyRegistrationsToday() {
  return apiRequest('/api/v1/front-office/my-registrations');
}
