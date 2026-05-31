/**
 * Maps backend `user.role` (Role.name, snake_case) to the app home path after login.
 * Keep in sync with `App.js` route paths.
 */
const ROLE_HOME_PATHS = {
  front_office: '/front_office',
  front_office_supervisor: '/front_office_supervisor',
  nurse: '/nurse',
  parameter_nurse: '/parameter_nurse',
  screening_nurse: '/screening_nurse',
  master_doctor: '/clinic_doctor',
  nurse_supervisor: '/nurse_supervisor',
  doctor: '/doctor',
  doctor_supervisor: '/doctor_supervisor',
  pharmacist: '/pharmacist',
  pharmacy_supervisor: '/pharmacy_supervisor',
  lab_technician: '/lab_technician',
  laboratory_supervisor: '/laboratory_supervisor',
  radiologist: '/radiologist',
  radiologist_supervisor: '/radiologist_supervisor',
  ward_supervisor: '/ward_supervisor',
  ward_staff: '/ward_staff',
  porter: '/porter',
  kitchen_staff: '/kitchen_staff',
  kitchen_manager: '/kitchen_manager',
  billing_clerk: '/billing_clerk',
  revenue_officer: '/revenue_officer',
  mortuary_staff: '/mortuary_staff',
  social_worker: '/social_worker',
  data_analyst: '/data_analyst',
  system_admin: '/system_admin',
  executive: '/executive',
};

/** Resolve role slug from login /me payload (string, nested role, or snake_case alias). */
export function authRoleSlug(user) {
  if (!user || typeof user !== 'object') return '';
  if (typeof user.role === 'string' && user.role.trim()) return user.role.trim();
  if (typeof user.role_name === 'string' && user.role_name.trim()) return user.role_name.trim();
  if (user.role && typeof user.role === 'object' && typeof user.role.name === 'string') {
    return user.role.name.trim();
  }
  return '';
}

/** Role required for a module path (longest prefix wins). */
export function requiredRoleForPath(pathname) {
  const path = (pathname || '').split('?')[0];
  const entries = Object.entries(ROLE_HOME_PATHS).sort((a, b) => b[1].length - a[1].length);
  for (const [role, prefix] of entries) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return role;
    }
  }
  return null;
}

export function isRoleAllowedForPath(pathname, user) {
  const required = requiredRoleForPath(pathname);
  if (!required) return true;
  const slug = authRoleSlug(user).toLowerCase();
  return slug === required;
}

export function homePathForRole(roleName) {
  const raw =
    typeof roleName === 'string'
      ? roleName.trim()
      : roleName && typeof roleName === 'object' && typeof roleName.name === 'string'
        ? roleName.name.trim()
        : '';
  const key = raw.toLowerCase();
  if (!key) return '/front_office';
  const path = ROLE_HOME_PATHS[key];
  return path || '/front_office';
}

/** When the API is unreachable (e.g. no backend / CORS), infer home from email for local UI demos only. */
export function demoHomePathFromEmail(email) {
  const e = (email || '').toLowerCase().trim();
  if (!e) return '/front_office';
  if (e.includes('nurse')) return '/nurse';
  if (e.includes('doctor')) return '/doctor';
  if (e.includes('front')) return '/front_office';
  if (e.includes('admin')) return '/system_admin';
  const local = e.split('@')[0] || '';
  if (local) {
    const guessed = local.replace(/\./g, '_');
    const path = ROLE_HOME_PATHS[guessed];
    if (path) return path;
  }
  return '/front_office';
}
