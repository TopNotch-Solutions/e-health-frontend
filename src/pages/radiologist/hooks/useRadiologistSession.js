import { getStoredUser } from '../../../api/authSession';

export function useRadiologistSession() {
  const user = getStoredUser();
  const label =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Radiologist';
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'RD';

  return { user, radiologistLabel: label, initials };
}
