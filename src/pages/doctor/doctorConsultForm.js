import { emptyIntakeForm } from '../nurse/nurseIntakeForm';
import { defaultScheduleFields, buildPrescriptionItemPayload, validatePrescriptionSchedule } from '../../utils/prescriptionSchedule';
import { buildDoctorPrescriptionLine } from '../../utils/pharmacyStockDisplay';

export { buildPrescriptionItemPayload, validatePrescriptionSchedule };

/** Map API vitals record into nurse intake form shape (read-only on doctor view). */
function hasText(value) {
  return value != null && String(value).trim() !== '';
}

/** Prefer current-visit values; fill gaps from a prior visit intake record. */
export function mergeIntakeForms(primary, fallback) {
  if (!fallback) return primary;
  const pick = (key) => (hasText(primary[key]) ? primary[key] : fallback[key]);
  return {
    ...primary,
    chief_complaint: pick('chief_complaint'),
    onset_date: pick('onset_date'),
    onset_time: pick('onset_time'),
    aggravating_factors: pick('aggravating_factors'),
    alleviating_factors: pick('alleviating_factors'),
    current_medications: pick('current_medications'),
    immunization_status:
      primary.immunization_status !== 'Up to date' || !hasText(fallback.immunization_status)
        ? primary.immunization_status
        : fallback.immunization_status,
    social_history: pick('social_history'),
    physical_examination: pick('physical_examination'),
  };
}

export function enrichIntakeFromScreening(form, screeningAssessment) {
  if (!screeningAssessment) return form;
  const symptoms = screeningAssessment.symptoms?.trim();
  const reason = screeningAssessment.reason?.trim();
  if (!hasText(form.chief_complaint)) {
    const parts = [symptoms, reason].filter(Boolean);
    if (parts.length) {
      return { ...form, chief_complaint: parts.join(' — ') };
    }
  }
  return form;
}

export function vitalsToIntakeForm(vitals) {
  if (!vitals) return emptyIntakeForm();

  let onsetDate = '';
  let onsetTime = '';
  if (vitals.onset_at) {
    const d = new Date(vitals.onset_at);
    if (!Number.isNaN(d.getTime())) {
      onsetDate = d.toISOString().slice(0, 10);
      onsetTime = d.toISOString().slice(11, 16);
    }
  }

  const str = (v) => (v != null && v !== '' ? String(v) : '');

  return {
    blood_pressure_systolic: str(vitals.blood_pressure_systolic),
    blood_pressure_diastolic: str(vitals.blood_pressure_diastolic),
    pulse_rate: str(vitals.pulse_rate),
    temperature: str(vitals.temperature),
    weight: str(vitals.weight),
    respiratory_rate: str(vitals.respiratory_rate),
    chief_complaint: str(vitals.chief_complaint),
    onset_date: onsetDate,
    onset_time: onsetTime,
    aggravating_factors: str(vitals.aggravating_factors),
    alleviating_factors: str(vitals.alleviating_factors),
    current_medications: str(vitals.current_medications),
    immunization_status: hasText(vitals.immunization_status) ? vitals.immunization_status : 'Up to date',
    social_history: str(vitals.social_history),
    physical_examination: str(vitals.physical_examination),
  };
}

export const emptyMedLine = () => ({
  medication_name: '',
  generic_name: '',
  dosage: '',
  frequency: '',
  quantity: '1',
  instructions: '',
  ...defaultScheduleFields(),
});

/**
 * Validate and append the current med line to the prescription list.
 */
export function commitMedLineToList({
  medLine,
  liveStock,
  setPrescriptionLines,
  setMedFieldErrors,
  setMedLine,
  setLiveStock,
  emptyMedLineFn = emptyMedLine,
}) {
  const name = medLine.medication_name?.trim();
  const dose = medLine.dosage?.trim();
  const errs = {};
  if (!name) errs.medication_name = 'Enter medication name';
  if (!dose) errs.dosage = 'Enter dosage';
  Object.assign(errs, validatePrescriptionSchedule(medLine));
  if (Object.keys(errs).length) {
    setMedFieldErrors(errs);
    return false;
  }

  const qty = Number(medLine.quantity) || 1;
  setPrescriptionLines((lines) => [
    ...lines,
    buildDoctorPrescriptionLine(
      {
        ...medLine,
        medication_name: name,
        generic_name: medLine.generic_name?.trim() || '',
        dosage: dose,
        quantity: qty,
      },
      liveStock
    ),
  ]);
  setMedLine(emptyMedLineFn());
  setLiveStock?.(null);
  setMedFieldErrors({});
  return true;
}
