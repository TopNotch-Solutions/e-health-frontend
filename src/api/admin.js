import { getAccessToken, ensureAccessTokenFresh, handleSessionExpired } from './authSession';
import { apiRequest, getApiBase, handleUnauthorized } from './client';
import { disconnectSocket } from './socket';

async function apiRequestFull(path, options = {}, isRetry = false) {
  if (!isRetry) {
    const ready = await ensureAccessTokenFresh();
    if (!ready) {
      disconnectSocket();
      handleSessionExpired();
      throw new Error('Session expired. Please sign in again.');
    }
  }

  const token = getAccessToken();
  const res = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const json = await res.json().catch(() => ({}));

  if (res.status === 401) {
    await handleUnauthorized(isRetry);
    return apiRequestFull(path, options, true);
  }

  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }
  return json;
}

async function fetchBlobWithAuth(path, isRetry = false) {
  if (!isRetry) {
    const ready = await ensureAccessTokenFresh();
    if (!ready) {
      disconnectSocket();
      handleSessionExpired();
      throw new Error('Session expired. Please sign in again.');
    }
  }

  const token = getAccessToken();
  const res = await fetch(`${getApiBase()}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (res.status === 401) {
    await handleUnauthorized(isRetry);
    return fetchBlobWithAuth(path, true);
  }

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || `Request failed (${res.status})`);
  }

  return res;
}

export function getAdminDashboard(params = {}) {
  const q = new URLSearchParams();
  if (params.facility_id) q.set('facility_id', String(params.facility_id));
  const qs = q.toString();
  return apiRequest(`/api/v1/admin/dashboard${qs ? `?${qs}` : ''}`);
}

export function getAdminFacilities() {
  return apiRequest('/api/v1/admin/facilities');
}

export function createAdminFacility(body) {
  return apiRequest('/api/v1/admin/facilities', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getHospitalDepartmentCatalog() {
  return apiRequest('/api/v1/admin/hospital-departments/catalog');
}

export function getClinicDepartmentCatalog() {
  return apiRequest('/api/v1/admin/clinic-departments/catalog');
}

export function getFacilityDepartments(facilityId) {
  return apiRequest(`/api/v1/admin/facilities/${facilityId}/departments`);
}

export function getFacilityDepartmentDetail(facilityId, departmentKey) {
  return apiRequest(`/api/v1/admin/facilities/${facilityId}/departments/${departmentKey}`);
}

export function addFacilityDepartment(facilityId, body) {
  return apiRequest(`/api/v1/admin/facilities/${facilityId}/departments`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function removeFacilityDepartment(facilityId, departmentKey, body) {
  return apiRequest(`/api/v1/admin/facilities/${facilityId}/departments/${departmentKey}/remove`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function removeFacilityDepartments(facilityId, body) {
  return apiRequest(`/api/v1/admin/facilities/${facilityId}/departments/remove`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getFacilityBillingFees(facilityId) {
  return apiRequest(`/api/v1/admin/facilities/${facilityId}/billing-fees`);
}

export function getNationalBillingFees(scope) {
  return apiRequest(`/api/v1/admin/billing-prices/national?scope=${encodeURIComponent(scope)}`);
}

export function getNationalBillingFeeHistory(scope) {
  return apiRequest(`/api/v1/admin/billing-prices/national/history?scope=${encodeURIComponent(scope)}`);
}

export function updateNationalBillingFee(scope, feeKey, body) {
  return apiRequest(`/api/v1/admin/billing-prices/national/${feeKey}?scope=${encodeURIComponent(scope)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function getFacilityBillingFeeHistory(facilityId) {
  return apiRequest(`/api/v1/admin/facilities/${facilityId}/billing-fees/history`);
}

export function updateFacilityBillingFee(facilityId, feeKey, body) {
  return apiRequest(`/api/v1/admin/facilities/${facilityId}/billing-fees/${feeKey}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function getAdminUsers(params = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.role) q.set('role', params.role);
  if (params.facility_id) q.set('facility_id', params.facility_id);
  if (params.status) q.set('status', params.status);
  if (params.exclude_role) q.set('exclude_role', params.exclude_role);
  if (params.role_only) q.set('role_only', params.role_only);
  const qs = q.toString();
  const json = await apiRequestFull(`/api/v1/admin/users${qs ? `?${qs}` : ''}`);
  return { rows: json.data || [], pagination: json.pagination };
}

export function getAdminRoles(params = {}) {
  const q = new URLSearchParams();
  if (params.facility_id) q.set('facility_id', String(params.facility_id));
  if (params.context) q.set('context', params.context);
  const qs = q.toString();
  return apiRequest(`/api/v1/admin/roles${qs ? `?${qs}` : ''}`);
}

export function createAdminUser(body) {
  return apiRequest('/api/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function createAdminSystemAdmin(body) {
  return apiRequest('/api/v1/admin/system-admins', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAdminUser(id, body) {
  return apiRequest(`/api/v1/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function transferAdminEmployee(id, body) {
  return apiRequest(`/api/v1/admin/users/${id}/transfer`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getAdminEmployeeFacilityHistory(id) {
  return apiRequest(`/api/v1/admin/users/${id}/facility-history`);
}

export async function getAdminAuditLogs(params = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.resource) q.set('resource', params.resource);
  if (params.action) q.set('action', params.action);
  const qs = q.toString();
  const json = await apiRequestFull(`/api/v1/admin/audit-logs${qs ? `?${qs}` : ''}`);
  return { rows: json.data || [], pagination: json.pagination };
}

export function searchAdminPatients(params = {}) {
  const q = new URLSearchParams();
  if (params.id_number) q.set('id_number', params.id_number);
  if (params.date_of_birth) q.set('date_of_birth', params.date_of_birth);
  if (params.name) q.set('name', params.name);
  return apiRequest(`/api/v1/admin/patients/search?${q}`);
}

export function getAdminPatientMedicalHistory(patientId, { facility_id, scope = 'all' } = {}) {
  const q = new URLSearchParams();
  if (facility_id) q.set('facility_id', String(facility_id));
  if (scope) q.set('scope', scope);
  return apiRequest(`/api/v1/admin/patients/${patientId}/medical-history?${q}`);
}

export function getAdminMedicalCard(patientId, { visit_id } = {}) {
  const q = new URLSearchParams();
  if (visit_id) q.set('visit_id', visit_id);
  const qs = q.toString();
  return apiRequest(`/api/v1/admin/patients/${patientId}/medical-card${qs ? `?${qs}` : ''}`);
}

export async function downloadAdminMedicalHistoryExport(patientId, { facility_id, scope = 'all' } = {}) {
  const q = new URLSearchParams();
  if (facility_id) q.set('facility_id', String(facility_id));
  if (scope) q.set('scope', scope);
  const res = await fetchBlobWithAuth(
    `/api/v1/admin/patients/${patientId}/medical-history/export?${q}`
  );
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const filename = match?.[1] || `medical-card-${scope}.xlsx`;
  return { blob, filename };
}

export async function getAdminTransferTimelines(params = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.status) q.set('status', params.status);
  if (params.clinic_facility_id) q.set('clinic_facility_id', String(params.clinic_facility_id));
  if (params.hospital_facility_id) q.set('hospital_facility_id', String(params.hospital_facility_id));
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  const qs = q.toString();
  const json = await apiRequestFull(`/api/v1/admin/transfer-timelines${qs ? `?${qs}` : ''}`);
  return { rows: json.data || [], pagination: json.pagination };
}

export async function downloadAdminTransferTimelinesExport(params = {}) {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.clinic_facility_id) q.set('clinic_facility_id', String(params.clinic_facility_id));
  if (params.hospital_facility_id) q.set('hospital_facility_id', String(params.hospital_facility_id));
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  const res = await fetchBlobWithAuth(`/api/v1/admin/transfer-timelines/export?${q}`);
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const filename = match?.[1] || 'clinic-hospital-transfer-timelines.xlsx';
  return { blob, filename };
}
