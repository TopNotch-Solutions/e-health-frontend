/** National ID validation — government ID must be exactly 11 numeric digits. */

export const NATIONAL_ID_LENGTH = 11;

/** Strip non-digits and cap length while typing. */
export function sanitizeNationalIdInput(value) {
  return String(value).replace(/\D/g, '').slice(0, NATIONAL_ID_LENGTH);
}

/** Returns an error message string, or null when valid. */
export function validateNationalId(value) {
  const digits = String(value).trim();
  if (!digits) {
    return 'Enter the patient\'s national ID number.';
  }
  if (!/^\d{11}$/.test(digits)) {
    return 'National ID must be exactly 11 numeric digits.';
  }
  return null;
}

/** DOB + name search validation. */
export function validateDobSearch({ dob, name }) {
  if (!dob) return 'Enter date of birth.';
  if (!String(name).trim()) return 'Enter full name.';
  return null;
}
