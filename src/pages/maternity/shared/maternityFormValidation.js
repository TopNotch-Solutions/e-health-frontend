import { normalizeBaselineList } from './ancFormUtils';

function requiredText(value, label) {
  if (!String(value || '').trim()) return `${label} is required.`;
  return null;
}

export function validateAncForm(form, ancContext) {
  const isFirstVisit = ancContext?.is_first_visit === true;
  const hivOnRecord = Boolean(ancContext?.hiv_positive_on_record);

  if (isFirstVisit) {
    if (normalizeBaselineList(form.baseline_obstetric).length === 0) {
      return 'Add at least one obstetric history entry.';
    }
    if (normalizeBaselineList(form.baseline_gynae).length === 0) {
      return 'Add at least one gynae history entry.';
    }
    if (normalizeBaselineList(form.baseline_past_medical).length === 0) {
      return 'Add at least one past medical history entry.';
    }
  }

  if (!hivOnRecord && !form.hiv_result) {
    return 'HIV panel result is required (select negative or positive).';
  }

  if (!form.no_further_session_required) {
    const followUpError = requiredText(form.follow_up_date, 'Follow-up date');
    if (followUpError) return followUpError;
  }

  return null;
}

export function validateAnwForm(form) {
  if (form.is_admission_day) {
    const reasonError = requiredText(form.admission_reason, 'Reason for admission');
    if (reasonError) return reasonError;
    if (!form.mode_of_arrival) return 'Mode of arrival is required on admission day.';
  }
  return null;
}

export function validatePnwForm(form) {
  if (form.is_post_delivery_day) {
    const deliveryError = requiredText(form.delivery_type, 'Delivery type');
    if (deliveryError) return deliveryError;
    const recoveryError = requiredText(form.post_op_recovery, 'Post-op recovery');
    if (recoveryError) return recoveryError;
  }
  if (form.routing_destination === 'discharge') {
    if (!form.feeding_counselling_done) {
      return 'Confirm feeding counselling review before discharge.';
    }
    const followUpError = requiredText(form.six_week_follow_up_date, '6-week follow-up date');
    if (followUpError) return followUpError;
  }
  return null;
}

export function validateNicuForm(form) {
  const dobError = requiredText(form.date_time_of_birth, 'Date and time of birth');
  if (dobError) return dobError;
  if (!form.sex) return 'Sex is required.';
  return null;
}

export function validateFrontOfficeForm(form) {
  const firstError = requiredText(form.first_name, 'First name');
  if (firstError) return firstError;
  const lastError = requiredText(form.last_name, 'Last name');
  if (lastError) return lastError;
  if (!form.routing_destination) return 'Select a routing destination.';
  return null;
}

export function validateClinicalForm(formType, form, ancContext) {
  switch (formType) {
    case 'anc':
      return validateAncForm(form, ancContext);
    case 'anw':
      return validateAnwForm(form);
    case 'pnw':
      return validatePnwForm(form);
    case 'nicu':
      return validateNicuForm(form);
    default:
      return null;
  }
}
