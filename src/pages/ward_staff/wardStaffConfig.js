export const WARD_STAFF_ROLE_SLUGS = [
  'general_ward_nurse',
  'pediatric_ward_nurse',
  'icu_ward_nurse',
  'surgical_complex_nurse',
  'specialized_inpatient_nurse',
  'outpatient_specialist_nurse',
  'psychiatric_ward_nurse',
  'adult_outpatient_nurse',
];

const ROLE_LABELS = {
  ward_staff: 'Ward Staff',
  general_ward_nurse: 'General Ward Nurse',
  pediatric_ward_nurse: 'Pediatric Ward Nurse',
  icu_ward_nurse: 'ICU Nurse',
  surgical_complex_nurse: 'Surgical Complex Nurse',
  specialized_inpatient_nurse: 'Specialized Inpatient Nurse',
  outpatient_specialist_nurse: 'Outpatient Specialist Nurse',
  psychiatric_ward_nurse: 'Psychiatric Ward Nurse',
  adult_outpatient_nurse: 'Adult Outpatient Nurse',
};

const WARD_TYPE_BY_ROLE = {
  general_ward_nurse: 'general',
  pediatric_ward_nurse: 'pediatric',
  icu_ward_nurse: 'icu',
  surgical_complex_nurse: 'surgical_complex',
  specialized_inpatient_nurse: 'specialized_inpatient',
  outpatient_specialist_nurse: 'outpatient_specialist',
  psychiatric_ward_nurse: 'psychiatric',
  adult_outpatient_nurse: 'adult_outpatient',
};

const MODULE_LABEL_BY_ROLE = {
  ward_staff: 'Ward staff',
  general_ward_nurse: 'General ward',
  pediatric_ward_nurse: 'Pediatric ward',
  icu_ward_nurse: 'ICU',
  surgical_complex_nurse: 'Surgical complex',
  specialized_inpatient_nurse: 'Specialized inpatient',
  outpatient_specialist_nurse: 'Outpatient specialist',
  psychiatric_ward_nurse: 'Psychiatric ward',
  adult_outpatient_nurse: 'Adult outpatient',
};

export function wardTypeForStaffRole(roleName) {
  return WARD_TYPE_BY_ROLE[roleName] || null;
}

export function wardStaffModuleLabel(roleName) {
  return MODULE_LABEL_BY_ROLE[roleName] || 'Ward staff';
}

export function wardStaffRoleLabel(roleName) {
  return ROLE_LABELS[roleName] || 'Ward Staff';
}

export function isWardStaffRole(roleName) {
  return roleName === 'ward_staff' || WARD_STAFF_ROLE_SLUGS.includes(roleName);
}

export const ALL_WARD_STAFF_ROLES = ['ward_staff', ...WARD_STAFF_ROLE_SLUGS];
