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

export function getAdminDashboard() {
  return apiRequest('/api/v1/admin/dashboard');
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
  const qs = q.toString();
  const json = await apiRequestFull(`/api/v1/admin/users${qs ? `?${qs}` : ''}`);
  return { rows: json.data || [], pagination: json.pagination };
}

export function getAdminRoles() {
  return apiRequest('/api/v1/admin/roles');
}

export function createAdminUser(body) {
  return apiRequest('/api/v1/admin/users', {
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
