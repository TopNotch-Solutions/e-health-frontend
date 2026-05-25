import { apiRequest } from './client';

const BASE = '/api/v1/billing';

export function getBillingQueue() {
  return apiRequest(`${BASE}/queue`);
}

export function getBillByVisit(visitId) {
  return apiRequest(`${BASE}/visit/${visitId}`);
}

export function recordPayment(body) {
  return apiRequest(`${BASE}/payment`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getBillingFees() {
  return apiRequest(`${BASE}/fees`);
}

export function updateBillingFee(feeKey, amount) {
  return apiRequest(`${BASE}/fees/${feeKey}`, {
    method: 'PUT',
    body: JSON.stringify({ amount }),
  });
}
