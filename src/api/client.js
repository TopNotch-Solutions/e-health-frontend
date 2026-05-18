import { clearSession, getAccessToken, refreshAccessToken } from './authSession';

const API_BASE = process.env.REACT_APP_API_URL || 'https://api-health.kopanovertex.com';

export function getApiBase() {
  return API_BASE;
}

function buildHeaders(extra = {}) {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function apiRequest(path, options = {}, isRetry = false) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...buildHeaders(), ...options.headers },
    });
  } catch (networkErr) {
    const err = new Error(
      `Cannot reach the API at ${API_BASE}. Start the backend (npm start in /backend), then sign in again.`
    );
    err.cause = networkErr;
    err.isNetworkError = true;
    throw err;
  }

  const json = await res.json().catch(() => ({}));

  if (res.status === 401 && !isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest(path, options, true);
    }
    clearSession();
    const err = new Error('Session expired. Please sign in again.');
    err.status = 401;
    err.requiresLogin = true;
    throw err;
  }

  if (!res.ok || json.success === false) {
    let message = json.message || `Request failed (${res.status})`;
    if (res.status === 401) {
      message = 'Sign in required. Use your hospital account at the login page.';
    }
    if (res.status === 403) {
      message = json.message || 'You do not have permission for this action.';
    }
    const err = new Error(message);
    err.status = res.status;
    if (res.status === 401) err.requiresLogin = true;
    throw err;
  }

  return json.data;
}
