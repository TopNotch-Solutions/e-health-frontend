import { apiRequest } from './client';

export function getFrontOfficeSupervisorMetrics() {
  return apiRequest('/api/v1/front-office/supervisor-metrics');
}
