/** Maternity front office routing destinations (mirrors backend FRONT_OFFICE_ROUTING). */
export const MATERNITY_ROUTING_DESTINATIONS = [
  { value: 'maternity_anc', label: 'ANC (Antenatal Care)' },
  { value: 'maternity_anw', label: 'ANW (Antenatal Ward)' },
];

export function maternityRoutingLabel(value) {
  return MATERNITY_ROUTING_DESTINATIONS.find((d) => d.value === value)?.label || value;
}

export function maternityRoutingButtonLabel({ destination, immediateTriage, loading, action = 'Route' }) {
  if (loading) return `${action}…`;
  if (immediateTriage) return `${action} to Maternity ICU`;
  if (destination) return `${action} to ${maternityRoutingLabel(destination)}`;
  return `${action} patient`;
}
