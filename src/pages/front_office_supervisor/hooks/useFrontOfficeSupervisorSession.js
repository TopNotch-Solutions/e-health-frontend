import { getStoredUser } from '../../../api/authSession';

export function useFrontOfficeSupervisorSession() {
  const user = getStoredUser();
  const label =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
    'Front office supervisor';
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'FS';

  return { user, supervisorLabel: label, initials };
}
