/**
 * Maps backend `user.role` (Role.name, snake_case) to the app home path after login.
 * Keep in sync with `backend/config/roles.js` and `App.js` route paths.
 */

/** @type {Record<string, string>} role slug → default route after login */
const ROLE_HOME_PATHS = {
  front_office: '/front_office',
  front_office_supervisor: '/front_office_supervisor',
  nurse: '/nurse',
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
  general_ward_nurse: '/general_ward_nurse',
  pediatric_ward_nurse: '/pediatric_ward_nurse',
  icu_ward_nurse: '/icu_ward_nurse',
  surgical_complex_nurse: '/surgical_complex_nurse',
  specialized_inpatient_nurse: '/specialized_inpatient_nurse',
  outpatient_specialist_nurse: '/outpatient_specialist_nurse',
  psychiatric_ward_nurse: '/psychiatric_ward_nurse',
  porter: '/porter',
  internal_porter: '/internal_porter',
  external_porter: '/external_porter',
  kitchen_staff: '/kitchen_staff',
  kitchen_manager: '/kitchen_manager',
  billing_clerk: '/billing_clerk',
  revenue_officer: '/revenue_officer',
  mortuary_staff: '/mortuary_staff',
  social_worker: '/social_worker',
  data_analyst: '/data_analyst',
  system_admin: '/system_admin',
  executive: '/executive',
  parameter_nurse: '/parameter_nurse',
  screening_nurse: '/screening_nurse',
  anc_nurse: '/anc_nurse',
  pediatric_corner: '/pediatric_corner',
  prep_suite: '/prep_suite',
  pap_smear_suite: '/pap_smear_suite',
  family_planner: '/family_planner',
  hiv_tester: '/hiv_tester',
  art_nurse: '/art_nurse',
  emergency_unit_nurse: '/emergency_unit_nurse',
  emergency_unit_doctor: '/emergency_unit_doctor',
  booking_room: '/booking_room',
  master_doctor: '/clinic_doctor',
  dermatologist: '/dermatologist',
  maternity_front_officer: '/maternity_front_officer',
  maternity_anc_staff: '/maternity_anc_staff',
  maternity_anw_staff: '/maternity_anw_staff',
  maternity_pnw_staff: '/maternity_pnw_staff',
  maternity_icu_staff: '/maternity_icu_staff',
  maternity_nicu_staff: '/maternity_nicu_staff',
  pediatric_outpatient_nurse: '/pediatric_outpatient_nurse',
  ent_nurse: '/ent_nurse',
  hospital_emergency_nurse: '/hospital_emergency_nurse',
  eye_nurse: '/eye_nurse',
  orthopedic_outpatient_nurse: '/orthopedic_outpatient_nurse',
  adult_outpatient_nurse: '/adult_outpatient_nurse',
  physiotherapy_nurse: '/physiotherapy_nurse',
  big_room_specialist_nurse: '/big_room_specialist_nurse',
  urology_nurse: '/urology_nurse',
  mental_health_nurse: '/mental_health_nurse',
};

/** Legacy, informal, or queue-department slugs → canonical Role.name */
const ROLE_ALIASES = {
  fo: 'front_office',
  reception: 'front_office',
  front_office_super: 'front_office_supervisor',
  nurse_sup: 'nurse_supervisor',
  doctor_sup: 'doctor_supervisor',
  pharmacy_sup: 'pharmacy_supervisor',
  lab_tech: 'lab_technician',
  lab_supervisor: 'laboratory_supervisor',
  radiology: 'radiologist',
  radiology_supervisor: 'radiologist_supervisor',
  admin: 'system_admin',
  clinic_doctor: 'master_doctor',
  parameter: 'parameter_nurse',
  screening: 'screening_nurse',
  anc: 'anc_nurse',
  pediatric: 'pediatric_corner',
  prep: 'prep_suite',
  pap_smear: 'pap_smear_suite',
  family_planning: 'family_planner',
  hiv_test: 'hiv_tester',
  hiv_testing: 'hiv_tester',
  art: 'art_nurse',
  emergency_nurse: 'emergency_unit_nurse',
  emergency_unit: 'emergency_unit_nurse',
  eu_nurse: 'emergency_unit_nurse',
  emergency_doctor: 'emergency_unit_doctor',
  eu_doctor: 'emergency_unit_doctor',
  booking: 'booking_room',
  mortuary_booking: 'booking_room',
  dermatology: 'dermatologist',
  maternity_front: 'maternity_front_officer',
  maternity_anc: 'maternity_anc_staff',
  maternity_anw: 'maternity_anw_staff',
  maternity_pnw: 'maternity_pnw_staff',
  maternity_icu: 'maternity_icu_staff',
  maternity_nicu: 'maternity_nicu_staff',
};

