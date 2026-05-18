export function patientName(p) {
  if (!p) return 'Unknown';
  return [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unknown';
}

export function formatDob(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function maskId(id) {
  if (!id || id.length < 4) return id || '—';
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

export function mapSexToApi(value) {
  if (value === 'f' || value === 'female') return 'female';
  if (value === 'm' || value === 'male') return 'male';
  return 'other';
}

export const REGISTRATION_STORAGE_KEY = 'fo_registration_draft';
export const REGISTRATION_ALLOWED_KEY = 'fo_registration_allowed';
