import { IntakeInput, IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import {
  validateAssessmentForm,
  submitButtonClass,
  submitButtonLabel,
} from '../pediatricCornerForm';

export default function PediatricAssessmentForm({
  form,
  fieldErrors,
  onFieldChange,
  onSubmit,
  isFinalized,
  patientAge,
  actionLoading,
}) {
  const canSubmit = Object.keys(validateAssessmentForm(form)).length === 0 && !isFinalized;

  return (
    <section className={c.sectionPanel}>
      <h3 className={c.sectionTitle}>Pediatric vitals &amp; assessment</h3>
      <p className="mt-1 text-sm text-slate-500">
        {patientAge != null
          ? `Patient age: ${patientAge} years — eligible for pediatric triage. Record vitals and assessment, then save once to send to the Master Doctor.`
          : 'Record temperature, weight, and general assessment, then save once to send to the Master Doctor.'}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <IntakeInput
          id="pc-temp"
          label="Temperature (°C)"
          required
          type="number"
          step="0.1"
          min="30"
          max="45"
          className={c.input}
          value={form.temperature}
          onChange={(e) => onFieldChange('temperature', e.target.value)}
          error={fieldErrors.temperature}
          disabled={isFinalized}
        />
        <IntakeInput
          id="pc-weight"
          label="Weight (kg)"
          required
          type="number"
          step="0.01"
          min="0"
          className={c.input}
          value={form.weight}
          onChange={(e) => onFieldChange('weight', e.target.value)}
          error={fieldErrors.weight}
          disabled={isFinalized}
        />
      </div>

      <div className="mt-4">
        <IntakeTextarea
          id="pc-assessment"
          label="General assessment"
          required
          className={c.textarea}
          rows={5}
          value={form.general_assessment}
          onChange={(e) => onFieldChange('general_assessment', e.target.value)}
          error={fieldErrors.general_assessment}
          disabled={isFinalized}
        />
      </div>

      {!isFinalized ? (
        <div className="mt-6">
          <button
            type="button"
            className={submitButtonClass()}
            disabled={!canSubmit || actionLoading}
            onClick={onSubmit}
          >
            {submitButtonLabel(actionLoading)}
          </button>
        </div>
      ) : null}
    </section>
  );
}
