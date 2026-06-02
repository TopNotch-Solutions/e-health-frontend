import { submitButtonClass } from '../nurse/utils/submitButtonClasses';

export const NURSE_ROUTING_DESTINATIONS = [
  { value: 'pharmacy', label: 'Pharmacist', buttonClass: 'pharmacy' },
  { value: 'emergency_unit_doctor', label: 'Emergency Unit Doctor', buttonClass: 'primary' },
];

export function emptyEmergencyNurseForm() {
  return {
    interventions: '',
    notes: '',
    routing_destination: '',
  };
}

export function validateEmergencyNurseForm(form, hasPrescription) {
  const errors = {};
  if (!form.interventions?.trim()) errors.interventions = 'Clinical interventions are required.';
  if (!form.routing_destination) {
    errors.routing_destination = 'Select a routing destination.';
  } else if (form.routing_destination === 'pharmacy' && !hasPrescription) {
    errors.prescription = 'Add at least one medication to route to the pharmacist.';
  }
  return errors;
}

export function routeButtonClass(form) {
  const dest = NURSE_ROUTING_DESTINATIONS.find((d) => d.value === form.routing_destination);
  const variant = dest?.buttonClass === 'pharmacy' ? 'primary' : dest?.buttonClass === 'primary' ? 'primary' : 'lab';
  return submitButtonClass(variant === 'lab' ? 'lab' : 'primary');
}

export function routeButtonLabel(form, loading, hasPrescription) {
  if (loading) return 'Submitting…';
  if (form.routing_destination === 'pharmacy') {
    return hasPrescription ? 'Prescribe & route to Pharmacist' : 'Add medications to route to Pharmacist';
  }
  if (form.routing_destination === 'emergency_unit_doctor') {
    return 'Transfer to Emergency Unit Doctor';
  }
  return 'Submit & route patient';
}
