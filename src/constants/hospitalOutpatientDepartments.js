/** Hospital outpatient receiving departments — labels mirror backend config. */
export const HOSPITAL_OUTPATIENT_DEPARTMENTS = [
  { value: 'pediatric_outpatient', label: 'Pediatric Outpatient' },
  { value: 'ent_outpatient', label: 'Ear, Nose and Throat' },
  { value: 'hospital_emergency_unit', label: 'Emergency Unit' },
  { value: 'eye_outpatient', label: 'Eye' },
  { value: 'orthopedic_outpatient', label: 'Orthopedic Outpatient' },
  { value: 'adult_outpatient', label: 'Adult Outpatient' },
  { value: 'physiotherapy_rehabilitation', label: 'Physiotherapy and Rehabilitation' },
  { value: 'big_room_specialist', label: 'Big Room Specialist' },
  { value: 'urology_outpatient', label: 'Urology' },
  { value: 'mental_health_outpatient', label: 'Mental Health' },
];

const LABELS = Object.fromEntries(
  HOSPITAL_OUTPATIENT_DEPARTMENTS.map((d) => [d.value, d.label])
);

export function departmentLabel(value) {
  return LABELS[value] || value;
}

export const EQUIPMENT_MODES = [
  { value: 'wheelchair', label: 'Wheelchair' },
  { value: 'stretcher', label: 'Stretcher' },
  { value: 'bed', label: 'Hospital bed (full transfer)' },
  { value: 'walking', label: 'Walking / escort only' },
  { value: 'other', label: 'Other (see notes)' },
];

export const TRANSFER_STATUS_LABELS = {
  pending_booking: 'Awaiting booking room',
  transport_initiated: 'Transport requested',
  external_in_transit: 'Ambulance en route from clinic',
  departed_clinic: 'Departed clinic',
  arrived_hospital: 'Arrived at hospital',
  internal_in_transit: 'Internal porter delivering',
  delivered_to_department: 'Awaiting department receipt',
  received: 'Received in department',
  cancelled: 'Cancelled',
};
