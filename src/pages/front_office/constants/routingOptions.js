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

export function routingLabel(value) {
  return ROUTING_DESTINATIONS.find((d) => d.value === value)?.label || value;
}
