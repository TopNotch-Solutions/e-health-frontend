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

export function getBillingReceipt(billId) {
  return apiRequest(`${BASE}/receipt/${billId}`);
}

export function getBillingFees() {
  return apiRequest(`${BASE}/fees`);
}

export function updateBillingFee(feeKey, amount, reason) {
  return apiRequest(`${BASE}/fees/${feeKey}`, {
    method: 'PUT',
    body: JSON.stringify({ amount, reason }),
  });
}
