import { getStoredUser } from '../../../api/authSession';
import { wardStaffModuleLabel, wardStaffRoleLabel } from '../wardStaffConfig';

export function useWardStaffSession() {
  const user = getStoredUser();
  const roleName = user?.role?.name || user?.role || 'ward_staff';
  const roleLabel = wardStaffRoleLabel(roleName);
  const moduleLabel = wardStaffModuleLabel(roleName);
  const label =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || roleLabel;
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'WS';

  return {
    user,
    roleName,
    roleLabel,
    moduleLabel,
    staffLabel: label,
    initials,
    userId: user?.id ?? null,
  };
}
