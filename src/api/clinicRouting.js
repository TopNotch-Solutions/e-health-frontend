import { apiRequest } from './client';

/** Active clinic routing destinations for the signed-in user's facility. */
export function getClinicRoutingOptions() {
  return apiRequest('/api/v1/front-office/routing-options');
}
