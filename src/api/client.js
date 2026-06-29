import { getAccessToken, handleSessionExpired, refreshAccessToken, ensureAccessTokenFresh } from './authSession';
import { disconnectSocket } from './socket';

const API_BASE = 'http://localhost:5000';

export function getApiBase() {
  return API_BASE;
}

function sessionExpiredError() {
  const err = new Error('Session expired. Please sign in again.');
  err.status = 401;
  err.requiresLogin = true;
  return err;
}

export async function handleUnauthorized(isRetry = false) {
  if (!isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return true;
  }
  disconnectSocket();
  handleSessionExpired();
  throw sessionExpiredError();
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
  if (!isRetry) {
    const ready = await ensureAccessTokenFresh();
    if (!ready) {
      disconnectSocket();
      handleSessionExpired();
      throw sessionExpiredError();
    }
  }

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

  if (res.status === 401) {
    await handleUnauthorized(isRetry);
    return apiRequest(path, options, true);
  }

  if (!res.ok || json.success === false) {
    let message = json.message || `Request failed (${res.status})`;
    if (res.status === 403) {
      message = json.message || 'You do not have permission for this action.';
    }
    if (res.status === 429) {
      message = json.message || 'Too many requests. Please wait a moment and try again.';
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return json.data;
}
