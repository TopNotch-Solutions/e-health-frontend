import { getStoredUser } from '../../../api/authSession';

export function usePharmacistSession() {
  const user = getStoredUser();
  const label =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Pharmacist';
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'RX';

  return { user, pharmacistLabel: label, initials, userId: user?.id ?? null };
}
