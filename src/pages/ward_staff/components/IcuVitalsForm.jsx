import { wst } from '../styles/wardStaffClasses';

export const EMPTY_ICU_VITALS = {
  record_date: new Date().toISOString().slice(0, 10),
  heart_rate: '',
  oxygen_saturation: '',
  respiration_rate: '',
  body_temperature: '',
  blood_pressure_systolic: '',
  blood_pressure_diastolic: '',
  ventilator_pressures_volumes: '',
  urine_output: '',
  arterial_blood_gases: '',
  neurological_checks: '',
};

export default function IcuVitalsForm({
  vitals,
  onChange,
  idPrefix = 'icu-vitals',
  hideRecordDate = false,
  submitButton = null,
  fieldErrors = {},
}) {
  function update(field, value) {
    onChange((prev) => ({ ...prev, [field]: value }));
  }

  function fieldClass(field) {
    return fieldErrors[field]
      ? 'mt-1 w-full rounded-lg border border-red-400 px-3 py-2 text-sm ring-1 ring-red-200'
      : 'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm';
  }

  function errorText(field) {
    if (!fieldErrors[field]) return null;
    return <p className="mt-1 text-xs text-red-600">{fieldErrors[field]}</p>;
  }

  return (
    <>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hideRecordDate ? null : (
          <label className="block text-sm">
            <span className={wst.infoLabel}>Record date</span>
            <input
              id={`${idPrefix}-record-date`}
              type="date"
              className={fieldClass('record_date')}
              value={vitals.record_date}
              onChange={(e) => update('record_date', e.target.value)}
            />
            {errorText('record_date')}
          </label>
        )}
      <label className="block text-sm">
        <span className={wst.infoLabel}>Heart rate (bpm)</span>
        <input
          type="number"
          min="0"
          className={fieldClass('heart_rate')}
          value={vitals.heart_rate}
          onChange={(e) => update('heart_rate', e.target.value)}
        />
        {errorText('heart_rate')}
      </label>
      <label className="block text-sm">
        <span className={wst.infoLabel}>Oxygen saturation (%)</span>
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          className={fieldClass('oxygen_saturation')}
          value={vitals.oxygen_saturation}
          onChange={(e) => update('oxygen_saturation', e.target.value)}
        />
        {errorText('oxygen_saturation')}
      </label>
      <label className="block text-sm">
        <span className={wst.infoLabel}>Respiration rate (/min)</span>
        <input
          type="number"
          min="0"
          className={fieldClass('respiration_rate')}
          value={vitals.respiration_rate}
          onChange={(e) => update('respiration_rate', e.target.value)}
        />
        {errorText('respiration_rate')}
      </label>
      <label className="block text-sm">
        <span className={wst.infoLabel}>Body temperature (°C)</span>
        <input
          type="number"
          step="0.1"
          className={fieldClass('body_temperature')}
          value={vitals.body_temperature}
          onChange={(e) => update('body_temperature', e.target.value)}
        />
        {errorText('body_temperature')}
      </label>
      <label className="block text-sm">
        <span className={wst.infoLabel}>Blood pressure (systolic)</span>
        <input
          type="number"
          min="0"
          className={fieldClass('blood_pressure_systolic')}
          value={vitals.blood_pressure_systolic}
          onChange={(e) => update('blood_pressure_systolic', e.target.value)}
        />
        {errorText('blood_pressure_systolic')}
      </label>
      <label className="block text-sm">
        <span className={wst.infoLabel}>Blood pressure (diastolic)</span>
        <input
          type="number"
          min="0"
          className={fieldClass('blood_pressure_diastolic')}
          value={vitals.blood_pressure_diastolic}
          onChange={(e) => update('blood_pressure_diastolic', e.target.value)}
        />
        {errorText('blood_pressure_diastolic')}
      </label>
      <label className="block text-sm sm:col-span-2 lg:col-span-3">
        <span className={wst.infoLabel}>Ventilator pressures &amp; volumes</span>
        <textarea
          rows={2}
          className={fieldClass('ventilator_pressures_volumes')}
          value={vitals.ventilator_pressures_volumes}
          onChange={(e) => update('ventilator_pressures_volumes', e.target.value)}
          placeholder="e.g. PEEP 5, FiO2 40%, tidal volume 450 ml"
        />
        {errorText('ventilator_pressures_volumes')}
      </label>
      <label className="block text-sm">
        <span className={wst.infoLabel}>Urine output</span>
        <input
          type="text"
          className={fieldClass('urine_output')}
          value={vitals.urine_output}
          onChange={(e) => update('urine_output', e.target.value)}
          placeholder="e.g. 120 ml / 4h"
        />
        {errorText('urine_output')}
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className={wst.infoLabel}>Arterial blood gases (ABG)</span>
        <textarea
          rows={2}
          className={fieldClass('arterial_blood_gases')}
          value={vitals.arterial_blood_gases}
          onChange={(e) => update('arterial_blood_gases', e.target.value)}
          placeholder="pH, PaO2, PaCO2, HCO3, etc."
        />
        {errorText('arterial_blood_gases')}
      </label>
      <label className="block text-sm sm:col-span-2 lg:col-span-3">
        <span className={wst.infoLabel}>Neurological checks</span>
        <textarea
          rows={2}
          className={fieldClass('neurological_checks')}
          value={vitals.neurological_checks}
          onChange={(e) => update('neurological_checks', e.target.value)}
          placeholder="GCS, pupillary response, limb movement, etc."
        />
        {errorText('neurological_checks')}
      </label>
      </div>
      {submitButton ? <div className="mt-4">{submitButton}</div> : null}
    </>
  );
}
