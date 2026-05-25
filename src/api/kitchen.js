import { apiRequest } from './client';

const BASE = '/api/v1/kitchen';

export function getKitchenDashboard() {
  return apiRequest(`${BASE}/dashboard`);
}

export function getKitchenMealPlans(date) {
  const q = date ? `?date=${encodeURIComponent(date)}` : '';
  return apiRequest(`${BASE}/meal-plans${q}`);
}

export function markMealPrepared(mealPlanId) {
  return apiRequest(`${BASE}/meals/${mealPlanId}/prepared`, { method: 'PUT' });
}

export function markMealDispensed(mealPlanId) {
  return apiRequest(`${BASE}/meals/${mealPlanId}/dispensed`, { method: 'PUT' });
}
