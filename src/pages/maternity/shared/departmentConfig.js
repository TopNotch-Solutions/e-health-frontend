/** Maternity station department configuration. */

export const MATERNITY_DEPARTMENTS = {
  FRONT_OFFICE: 'maternity_front_office',
  ANC: 'maternity_anc',
  ANW: 'maternity_anw',
  PNW: 'maternity_pnw',
  ICU: 'maternity_icu',
  NICU: 'maternity_nicu',
};

export const STATION_CONFIG = {
  maternity_front_officer: {
    department: MATERNITY_DEPARTMENTS.FRONT_OFFICE,
    title: 'Maternity Front Office',
    queueLabel: 'Front office queue',
    moduleLabel: 'Maternity Front Officer',
    isFrontOffice: true,
  },
  maternity_anc_staff: {
    department: MATERNITY_DEPARTMENTS.ANC,
    title: 'Antenatal Care (ANC)',
    queueLabel: 'ANC queue',
    moduleLabel: 'ANC Staff',
    formType: 'anc',
  },
  maternity_anw_staff: {
    department: MATERNITY_DEPARTMENTS.ANW,
    title: 'Antenatal Ward (ANW)',
    queueLabel: 'ANW queue',
    moduleLabel: 'ANW Staff',
    formType: 'anw',
    wardType: 'anw',
  },
  maternity_pnw_staff: {
    department: MATERNITY_DEPARTMENTS.PNW,
    title: 'Postnatal Ward (PNW)',
    queueLabel: 'PNW queue',
    moduleLabel: 'PNW Staff',
    formType: 'pnw',
    wardType: 'pnw',
  },
  maternity_icu_staff: {
    department: MATERNITY_DEPARTMENTS.ICU,
    title: 'Maternity ICU',
    queueLabel: 'ICU queue',
    moduleLabel: 'Maternity ICU Staff',
    formType: 'icu',
    wardType: 'icu',
  },
  maternity_nicu_staff: {
    department: MATERNITY_DEPARTMENTS.NICU,
    title: 'NICU',
    queueLabel: 'NICU queue',
    moduleLabel: 'NICU Staff',
    formType: 'nicu',
  },
};

export function configForRole(roleSlug) {
  return STATION_CONFIG[roleSlug] || null;
}

export { EMPTY_ANC_FORM } from './ancFormUtils';

export const EMPTY_ANW_FORM = {
  is_admission_day: false,
  admission_reason: '',
  mode_of_arrival: '',
  temperature: '',
  pulse: '',
  respiration: '',
  blood_pressure: '',
  urine: '',
  height_of_fundus: '',
  lie: '',
  presentation: '',
  position: '',
  cervical_dilation: '',
  effacement: '',
  foetal_heart_rate: '',
  contractions: '',
  clinical_assessment: '',
  treatment_alteration: '',
  sign_off_notes: '',
  routing_destination: '',
};

export const EMPTY_PNW_FORM = {
  is_post_delivery_day: false,
  delivery_type: '',
  post_op_recovery: '',
  temperature: '',
  pulse: '',
  respiration: '',
  systolic_bp: '',
  diastolic_bp: '',
  fundal_height: '',
  lochia_status: '',
  perineum_site: '',
  urine_passed: '',
  bowels: '',
  breast_examination: '',
  lower_limb_screening: '',
  routing_destination: '',
  feeding_counselling_done: false,
  six_week_follow_up_date: '',
};

export const EMPTY_ICU_FORM = {
  eclampsia_coma: false,
  hellp_syndrome: false,
  dic: false,
  septic_shock: false,
  inotropic_support: '',
  blood_gas_analysis: '',
  central_venous_pressure: '',
  renal_dialysis_metric: '',
  advanced_neurological_state: '',
  routing_destination: '',
};

export const EMPTY_NICU_FORM = {
  date_time_of_birth: '',
  sex: 'female',
  name: '',
  gestation_weeks: '',
  clinical_status: '',
  apgar_1min: '',
  apgar_5min: '',
  apgar_10min: '',
};

export const EMPTY_REGISTRATION = {
  first_name: '',
  last_name: '',
  sex: 'female',
  date_of_birth: '',
  id_number: '',
  phone: '',
  address: '',
  payment_type: 'state',
  routing_destination: 'maternity_anc',
};
