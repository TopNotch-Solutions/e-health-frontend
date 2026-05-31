import { apiRequest } from './client';

export function getPharmacyInventory(params = {}) {
  const q = new URLSearchParams({ limit: '200', page: '1', ...params });
  return apiRequest(`/api/v1/inventory/pharmacy?${q}`);
}

export function getPharmacyAlerts() {
  return apiRequest('/api/v1/inventory/pharmacy/alerts');
}

export function getMedicationCatalog({ available } = {}) {
  const q = new URLSearchParams();
  if (available) q.set('available', 'true');
  const qs = q.toString();
  return apiRequest(`/api/v1/inventory/pharmacy/medication-catalog${qs ? `?${qs}` : ''}`);
}

/** Live stock check for prescribing (doctor / pharmacy). */
export function checkMedicationStock(medicationName, quantity = 1) {
  const q = new URLSearchParams({
    medication_name: medicationName,
    quantity: String(quantity),
  });
  return apiRequest(`/api/v1/inventory/pharmacy/stock-status?${q}`);
}

export function getPharmacySupervisorMetrics() {
  return apiRequest('/api/v1/inventory/pharmacy/supervisor-metrics');
}

export function getRecentPrescriptions(limit = 25) {
  return apiRequest(`/api/v1/inventory/pharmacy/recent-prescriptions?limit=${limit}`);
}

export function addMedication(body) {
  return apiRequest('/api/v1/inventory/pharmacy', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function receiveStock(inventoryId, body) {
  return apiRequest(`/api/v1/inventory/pharmacy/${inventoryId}/receive`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getPendingReceipts() {
  return apiRequest('/api/v1/inventory/pharmacy/pending-receipts');
}

export function getConfirmedReceipts(limit = 20) {
  return apiRequest(`/api/v1/inventory/pharmacy/confirmed-receipts?limit=${limit}`);
}

export function confirmStockReceipt(transactionId) {
  return apiRequest(`/api/v1/inventory/pharmacy/receipts/${transactionId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function updateMedication(inventoryId, body) {
  return apiRequest(`/api/v1/inventory/pharmacy/${inventoryId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
