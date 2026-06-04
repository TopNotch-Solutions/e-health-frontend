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