/** Display labels — mirrors backend config/clinicRoles.js + hospital roles */
const ROLE_DISPLAY_NAMES = {
  front_office: 'Front Office / Reception',
  front_office_supervisor: 'Front Office Supervisor',
  nurse: 'Nurse',
  nurse_supervisor: 'Nurse Supervisor',
  doctor: 'Doctor',
  doctor_supervisor: 'Doctor Supervisor',
  pharmacist: 'Pharmacist',
  pharmacy_supervisor: 'Pharmacy Supervisor',
  lab_technician: 'Lab Technician',
  laboratory_supervisor: 'Laboratory Supervisor',
  radiologist: 'Radiologist',
  radiologist_supervisor: 'Radiologist Supervisor',
  ward_supervisor: 'Ward Supervisor',
  ward_staff: 'Ward Staff',
  general_ward_nurse: 'General Ward Nurse',
  pediatric_ward_nurse: 'Pediatric Ward Nurse',
  icu_ward_nurse: 'ICU Nurse',
  surgical_complex_nurse: 'Surgical Complex Nurse',
  specialized_inpatient_nurse: 'Specialized Inpatient Nurse',
  outpatient_specialist_nurse: 'Outpatient Specialist Nurse',
  psychiatric_ward_nurse: 'Psychiatric Ward Nurse',
  porter: 'Internal Porter',
  internal_porter: 'Internal Porter',
  external_porter: 'External Porter (Ambulance)',
  kitchen_staff: 'Kitchen Staff',
  kitchen_manager: 'Kitchen Manager',
  billing_clerk: 'Billing Clerk',
  revenue_officer: 'Revenue Officer',
  mortuary_staff: 'Mortuary Staff',
  social_worker: 'Social Worker',
  data_analyst: 'Data Analyst',
  system_admin: 'System Administrator',
  executive: 'Executive',
  parameter_nurse: 'Parameter Nurse',
  screening_nurse: 'Screening Nurse',
  anc_nurse: 'ANC Nurse',
  pediatric_corner: 'Pediatric Corner',
  prep_suite: 'PrEP Suite',
  pap_smear_suite: 'Pap Smear Suite',
  family_planner: 'Family Planner',
  hiv_tester: 'HIV Tester',
  art_nurse: 'ART Nurse',
  emergency_unit_nurse: 'Emergency Unit Nurse',
  emergency_unit_doctor: 'Emergency Unit Doctor',
  booking_room: 'Booking Room',
  master_doctor: 'Master Doctor',
  dermatologist: 'Dermatologist',
  maternity_front_officer: 'Maternity Front Officer',
  maternity_anc_staff: 'ANC Staff',
  maternity_anw_staff: 'ANW Staff',
  maternity_pnw_staff: 'PNW Staff',
  maternity_icu_staff: 'Maternity ICU Staff',
  maternity_nicu_staff: 'NICU Staff',
  pediatric_outpatient_nurse: 'Pediatric Outpatient Nurse',
  ent_nurse: 'ENT Nurse',
  hospital_emergency_nurse: 'Emergency Unit Nurse',
  eye_nurse: 'Eye Nurse',
  orthopedic_outpatient_nurse: 'Orthopedic Outpatient Nurse',
  adult_outpatient_nurse: 'Adult Outpatient Nurse',
  physiotherapy_nurse: 'Physiotherapy Nurse',
  big_room_specialist_nurse: 'Big Room Specialist Nurse',
  urology_nurse: 'Urology Nurse',
  mental_health_nurse: 'Mental Health Nurse',
};

export function normalizeRoleSlug(roleName) {
  const raw =
    typeof roleName === 'string'
      ? roleName.trim()
      : roleName && typeof roleName === 'object' && typeof roleName.name === 'string'
        ? roleName.name.trim()
        : '';
  const key = raw.toLowerCase();
  if (!key) return '';
  return ROLE_ALIASES[key] || key;
}

export function roleDisplayName(roleSlug) {
  const key = normalizeRoleSlug(roleSlug);
  if (!key) return 'Unknown role';
  return ROLE_DISPLAY_NAMES[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function roleAccessHint(roleSlug) {
  const key = normalizeRoleSlug(roleSlug);
  if (!key) {
    return 'Your account has no role assigned. Contact your system administrator.';
  }
  const label = roleDisplayName(key);
  const expected = ROLE_HOME_PATHS[key]
    ? `Expected role slug: "${key}" (${label}).`
    : `Role "${key}" is not configured in this app version.`;
  return `Your account role "${key}" (${label}) cannot open its module. ${expected} Ask a system administrator to verify your account and redeploy the latest frontend if needed.`;
}

/** Resolve role slug from login /me payload (string, nested role, or alias). */
export function authRoleSlug(user) {
  if (!user || typeof user !== 'object') return '';
  if (typeof user.role === 'string' && user.role.trim()) return normalizeRoleSlug(user.role);
  if (typeof user.role_name === 'string' && user.role_name.trim()) return normalizeRoleSlug(user.role_name);
  if (user.role && typeof user.role === 'object' && typeof user.role.name === 'string') {
    return normalizeRoleSlug(user.role.name);
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

export function hasHomePathForRole(roleName) {
  const key = normalizeRoleSlug(roleName);
  return Boolean(key && ROLE_HOME_PATHS[key]);
}

export function homePathForRole(roleName) {
  const key = normalizeRoleSlug(roleName);
  if (!key) return null;
  return ROLE_HOME_PATHS[key] || null;
}

/** All backend role slugs that have a frontend home route. */
export function allConfiguredRoleSlugs() {
  return Object.keys(ROLE_HOME_PATHS);
}

/** When the API is unreachable (e.g. no backend / CORS), infer home from email for local UI demos only. */
export function demoHomePathFromEmail(email) {
  const e = (email || '').toLowerCase().trim();
  const local = e.split('@')[0]?.replace(/\./g, '_') || '';
  if (local) {
    const path = homePathForRole(local);
    if (path) return path;
  }
  if (e.includes('front')) return '/front_office';
  if (e.includes('admin')) return '/system_admin';
  return '/front_office';
}
