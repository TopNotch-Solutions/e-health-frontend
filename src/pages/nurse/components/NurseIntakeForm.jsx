import { IMMUNIZATION_OPTIONS } from '../nurseIntakeForm';
import { nurse as c } from '../styles/nurseClasses';
import { IntakeInput, IntakeSelect, IntakeTextarea } from './IntakeField';

export default function NurseIntakeForm({
  form,
  fieldErrors,
  onFieldChange,
  readOnly = false,
  idPrefix = 'nr',
  showRequiredMark = true,
}) {
  const err = (key) => fieldErrors[key];
  const id = (suffix) => `${idPrefix}-${suffix}`;

  const shared = { readOnly, showRequiredMark: readOnly ? false : showRequiredMark };

  return (
    <>
      <section className={c.sectionPanel} aria-labelledby={`${idPrefix}-vitals-heading`}>
        <h3 id={`${idPrefix}-vitals-heading`} className={c.sectionTitle}>
          Vital signs
        </h3>
        <div className={c.vitalsGrid}>
          <IntakeInput
            id={id('bp-sys')}
            label="Blood pressure (systolic)"
            error={err('blood_pressure_systolic')}
            className={c.input}
            inputMode="numeric"
            placeholder="mmHg"
            value={form.blood_pressure_systolic}
            onChange={(e) => onFieldChange('blood_pressure_systolic', e.target.value)}
            {...shared}
          />
          <IntakeInput
            id={id('bp-dia')}
            label="Blood pressure (diastolic)"
            error={err('blood_pressure_diastolic')}
            className={c.input}
            inputMode="numeric"
            placeholder="mmHg"
            value={form.blood_pressure_diastolic}
            onChange={(e) => onFieldChange('blood_pressure_diastolic', e.target.value)}
            {...shared}
          />
          <IntakeInput
            id={id('hr')}
            label="Heart rate"
            error={err('pulse_rate')}
            className={c.input}
            inputMode="numeric"
            placeholder="BPM"
            value={form.pulse_rate}
            onChange={(e) => onFieldChange('pulse_rate', e.target.value)}
            {...shared}
          />
          <IntakeInput
            id={id('temp')}
            label="Temperature"
            error={err('temperature')}
            className={c.input}
            inputMode="decimal"
            placeholder="°C"
            value={form.temperature}
            onChange={(e) => onFieldChange('temperature', e.target.value)}
            {...shared}
          />
          <IntakeInput
            id={id('weight')}
            label="Weight"
            error={err('weight')}
            className={c.input}
            inputMode="decimal"
            placeholder="kg"
            value={form.weight}
            onChange={(e) => onFieldChange('weight', e.target.value)}
            {...shared}
          />
          <IntakeInput
            id={id('rr')}
            label="Respiratory rate"
            error={err('respiratory_rate')}
            className={c.input}
            inputMode="numeric"
            placeholder="breaths/min"
            value={form.respiratory_rate}
            onChange={(e) => onFieldChange('respiratory_rate', e.target.value)}
            {...shared}
          />
        </div>
      </section>

      <section className={c.sectionPanel} aria-labelledby={`${idPrefix}-complaint-heading`}>
        <h3 id={`${idPrefix}-complaint-heading`} className={c.sectionTitle}>
          Main complaint
        </h3>
        <div className="mt-4 space-y-4">
          <IntakeTextarea
            id={id('chief')}
            label="Chief complaint"
            error={err('chief_complaint')}
            className={c.textarea}
            placeholder="Patient's primary concern in their own words…"
            value={form.chief_complaint}
            onChange={(e) => onFieldChange('chief_complaint', e.target.value)}
            {...shared}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <IntakeInput
              id={id('onset-date')}
              label="Onset date"
              error={err('onset_date')}
              className={c.input}
              type="date"
              value={form.onset_date}
              onChange={(e) => onFieldChange('onset_date', e.target.value)}
              {...shared}
            />
            <IntakeInput
              id={id('onset-time')}
              label="Onset time"
              error={err('onset_time')}
              className={c.input}
              type="time"
              value={form.onset_time}
              onChange={(e) => onFieldChange('onset_time', e.target.value)}
              {...shared}
            />
          </div>
          <IntakeTextarea
            id={id('aggravating')}
            label="Aggravating factors"
            error={err('aggravating_factors')}
            className={c.textarea}
            placeholder="What makes symptoms worse?"
            value={form.aggravating_factors}
            onChange={(e) => onFieldChange('aggravating_factors', e.target.value)}
            {...shared}
          />
          <IntakeTextarea
            id={id('alleviating')}
            label="Alleviating factors"
            error={err('alleviating_factors')}
            className={c.textarea}
            placeholder="What makes symptoms better?"
            value={form.alleviating_factors}
            onChange={(e) => onFieldChange('alleviating_factors', e.target.value)}
            {...shared}
          />
        </div>
      </section>

      <section className={c.sectionPanel} aria-labelledby={`${idPrefix}-history-heading`}>
        <h3 id={`${idPrefix}-history-heading`} className={c.sectionTitle}>
          Medical history
        </h3>
        <div className="mt-4 space-y-4">
          <IntakeTextarea
            id={id('meds')}
            label="Current medications"
            error={err('current_medications')}
            className={c.textarea}
            placeholder="List medications and dosages (or “None”)…"
            value={form.current_medications}
            onChange={(e) => onFieldChange('current_medications', e.target.value)}
            {...shared}
          />
          <IntakeSelect
            id={id('imm')}
            label="Immunization status"
            error={err('immunization_status')}
            className={c.select}
            value={form.immunization_status}
            onChange={(e) => onFieldChange('immunization_status', e.target.value)}
            {...shared}
          >
            {IMMUNIZATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </IntakeSelect>
          <IntakeTextarea
            id={id('social')}
            label="Social history"
            error={err('social_history')}
            className={c.textarea}
            placeholder="Smoking, alcohol use, occupation, living situation, etc."
            value={form.social_history}
            onChange={(e) => onFieldChange('social_history', e.target.value)}
            {...shared}
          />
        </div>
      </section>

      <section className={c.sectionPanel} aria-labelledby={`${idPrefix}-pe-heading`}>
        <h3 id={`${idPrefix}-pe-heading`} className={c.sectionTitle}>
          Physical examination
        </h3>
        <div className="mt-4">
          <IntakeTextarea
            id={id('pe')}
            label="Examination findings"
            error={err('physical_examination')}
            className={c.textarea}
            placeholder="General appearance, localized findings, systems reviewed…"
            value={form.physical_examination}
            onChange={(e) => onFieldChange('physical_examination', e.target.value)}
            {...shared}
          />
        </div>
      </section>
    </>
  );
}
