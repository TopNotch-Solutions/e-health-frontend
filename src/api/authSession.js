const API_BASE = process.env.REACT_APP_API_URL || 'https://api-health.kopanovertex.com';

export function getAccessToken() {
  return localStorage.getItem('accessToken');
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
