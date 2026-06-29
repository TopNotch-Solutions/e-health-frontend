import { apiRequest, getApiBase, handleUnauthorized } from './client';
import { ensureAccessTokenFresh, getAccessToken, handleSessionExpired } from './authSession';
import { disconnectSocket } from './socket';

async function fetchAdminAuditLogs(params = {}, isRetry = false) {
  if (!isRetry) {
    const ready = await ensureAccessTokenFresh();
    if (!ready) {
      disconnectSocket();
      handleSessionExpired();
      throw new Error('Session expired. Please sign in again.');
    }
  }

  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.resource) q.set('resource', params.resource);
  if (params.action) q.set('action', params.action);
  const qs = q.toString();
  const token = getAccessToken();
  const res = await fetch(`${getApiBase()}/api/v1/admin/audit-logs${qs ? `?${qs}` : ''}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json().catch(() => ({}));

  if (res.status === 401) {
    await handleUnauthorized(isRetry);
    return fetchAdminAuditLogs(params, true);
  }

  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }
  return { rows: json.data || [], pagination: json.pagination };
}

export function getIcd10AuditLogs(params = {}) {
  return fetchAdminAuditLogs({ ...params, resource: 'icd10' });
}

export function searchIcd10Codes(query, { limit = 20 } = {}) {
  const q = new URLSearchParams();
  if (query) q.set('q', query);
  if (limit) q.set('limit', String(limit));
  const qs = q.toString();
  return apiRequest(`/api/v1/icd10${qs ? `?${qs}` : ''}`);
}

export function getIcd10ByCode(code) {
  return apiRequest(`/api/v1/icd10/${encodeURIComponent(code)}`);
}

export function listAdminIcd10Codes({ search, status, page = 1, limit = 50 } = {}) {
  const q = new URLSearchParams();
  if (search) q.set('q', search);
  if (status) q.set('status', status);
  if (page) q.set('page', String(page));
  if (limit) q.set('limit', String(limit));
  const qs = q.toString();
  return apiRequest(`/api/v1/icd10/manage${qs ? `?${qs}` : ''}`);
}

export function createIcd10Code({ code, description }) {
  return apiRequest('/api/v1/icd10', {
    method: 'POST',
    body: JSON.stringify({ code, description }),
  });
}

export function updateIcd10Status(id, { is_active }) {
  return apiRequest(`/api/v1/icd10/records/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active }),
  });
}

async function parseUploadResponse(res, file, isRetry = false) {
  const json = await res.json().catch(() => ({}));

  if (res.status === 401) {
    await handleUnauthorized(isRetry);
    return uploadIcd10Xlsx(file, true);
  }

  if (!res.ok || json.success === false) {
    const err = new Error(json.message || `Upload failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return json.data;
}

export async function uploadIcd10Xlsx(file, isRetry = false) {
  if (!isRetry) {
    const ready = await ensureAccessTokenFresh();
    if (!ready) {
      disconnectSocket();
      handleSessionExpired();
      throw new Error('Session expired. Please sign in again.');
    }
  }

  const formData = new FormData();
  formData.append('file', file);

  const token = getAccessToken();
  const res = await fetch(`${getApiBase()}/api/v1/icd10/import`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  return parseUploadResponse(res, file, isRetry);
}
