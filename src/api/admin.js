import { getAccessToken } from './authSession';
import { apiRequest, getApiBase } from './client';

async function apiRequestFull(path, options = {}) {
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
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }
  return json;
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
