import { getStoredUser } from '../../../api/authSession';

export function useWardStaffSession() {
  const user = getStoredUser();
  const label =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Ward staff';
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'WS';

  return { user, staffLabel: label, initials, userId: user?.id ?? null };
}
