import Swal from 'sweetalert2';

const TEAL = '#0d9488';
const SLATE = '#64748b';

/**
 * @returns {Promise<boolean>} true when the user confirms
 */
export async function confirmAction({
  title,
  text,
  html,
  icon = 'question',
  confirmButtonText = 'Yes, proceed',
  cancelButtonText = 'Cancel',
  confirmButtonColor = TEAL,
}) {
  const result = await Swal.fire({
    title,
    text,
    html,
    icon,
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor: SLATE,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
  });
  return result.isConfirmed;
}

export async function alertAction({
  title,
  text,
  icon = 'warning',
}) {
  await Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: TEAL,
    confirmButtonText: 'OK',
  });
}

export async function confirmSignOut(moduleLabel = '') {
  return confirmAction({
    title: 'Sign out?',
    text: moduleLabel
      ? `You will leave ${moduleLabel} and return to the login screen.`
      : 'You will return to the login screen.',
    icon: 'question',
    confirmButtonText: 'Sign out',
  });
}

export async function confirmReturnToQueue(patientName, discardText = '') {
  const extra = discardText ? ` ${discardText}` : '';
  return confirmAction({
    title: 'Return to queue?',
    text: `Return ${patientName} to the waiting queue?${extra}`,
    icon: 'question',
    confirmButtonText: 'Return to queue',
  });
}

export async function confirmStartPatientSession(patientName, starting = true) {
  return confirmAction({
    title: starting ? 'Start session?' : 'Open session?',
    text: starting
      ? `Start session for ${patientName}? The patient will be marked in progress.`
      : `Resume the session for ${patientName}?`,
    icon: 'question',
    confirmButtonText: starting ? 'Start session' : 'Open session',
  });
}

/** ICU nurse: confirm physical arrival, bed occupancy, and today's vitals in one step. */
export async function confirmIcuArrivalAndSave(patientName) {
  return confirmAction({
    title: 'Confirm ICU arrival?',
    text: `Confirm ${patientName} has arrived in ICU, mark the bed as occupied, and save today's vitals record?`,
    icon: 'question',
    confirmButtonText: 'Confirm arrival & save',
  });
}

/** ICU nurse: save daily vitals after confirmation. */
export async function confirmIcuDailySave(patientName) {
  return confirmAction({
    title: 'Save ICU record?',
    text: `Save today's vitals and monitoring record for ${patientName}?`,
    icon: 'question',
    confirmButtonText: 'Save record',
  });
}

/** Surgical complex nurse: confirm arrival and first daily record in one step. */
export async function confirmSurgicalComplexArrivalAndSave(patientName) {
  return confirmAction({
    title: 'Confirm surgical complex arrival?',
    text: `Confirm ${patientName} has arrived in surgical complex, mark the bed as occupied, and save today's monitoring record?`,
    icon: 'question',
    confirmButtonText: 'Confirm arrival & save',
  });
}

/** Surgical complex nurse: save daily monitoring after confirmation. */
export async function confirmSurgicalComplexDailySave(patientName) {
  return confirmAction({
    title: 'Save surgical complex record?',
    text: `Save today's monitoring record for ${patientName}?`,
    icon: 'question',
    confirmButtonText: 'Save record',
  });
}

/** Specialized inpatient nurse: confirm arrival and first daily record in one step. */
export async function confirmSpecializedInpatientArrivalAndSave(patientName) {
  return confirmAction({
    title: 'Confirm specialized inpatient arrival?',
    text: `Confirm ${patientName} has arrived, mark the bed as occupied, and save today's vitals record?`,
    icon: 'question',
    confirmButtonText: 'Confirm arrival & save',
  });
}

/** Specialized inpatient nurse: save daily vitals after confirmation. */
export async function confirmSpecializedInpatientDailySave(patientName) {
  return confirmAction({
    title: 'Save daily record?',
    text: `Save today's vitals record for ${patientName}?`,
    icon: 'question',
    confirmButtonText: 'Save record',
  });
}

/** Adult outpatient nurse: confirm arrival and first daily record in one step. */
export async function confirmAdultOutpatientArrivalAndSave(patientName) {
  return confirmAction({
    title: 'Confirm adult outpatient arrival?',
    text: `Confirm ${patientName} has arrived, mark the bed as occupied, and save today's vitals record?`,
    icon: 'question',
    confirmButtonText: 'Confirm arrival & save',
  });
}

/** Adult outpatient nurse: save daily vitals after confirmation. */
export async function confirmAdultOutpatientDailySave(patientName) {
  return confirmAction({
    title: 'Save daily record?',
    text: `Save today's vitals record for ${patientName}?`,
    icon: 'question',
    confirmButtonText: 'Save record',
  });
}
