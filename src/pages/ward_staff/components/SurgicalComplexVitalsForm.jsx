import { wst } from '../styles/wardStaffClasses';

export const EMPTY_SC_VITALS = {
  record_date: new Date().toISOString().slice(0, 10),
  heart_rate: '',
  oxygen_saturation: '',
  respiration_rate: '',
  body_temperature: '',
  blood_pressure_systolic: '',
  blood_pressure_diastolic: '',
  pulse_oximetry_spo2: '',
  capnography_etco2: '',
  fio2: '',
  anesthesia_neuro_monitoring: '',
  neuromuscular_tof: '',
  pain_sedation_scores: '',
};

export default function SurgicalComplexVitalsForm({
  vitals,
  onChange,
  idPrefix = 'sc-vitals',
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
          <input type="number" min="0" className={fieldClass('heart_rate')} value={vitals.heart_rate} onChange={(e) => update('heart_rate', e.target.value)} />
          {errorText('heart_rate')}
        </label>
        <label className="block text-sm">
          <span className={wst.infoLabel}>Oxygen saturation (%)</span>
          <input type="number" min="0" max="100" step="0.1" className={fieldClass('oxygen_saturation')} value={vitals.oxygen_saturation} onChange={(e) => update('oxygen_saturation', e.target.value)} />
          {errorText('oxygen_saturation')}
        </label>
        <label className="block text-sm">
          <span className={wst.infoLabel}>Pulse oximetry — SpO₂ (%)</span>
          <input type="number" min="0" max="100" step="0.1" className={fieldClass('pulse_oximetry_spo2')} value={vitals.pulse_oximetry_spo2} onChange={(e) => update('pulse_oximetry_spo2', e.target.value)} />
          {errorText('pulse_oximetry_spo2')}
        </label>
        <label className="block text-sm">
          <span className={wst.infoLabel}>Respiration rate (/min)</span>
          <input type="number" min="0" className={fieldClass('respiration_rate')} value={vitals.respiration_rate} onChange={(e) => update('respiration_rate', e.target.value)} />
          {errorText('respiration_rate')}
        </label>
        <label className="block text-sm">
          <span className={wst.infoLabel}>Body temperature (°C)</span>
          <input type="number" step="0.1" className={fieldClass('body_temperature')} value={vitals.body_temperature} onChange={(e) => update('body_temperature', e.target.value)} />
          {errorText('body_temperature')}
        </label>
        <label className="block text-sm">
          <span className={wst.infoLabel}>Blood pressure (systolic)</span>
          <input type="number" min="0" className={fieldClass('blood_pressure_systolic')} value={vitals.blood_pressure_systolic} onChange={(e) => update('blood_pressure_systolic', e.target.value)} />
          {errorText('blood_pressure_systolic')}
        </label>
        <label className="block text-sm">
          <span className={wst.infoLabel}>Blood pressure (diastolic)</span>
          <input type="number" min="0" className={fieldClass('blood_pressure_diastolic')} value={vitals.blood_pressure_diastolic} onChange={(e) => update('blood_pressure_diastolic', e.target.value)} />
          {errorText('blood_pressure_diastolic')}
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className={wst.infoLabel}>Capnography — EtCO₂</span>
          <input type="text" className={fieldClass('capnography_etco2')} value={vitals.capnography_etco2} onChange={(e) => update('capnography_etco2', e.target.value)} placeholder="e.g. 38 mmHg" />
          {errorText('capnography_etco2')}
        </label>
        <label className="block text-sm">
          <span className={wst.infoLabel}>FiO₂</span>
          <input type="text" className={fieldClass('fio2')} value={vitals.fio2} onChange={(e) => update('fio2', e.target.value)} placeholder="e.g. 40%" />
          {errorText('fio2')}
        </label>
        <label className="block text-sm sm:col-span-2 lg:col-span-3">
          <span className={wst.infoLabel}>Depth of anesthesia / neurological monitoring</span>
          <textarea rows={2} className={fieldClass('anesthesia_neuro_monitoring')} value={vitals.anesthesia_neuro_monitoring} onChange={(e) => update('anesthesia_neuro_monitoring', e.target.value)} placeholder="BIS, entropy, pupil response, limb movement…" />
          {errorText('anesthesia_neuro_monitoring')}
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className={wst.infoLabel}>Neuromuscular transmission (TOF)</span>
          <input type="text" className={fieldClass('neuromuscular_tof')} value={vitals.neuromuscular_tof} onChange={(e) => update('neuromuscular_tof', e.target.value)} placeholder="e.g. TOF 4/4" />
          {errorText('neuromuscular_tof')}
        </label>
        <label className="block text-sm sm:col-span-2 lg:col-span-3">
          <span className={wst.infoLabel}>Pain and sedation scores</span>
          <textarea rows={2} className={fieldClass('pain_sedation_scores')} value={vitals.pain_sedation_scores} onChange={(e) => update('pain_sedation_scores', e.target.value)} placeholder="NRS, Ramsay, RASS, etc." />
          {errorText('pain_sedation_scores')}
        </label>
      </div>
      {submitButton ? <div className="mt-4">{submitButton}</div> : null}
    </>
  );
}
