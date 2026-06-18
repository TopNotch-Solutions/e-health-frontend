const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MATERNITY_INELIGIBLE_SEX_MESSAGE =
  'Maternity front office is for female patients only. Male patients cannot be registered or checked in here.';

/** True when sex is female (API or form values). */
export function isMaternityEligibleSex(sex) {
  if (!sex) return false;
  const value = String(sex).toLowerCase();
  return value === 'female' || value === 'f';
}

function parseDobParts(dateOfBirth) {
  if (!dateOfBirth) return null;
  const iso = String(dateOfBirth).split('T')[0];
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return {
      year: Number(match[1]),
      month: Number(match[2]) - 1,
      day: Number(match[3]),
    };
  }
  const parsed = new Date(dateOfBirth);
  if (Number.isNaN(parsed.getTime())) return null;
  return {
    year: parsed.getFullYear(),
    month: parsed.getMonth(),
    day: parsed.getDate(),
  };
}

/**
 * Age label for maternity front office, e.g. "25 turning 26 September 04/09".
 */
export function formatMaternityAgeLabel(dateOfBirth, now = new Date()) {
  const dob = parseDobParts(dateOfBirth);
  if (!dob) return null;

  let age = now.getFullYear() - dob.year;
  const birthdayPassed =
    now.getMonth() > dob.month
    || (now.getMonth() === dob.month && now.getDate() >= dob.day);

  if (!birthdayPassed) age -= 1;

  const dd = String(dob.day).padStart(2, '0');
  const mm = String(dob.month + 1).padStart(2, '0');
  const monthName = MONTH_NAMES[dob.month];

  if (!birthdayPassed) {
    return `${age} turning ${age + 1} ${monthName} ${dd}/${mm}`;
  }
  return `${age} years (${monthName} ${dd}/${mm})`;
}
