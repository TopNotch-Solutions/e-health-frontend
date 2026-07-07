export const SCHEDULE_TYPES = {
  ONCE_OFF: 'once_off',
  MONTHLY_DAY: 'monthly_day',
  RECURRING_WEEKDAYS: 'recurring_weekdays',
  RECURRING_DATES: 'recurring_dates',
};

export const SCHEDULE_TYPE_OPTIONS = [
  { value: SCHEDULE_TYPES.ONCE_OFF, label: 'Once-off' },
  { value: SCHEDULE_TYPES.MONTHLY_DAY, label: 'Every month on a set day' },
  { value: SCHEDULE_TYPES.RECURRING_DATES, label: 'On selected days until patient is better' },
];

export const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

function ordinalDay(day) {
  const n = Number(day);
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function defaultScheduleFields() {
  return {
    schedule_type: SCHEDULE_TYPES.ONCE_OFF,
    recurring_day_of_month: '',
    recurring_weekdays: [],
    recurring_dates: [],
  };
}

export function normalizeWeekdays(value) {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : [];
  return [...new Set(raw.map((d) => parseInt(d, 10)).filter((d) => d >= 0 && d <= 6))].sort((a, b) => a - b);
}

export function normalizeRecurringDates(value) {
  if (!value) return [];
  let raw = value;
  if (typeof value === 'string') {
    try {
      raw = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  const unique = [...new Set(
    raw
      .map((d) => String(d || '').trim())
      .filter((d) => ISO_DATE_RE.test(d))
  )];
  return unique.sort();
}

export function formatRecurringDateLabel(isoDate) {
  if (!ISO_DATE_RE.test(isoDate)) return isoDate;
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function validatePrescriptionSchedule(medLine) {
  const errors = {};
  const schedule_type = medLine.schedule_type || SCHEDULE_TYPES.ONCE_OFF;

  if (schedule_type === SCHEDULE_TYPES.MONTHLY_DAY) {
    const day = parseInt(medLine.recurring_day_of_month, 10);
    if (!day || day < 1 || day > 31) {
      errors.recurring_day_of_month = 'Select the day of the month (1–31)';
    }
  }

  if (schedule_type === SCHEDULE_TYPES.RECURRING_WEEKDAYS) {
    const days = normalizeWeekdays(medLine.recurring_weekdays);
    if (!days.length) {
      errors.recurring_weekdays = 'Select at least one day of the week';
    }
  }

  if (schedule_type === SCHEDULE_TYPES.RECURRING_DATES) {
    const dates = normalizeRecurringDates(medLine.recurring_dates);
    if (!dates.length) {
      errors.recurring_dates = 'Add at least one date when the patient should collect medication';
    }
  }

  return errors;
}

export function formatPrescriptionScheduleLabel(item) {
  const schedule_type = item?.schedule_type || SCHEDULE_TYPES.ONCE_OFF;
  const active = item?.schedule_active !== false;

  if (schedule_type === SCHEDULE_TYPES.ONCE_OFF) {
    return 'Once-off';
  }

  if (schedule_type === SCHEDULE_TYPES.MONTHLY_DAY) {
    const day = item.recurring_day_of_month;
    if (!day) return 'Monthly (day not set)';
    const base = `Monthly on the ${ordinalDay(day)}`;
    return active ? base : `${base} (stopped)`;
  }

  if (schedule_type === SCHEDULE_TYPES.RECURRING_WEEKDAYS) {
    const labelByValue = Object.fromEntries(WEEKDAY_OPTIONS.map((o) => [o.value, o.label]));
    const days = normalizeWeekdays(item.recurring_weekdays)
      .map((d) => labelByValue[d])
      .filter(Boolean)
      .join(', ');
    const base = days ? `Every ${days}` : 'Recurring (days not set)';
    return active ? `${base} until patient is better` : `${base} (stopped)`;
  }

  if (schedule_type === SCHEDULE_TYPES.RECURRING_DATES) {
    const dates = normalizeRecurringDates(item.recurring_dates);
    if (!dates.length) return 'Selected dates (not set)';
    const formatted = dates.map((d) => formatRecurringDateLabel(d));
    const base = formatted.length <= 3
      ? formatted.join('; ')
      : `${formatted.slice(0, 2).join('; ')}; +${formatted.length - 2} more`;
    return active ? `${base} until patient is better` : `${base} (stopped)`;
  }

  return 'Once-off';
}

export function buildPrescriptionItemPayload(item) {
  const schedule_type = item.schedule_type || SCHEDULE_TYPES.ONCE_OFF;
  const payload = {
    medication_name: item.medication_name,
    dosage: item.dosage,
    frequency: item.frequency || null,
    quantity: item.quantity || 1,
    instructions: item.instructions || null,
    schedule_type,
  };

  if (schedule_type === SCHEDULE_TYPES.MONTHLY_DAY) {
    payload.recurring_day_of_month = parseInt(item.recurring_day_of_month, 10);
  }

  if (schedule_type === SCHEDULE_TYPES.RECURRING_WEEKDAYS) {
    payload.recurring_weekdays = normalizeWeekdays(item.recurring_weekdays);
  }

  if (schedule_type === SCHEDULE_TYPES.RECURRING_DATES) {
    payload.recurring_dates = normalizeRecurringDates(item.recurring_dates);
  }

  return payload;
}

export function isRecurringPrescriptionItem(item) {
  const schedule_type = item?.schedule_type || SCHEDULE_TYPES.ONCE_OFF;
  return schedule_type !== SCHEDULE_TYPES.ONCE_OFF && item?.schedule_active !== false;
}
