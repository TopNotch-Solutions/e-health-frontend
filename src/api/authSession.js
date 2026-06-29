const API_BASE = 'http://localhost:5000';

/** Seconds before JWT `exp` to treat the access token as expired (refresh early). */
const TOKEN_EXPIRY_SKEW_MS = 5000;

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(normalized);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token = getAccessToken(), skewMs = TOKEN_EXPIRY_SKEW_MS) {
  if (!token) return true;
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000 - skewMs;
}

export function accessTokenExpiresInMs(token = getAccessToken()) {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000 - Date.now();
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

let sessionRedirectPending = false;

/**
 * Send the user to the login page (full navigation so all modules reset).
 */
export function redirectToLogin() {
  const path = window.location.pathname;
  if (path === '/login' || path === '/') return;
  if (sessionRedirectPending) return;
  sessionRedirectPending = true;

  const from = encodeURIComponent(path + window.location.search);
  window.location.replace(`/login?expired=1&from=${from}`);
}

/** Clear stored credentials and redirect to login. */
export function handleSessionExpired() {
  clearSession();
  redirectToLogin();
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok || !json.success || !json.data?.accessToken) {
    return null;
  }

  localStorage.setItem('accessToken', json.data.accessToken);
  if (json.data.refreshToken) {
    localStorage.setItem('refreshToken', json.data.refreshToken);
  }
  return json.data.accessToken;
}

/**
 * Refresh when the access token is missing or expired; otherwise no-op.
 * @returns {Promise<boolean>} true when a usable access token is available
 */
export async function ensureAccessTokenFresh() {
  const token = getAccessToken();
  if (token && !isAccessTokenExpired(token)) return true;
  const refreshed = await refreshAccessToken();
  return Boolean(refreshed);
}
