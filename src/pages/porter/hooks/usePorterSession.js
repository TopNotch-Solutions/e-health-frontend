import { getStoredUser } from '../../../api/authSession';

export function getPorterProfileFromRole(roleName) {
  if (roleName === 'external_porter') {
    return {
      transportScope: 'external',
      roleTitle: 'External Porter (Ambulance)',
      queueHint: 'Ambulance pickups from referring clinics and hospitals',
    };
  }
  return {
    transportScope: 'internal',
    roleTitle: 'Internal Porter',
    queueHint: 'Patient moves within this hospital',
  };
}

export function usePorterSession() {
  const user = getStoredUser();
  const roleName = user?.role?.name || user?.role;
  const profile = getPorterProfileFromRole(roleName);
  const label =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || profile.roleTitle;
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'PT';

  return {
    user,
    porterLabel: label,
    initials,
    userId: user?.id ?? null,
    ...profile,
  };
}
