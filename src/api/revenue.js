import { apiRequest } from './client';

export function getRevenueDashboard() {
  return apiRequest('/api/v1/revenue/dashboard');
}

export function getRevenueTransactions(period = 'daily') {
  return apiRequest(`/api/v1/revenue/transactions?period=${period}`);
}

export function getRevenueShifts(params = {}) {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  const qs = q.toString();
  return apiRequest(`/api/v1/revenue/shifts${qs ? `?${qs}` : ''}`);
}

export function getRevenueShift(id) {
  return apiRequest(`/api/v1/revenue/shifts/${id}`);
}

export function reconcileShift(id, body) {
  return apiRequest(`/api/v1/revenue/shifts/${id}/reconcile`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function getMyBillingShift() {
  return apiRequest('/api/v1/revenue/shifts/mine');
}
