import { apiRequest } from './client';

export function getExecutivePanel(moduleKey) {
  return apiRequest(`/api/v1/executive/panel/${moduleKey}`);
}
