import { getStoredUser } from '../../../api/authSession';

export function usePharmacySupervisorSession() {
  const user = getStoredUser();
  const label =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
    'Pharmacy supervisor';
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'PS';

  return { user, supervisorLabel: label, initials };
}
