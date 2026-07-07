import { apiRequest } from './client';

/** Pending / partially dispensed prescriptions for the pharmacy queue. */
export function getPharmacyQueue() {
  return apiRequest('/api/v1/prescriptions/queue');
}

/** Full prescription with consultation, visit, patient, and items. */
export function getPharmacyPrescription(id) {
  return apiRequest(`/api/v1/prescriptions/prescription/${id}`);
}

/**
 * @param {string} id prescription id
 * @param {Array<{ item_id: string, is_dispensed: boolean }>} dispensed_items
 */
export function dispensePrescription(id, dispensed_items) {
  return apiRequest(`/api/v1/prescriptions/dispense/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ dispensed_items }),
  });
}

/** Remove patient from pharmacy queue when all pending lines are out of stock. */
export function releaseOutOfStockPrescription(id) {
  return apiRequest(`/api/v1/prescriptions/release-out-of-stock/${id}`, {
    method: 'PUT',
  });
}

/** Stop a recurring medication schedule when the patient no longer needs it. */
export function stopRecurringSchedule(itemId) {
  return apiRequest(`/api/v1/prescriptions/items/${itemId}/stop-schedule`, {
    method: 'PUT',
  });
}
