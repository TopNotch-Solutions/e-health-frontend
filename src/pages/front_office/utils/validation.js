/** National ID validation — government ID must be exactly 11 numeric digits. */

export const NATIONAL_ID_LENGTH = 11;

/** Strip non-digits and cap length while typing. */
export function sanitizeNationalIdInput(value) {
  return String(value).replace(/\D/g, '').slice(0, NATIONAL_ID_LENGTH);
}

/** Returns an error message string, or null when valid. */
export function validateNationalId(value, { required = true } = {}) {
  const digits = String(value).trim();
  if (!digits) {
    return required ? 'Enter the patient\'s national ID number.' : null;
  }
  if (!/^\d{11}$/.test(digits)) {
    return 'National ID must be exactly 11 numeric digits.';
  }
  return null;
}

/** Returns an error message string, or null when valid. */
export function validateRequiredText(value, { label = 'field' } = {}) {
  if (!String(value).trim()) {
    return `Enter the ${label}.`;
  }
  return null;
}

/** Returns an error message string, or null when valid. */
export function validatePhone(value, { required = true, label = 'primary phone number' } = {}) {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) {
    return required ? `Enter the patient's ${label}.` : null;
  }
  if (digits.length < 7) {
    return `Enter a valid ${label}.`;
  }
  return null;
}

/** DOB + name search validation. */
export function validateDobSearch({ dob, name }) {
  if (!dob) return 'Enter date of birth.';
  if (!String(name).trim()) return 'Enter full name.';
  return null;
}
