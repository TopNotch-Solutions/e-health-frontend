/** Clinic front office queue routing destinations (mirrors backend config). */
export const ROUTING_DESTINATIONS = [
  { value: 'parameter_nurse', label: 'Parameter Nurse' },
  { value: 'anc_nurse', label: 'ANC Nurse' },
  { value: 'pediatric', label: 'Pediatric' },
  { value: 'prep', label: 'PrEP' },
  { value: 'pap_smear', label: 'Pap Smear' },
  { value: 'social_worker', label: 'Social Worker' },
  { value: 'pharmacy', label: 'Pharmacist' },
  { value: 'family_planning', label: 'Family Planning' },
];

/** Hospital state front office — nurse, pharmacy, emergency unit, and outpatient. */
export const HOSPITAL_ROUTING_DESTINATIONS = [
  { value: 'nurse', label: 'Nurse' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'hospital_emergency_unit', label: 'Emergency Unit' },
  { value: 'adult_outpatient', label: 'Outpatient' },
];

const PAP_SMEAR_DESTINATION = 'pap_smear';
const PEDIATRIC_DESTINATION = 'pediatric';
const PHARMACY_DESTINATION = 'pharmacy';
export const MAX_PEDIATRIC_AGE = 12;

export function isPharmacyRouting(destination) {
  return destination === PHARMACY_DESTINATION;
}

/** True when sex is male (API or registration form values). */
export function isMalePatient(sex) {
  if (!sex) return false;
  const value = String(sex).toLowerCase();
  return value === 'male' || value === 'm';
}

function ageFromDateOfBirth(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

/** True when patient is under 12 years (Pediatric Corner eligibility). */
export function isPediatricEligible(dateOfBirth) {
  const age = ageFromDateOfBirth(dateOfBirth);
  if (age == null) return false;
  return age < MAX_PEDIATRIC_AGE;
}

/** Format destination labels for help text, e.g. "nurse, pharmacy, or outpatient". */
export function formatRoutingDestinationList(destinations = []) {
  if (!destinations.length) return null;
  const labels = destinations.map((d) => d.label.toLowerCase());
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, or ${labels[labels.length - 1]}`;
}

/** Routing destinations available for a patient based on demographics and facility setup. */
export function getRoutingDestinationsForPatient({
  sex,
  dateOfBirth,
  facilityDestinations,
  isHospital = false,
  hasPendingMedication = false,
} = {}) {
  let base;
  if (facilityDestinations != null) {
    base = facilityDestinations;
  } else if (isHospital) {
    base = [];
  } else {
    base = ROUTING_DESTINATIONS;
  }
  return base.filter((destination) => {
    if (destination.value === PHARMACY_DESTINATION && !hasPendingMedication) {
      return false;
    }
    if (destination.value === PAP_SMEAR_DESTINATION && isMalePatient(sex)) {
      return false;
    }
    if (destination.value === PEDIATRIC_DESTINATION && !isPediatricEligible(dateOfBirth)) {
      return false;
    }
    return true;
  });
}

export function routingLabel(value, destinations = ROUTING_DESTINATIONS) {
  return destinations.find((d) => d.value === value)?.label
    || HOSPITAL_ROUTING_DESTINATIONS.find((d) => d.value === value)?.label
    || ROUTING_DESTINATIONS.find((d) => d.value === value)?.label
    || value;
}
