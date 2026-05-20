import { getStoredUser } from '../../../api/authSession';

export function useLabSession() {
  const user = getStoredUser();
  const label =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Lab technician';
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'LT';

  return { user, technicianLabel: label, initials, userId: user?.id ?? null };
}
