import { emptyIntakeForm } from '../nurse/nurseIntakeForm';

/** Map API vitals record into nurse intake form shape (read-only on doctor view). */
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
    immunization_status: vitals.immunization_status || 'Up to date',
    social_history: str(vitals.social_history),
    physical_examination: str(vitals.physical_examination),
  };
}

export const emptyMedLine = () => ({
  medication_name: '',
  dosage: '',
  frequency: '',
  quantity: '1',
  instructions: '',
});
