import { IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import {
  isAssessmentFormComplete,
  submitButtonClass,
  submitButtonLabel,
} from '../socialWorkerSuiteForm';

export default function SocialWorkerAssessmentForm({
  form,
  fieldErrors,
  onFieldChange,
  onSubmit,
  isFinalized,
  actionLoading,
  submitError,
}) {
  const isSevere = !!form.isSevere;
  const canSubmit = isAssessmentFormComplete(form) && !isFinalized;

  return (
    <section className={c.sectionPanel}>
      <h3 className={c.sectionTitle}>Psychosocial documentation</h3>
      <p className="mt-1 text-sm text-slate-500">
        Record the social assessment, case history, and clinical notes, then save once.
        If the case is severe, check the box below to escalate to the Booking Room instead of
        completing the visit here.
      </p>

      <div className="mt-4 space-y-4">
        <IntakeTextarea
          id="sw-assessment"
          label="Social assessment details"
          required
          className={c.textarea}
          rows={3}
          value={form.social_assessment_details}
          onChange={(e) => onFieldChange('social_assessment_details', e.target.value)}
          error={fieldErrors.social_assessment_details}
          disabled={isFinalized}
        />
        <IntakeTextarea
          id="sw-history"
          label="Case history"
          required
          className={c.textarea}
          rows={3}
          value={form.case_history}
          onChange={(e) => onFieldChange('case_history', e.target.value)}
          error={fieldErrors.case_history}
          disabled={isFinalized}
        />
        <IntakeTextarea
          id="sw-notes"
          label="Clinical notes"
          required
          className={c.textarea}
          rows={3}
          value={form.clinical_notes}
          onChange={(e) => onFieldChange('clinical_notes', e.target.value)}
          error={fieldErrors.clinical_notes}
          disabled={isFinalized}
        />
      </div>

      {!isFinalized ? (
        <>
          <label
            className={`mt-6 flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition ${
              isSevere
                ? 'border-rose-500 bg-rose-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              checked={isSevere}
              onChange={(e) => onFieldChange('isSevere', e.target.checked)}
            />
            <span>
              <span className="text-sm font-bold text-slate-900">Severe case</span>
              <span className="mt-1 block text-xs text-slate-500">
                When checked, save will route the patient to the Booking Room queue.
              </span>
            </span>
          </label>

          <div className="mt-6">
            <button
              type="button"
              className={submitButtonClass(isSevere)}
              disabled={!canSubmit || actionLoading}
              onClick={onSubmit}
            >
              {submitButtonLabel(actionLoading, isSevere)}
            </button>
          </div>
        </>
      ) : null}

      {submitError ? (
        <p className={c.submitError} role="alert">{submitError}</p>
      ) : null}
    </section>
  );
}
