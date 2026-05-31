export const SCREENING_DESTINATIONS = [
  { value: 'master_doctor', label: "Master Doctor's queue", buttonClass: 'primary' },
  { value: 'hiv_tester', label: 'HIV Testing Room', buttonClass: 'lab' },
  { value: 'emergency_unit', label: 'Emergency Unit', buttonClass: 'emergency' },
];

export function emptyScreeningForm() {
  return {
    symptoms: '',
    reason: '',
    diagnosis: '',
    routing_destination: '',
  };
}

export function validateScreeningForm(form) {
  const errors = {};
  if (!form.symptoms?.trim()) errors.symptoms = 'Required';
  if (!form.reason?.trim()) errors.reason = 'Required';
  if (!form.diagnosis?.trim()) errors.diagnosis = 'Required';
  if (!form.routing_destination) {
    errors.routing_destination = 'Select a routing destination.';
  } else if (!SCREENING_DESTINATIONS.some((d) => d.value === form.routing_destination)) {
    errors.routing_destination = 'Invalid routing destination.';
  }
  return errors;
}

export function isScreeningFormComplete(form) {
  if (!form.routing_destination) return false;
  return Object.keys(validateScreeningForm(form)).length === 0;
}

export function buildScreeningPayload(form, { visitId, queueEntryId }) {
  return {
    visit_id: visitId,
    queue_entry_id: queueEntryId,
    next_department: form.routing_destination,
    symptoms: form.symptoms.trim(),
    reason: form.reason.trim(),
    diagnosis: form.diagnosis.trim(),
  };
}

export function routingButtonLabel(form, loading) {
  if (loading) return 'Submitting…';
  if (!form.routing_destination) return 'Submit & route patient';
  const dest = SCREENING_DESTINATIONS.find((d) => d.value === form.routing_destination);
  return dest ? `Submit & route to ${dest.label}` : 'Submit & route patient';
}

const ROUTING_BTN_STRUCTURE =
  'w-full rounded-lg py-3 text-sm font-semibold text-white shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const ROUTING_BTN_COLORS = {
  primary: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500',
  lab: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
  emergency: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
};

export function routingButtonClass(form) {
  const dest = SCREENING_DESTINATIONS.find((d) => d.value === form.routing_destination);
  const colorKey = dest?.buttonClass || 'primary';
  return `${ROUTING_BTN_STRUCTURE} ${ROUTING_BTN_COLORS[colorKey]}`;
}

export function classificationLabel(value) {
  if (value === 'follow_up') return 'Follow-Up';
  if (value === 'sick') return 'Sick';
  return value || '—';
}
