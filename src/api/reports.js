import { getAccessToken, ensureAccessTokenFresh, handleSessionExpired } from './authSession';
import { getApiBase, handleUnauthorized, apiRequest } from './client';
import { disconnectSocket } from './socket';

export const REPORTS_PAGE_SIZE = 20;

export const ISSUE_TYPE_OPTIONS = [
  { value: 'enquiry', label: 'Enquiry' },
  { value: 'issue', label: 'Issue' },
  { value: 'improvement', label: 'Improvement' },
];

export const REPORT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

async function fetchReportsPage(path, isRetry = false) {
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
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json().catch(() => ({}));

  if (res.status === 401) {
    await handleUnauthorized(isRetry);
    return fetchReportsPage(path, true);
  }

  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }

  return {
    rows: json.data || [],
    pagination: json.pagination || {
      page: 1,
      limit: REPORTS_PAGE_SIZE,
      total: (json.data || []).length,
      totalPages: 1,
    },
  };
}

function buildReportsQuery({ page = 1, limit = REPORTS_PAGE_SIZE, status } = {}) {
  const q = new URLSearchParams();
  q.set('page', String(page));
  q.set('limit', String(limit));
  if (status) q.set('status', status);
  return q.toString();
}

export function getMyReports({ page = 1, limit = REPORTS_PAGE_SIZE } = {}) {
  const qs = buildReportsQuery({ page, limit });
  return fetchReportsPage(`/api/v1/reports/mine?${qs}`);
}

export function getAdminReports({ status, page = 1, limit = REPORTS_PAGE_SIZE } = {}) {
  const qs = buildReportsQuery({ page, limit, status });
  return fetchReportsPage(`/api/v1/reports/admin?${qs}`);
}

export function updateAdminReport(id, payload) {
  return apiRequest(`/api/v1/reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function createUserReport({ issue_type, description, image }, isRetry = false) {
  if (!isRetry) {
    const ready = await ensureAccessTokenFresh();
    if (!ready) {
      disconnectSocket();
      handleSessionExpired();
      throw new Error('Session expired. Please sign in again.');
    }
  }

  const formData = new FormData();
  formData.append('issue_type', issue_type);
  formData.append('description', description);
  if (image) formData.append('image', image);

  const token = getAccessToken();
  const res = await fetch(`${getApiBase()}/api/v1/reports`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const json = await res.json().catch(() => ({}));

  if (res.status === 401) {
    await handleUnauthorized(isRetry);
    return createUserReport({ issue_type, description, image }, true);
  }

  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }
  return json.data;
}

export async function fetchReportAttachment(reportId, isRetry = false) {
  if (!isRetry) {
    const ready = await ensureAccessTokenFresh();
    if (!ready) {
      disconnectSocket();
      handleSessionExpired();
      throw new Error('Session expired. Please sign in again.');
    }
  }

  const token = getAccessToken();
  const res = await fetch(`${getApiBase()}/api/v1/reports/${reportId}/attachment`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (res.status === 401) {
    await handleUnauthorized(isRetry);
    return fetchReportAttachment(reportId, true);
  }

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || `Failed to load attachment (${res.status})`);
  }

  return res.blob();
}
