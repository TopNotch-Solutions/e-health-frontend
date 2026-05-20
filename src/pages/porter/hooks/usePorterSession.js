import { getStoredUser } from '../../../api/authSession';

export function usePorterSession() {
  const user = getStoredUser();
  const label =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Porter';
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'PT';

  return { user, porterLabel: label, initials, userId: user?.id ?? null };
}
