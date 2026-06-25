import { submitButtonClass } from '../nurse/utils/submitButtonClasses';

export const FINAL_DISPOSITIONS = [
  { value: 'state_hospital', label: 'Transfer to State Hospital', variant: 'primary' },
  { value: 'mortuary', label: 'Process to Mortuary', variant: 'emergency' },
];

export const DERMATOLOGIST_PATHWAY_DISPOSITIONS = [
  { value: 'state_hospital', label: 'Transfer to State Hospital', variant: 'primary' },
];

const DEPARTED_TRANSFER_STATUSES = [
  'departed_clinic',
  'arrived_hospital',
  'internal_in_transit',
  'delivered_to_department',
  'received',
];

export function dispositionsForHandover(handover) {
  if (handover?.pathwayRestricted) {
    return handover.allowedDispositions?.length
      ? handover.allowedDispositions.map((d) => ({
        value: d.value,
        label: d.label,
        variant: d.buttonClass === 'emergency' ? 'emergency' : 'primary',
      }))
      : DERMATOLOGIST_PATHWAY_DISPOSITIONS;
  }
  return FINAL_DISPOSITIONS;
}

export function emptyBookingForm() {
  return {
    disposition: '',
    destination_facility_id: '',
    notes: '',
    cause_of_death: '',
    date_of_death: '',
  };
}

/** Transfer reason captured upstream when the patient was sent to booking room. */
export function resolveBookingTransferReason(handover) {
  const transfer = handover?.transferPlan;
  if (transfer?.transfer_reason?.trim()) return transfer.transfer_reason.trim();

  const consultation = handover?.consultation;
  if (consultation?.diagnosis?.trim()) {
    const parts = [consultation.diagnosis.trim()];
    if (consultation.notes?.trim()) parts.push(consultation.notes.trim());
    return parts.join(' — ');
  }
  if (consultation?.notes?.trim()) return consultation.notes.trim();

  const dermatology = handover?.dermatologyAssessment;
  if (dermatology?.clinical_observations?.trim()) return dermatology.clinical_observations.trim();

  const socialWorker = handover?.socialWorkerAssessment;
  if (socialWorker?.clinical_notes?.trim()) return socialWorker.clinical_notes.trim();

  return '';
}

/** What the single Submit button will do for the current patient. */
export function getBookingSubmitMode(handover, form) {
  const transfer = handover?.transferPlan;
  if (transfer) {
    const status = transfer.transfer_status;
    if (status === 'pending_booking') return 'initiate_transport';
    if (['transport_initiated', 'external_in_transit'].includes(status)) return 'confirm_departure';
    if (DEPARTED_TRANSFER_STATUSES.includes(status)) return 'complete_session';
    return null;
  }
  if (form.disposition === 'mortuary') return 'mortuary';
  if (form.disposition === 'state_hospital') return 'legacy_hospital';
  return null;
}

export function canSubmitBooking(handover, form, { stateHospitalsLoading = false } = {}) {
  const mode = getBookingSubmitMode(handover, form);
  if (!mode) return false;
  if (mode === 'initiate_transport') {
    return Boolean(form.destination_facility_id) && !stateHospitalsLoading;
  }
  if (mode === 'confirm_departure' || mode === 'complete_session') return true;
  if (mode === 'legacy_hospital') {
    return Boolean(form.destination_facility_id);
  }
  if (mode === 'mortuary') return Boolean(form.date_of_death);
  return false;
}

export function bookingSubmitLabel(handover, form, loading) {
  if (loading) return 'Submitting…';
  const mode = getBookingSubmitMode(handover, form);
  if (mode === 'initiate_transport') return 'Initiate transport';
  if (mode === 'confirm_departure') return 'Confirm patient departed clinic';
  if (mode === 'complete_session') return 'Complete booking session';
  if (mode === 'mortuary') return 'Confirm process to Mortuary';
  if (mode === 'legacy_hospital') return 'Confirm transfer to State Hospital';
  return 'Submit';
}

export function bookingSubmitButtonClass(handover, form) {
  const mode = getBookingSubmitMode(handover, form);
  if (mode === 'mortuary') return submitButtonClass('emergency');
  return submitButtonClass('primary');
}

export function dispositionButtonClass(disposition) {
  const opt = FINAL_DISPOSITIONS.find((d) => d.value === disposition);
  return submitButtonClass(opt?.variant || 'primary');
}

export function dispositionButtonLabel(form, loading) {
  return bookingSubmitLabel(null, form, loading);
}
