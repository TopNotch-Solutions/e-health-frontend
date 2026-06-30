import { apiRequest } from './client';

export function getWards() {
  return apiRequest('/api/v1/wards');
}

/** Ward supervisor live analytics (KPIs + chart series). */
export function getWardSupervisorMetrics() {
  return apiRequest('/api/v1/wards/supervisor-metrics');
}

export function getWardDashboard(wardId) {
  return apiRequest(`/api/v1/wards/${wardId}/dashboard`);
}

export function createWard(body) {
  return apiRequest('/api/v1/wards', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Toggle active/inactive (empty body) or pass { status: 'available' | 'out_of_service' }. */
export function updateBed(bedId, body = {}) {
  return apiRequest(`/api/v1/wards/beds/${bedId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/** Ward staff: patients awaiting arrival confirmation. */
export function getWardStaffQueue() {
  return apiRequest('/api/v1/wards/staff-queue');
}

export function getWardAdmission(admissionId) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}`);
}

export function confirmPatientArrival(admissionId, body = {}) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/confirm-arrival`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/** Available beds, optionally filtered by ward_type (e.g. general). */
export function getAvailableBeds(wardType) {
  const qs = wardType ? `?ward_type=${encodeURIComponent(wardType)}` : '';
  return apiRequest(`/api/v1/wards/beds/available${qs}`);
}

/** ICU: patients currently admitted in ICU. */
export function getIcuAdmittedPatients() {
  return apiRequest('/api/v1/wards/icu/admitted');
}

export function getIcuDailyRecords(admissionId) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/icu-records`);
}

export function saveIcuDailyRecord(admissionId, body) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/icu-records`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function transferIcuToGeneralWard(admissionId, body) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/transfer/general`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function transferIcuToMortuary(admissionId, body) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/transfer/mortuary`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Surgical complex: patients needing today's daily record. */
export function getSurgicalComplexAdmittedPatients() {
  return apiRequest('/api/v1/wards/surgical-complex/admitted');
}

export function getSurgicalComplexDailyRecords(admissionId) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/surgical-complex-records`);
}

export function saveSurgicalComplexDailyRecord(admissionId, body) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/surgical-complex-records`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function transferSurgicalComplexToWard(admissionId, body) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/surgical-complex/transfer`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function transferSurgicalComplexToMortuary(admissionId, body) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/surgical-complex/transfer/mortuary`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Specialized inpatient */
export function getSpecializedInpatientAdmittedPatients() {
  return apiRequest('/api/v1/wards/specialized-inpatient/admitted');
}

export function getSpecializedInpatientDailyRecords(admissionId) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/specialized-inpatient-records`);
}

export function saveSpecializedInpatientDailyRecord(admissionId, body) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/specialized-inpatient-records`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function transferSpecializedInpatientToWard(admissionId, body) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/specialized-inpatient/transfer`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function dischargeSpecializedInpatientPatient(admissionId, body) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/specialized-inpatient/discharge`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function transferSpecializedInpatientToMortuary(admissionId, body) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/specialized-inpatient/transfer/mortuary`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Adult outpatient */
export function getAdultOutpatientAdmittedPatients() {
  return apiRequest('/api/v1/wards/adult-outpatient/admitted');
}

export function getAdultOutpatientDailyRecords(admissionId) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/adult-outpatient-records`);
}

export function saveAdultOutpatientDailyRecord(admissionId, body) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/adult-outpatient-records`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function transferAdultOutpatientToWard(admissionId, body) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/adult-outpatient/transfer`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function dischargeAdultOutpatientPatient(admissionId, body) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/adult-outpatient/discharge`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function transferAdultOutpatientToMortuary(admissionId, body) {
  return apiRequest(`/api/v1/wards/admissions/${admissionId}/adult-outpatient/transfer/mortuary`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
