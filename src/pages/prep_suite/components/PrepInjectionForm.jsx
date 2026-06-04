import { IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import {
  DEFAULT_MEDICATION,
  INJECTION_SITE_OPTIONS,
  injectionButtonClass,
  injectionButtonLabel,
  finalizeButtonClass,
  finalizeButtonLabel,
} from '../prepSuiteForm';

export default function PrepInjectionForm({
  form,
  onFieldChange,
  onRecordInjection,
  onFinalize,
  injectionRecorded,
  actionLoading,
  submitError,
}) {
  const canRecord =
    !injectionRecorded
    && form.confirmInjection
    && form.medication?.trim();

  return (
    <section className={c.sectionPanel}>
      <h3 className={c.sectionTitle}>PrEP injection administration</h3>
      <p className="mt-1 text-sm text-slate-500">
        Document the long-acting injectable PrEP dose. After confirmation, finalize the session to
        save the clinical record and end the active consultation.
      </p>

      {injectionRecorded ? (
        <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
          <p className="font-semibold">Injection logged</p>
          <p className="mt-1">
            {form.medication}
            {form.injection_site ? ` · ${form.injection_site}` : ''}
          </p>
          {form.lot_number ? (
            <p className="mt-1 text-teal-800">Lot: {form.lot_number}</p>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mt-4">
            <label htmlFor="prep-medication" className="text-sm font-semibold text-slate-800">
              Medication
            </label>
            <input
              id="prep-medication"
              type="text"
              className={`${c.input} mt-1.5 w-full`}
              value={form.medication}
              onChange={(e) => onFieldChange('medication', e.target.value)}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="prep-site" className="text-sm font-semibold text-slate-800">
              Injection site
            </label>
            <select
              id="prep-site"
              className={`${c.input} mt-1.5 w-full`}
              value={form.injection_site}
              onChange={(e) => onFieldChange('injection_site', e.target.value)}
            >
              {INJECTION_SITE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label htmlFor="prep-lot" className="text-sm font-semibold text-slate-800">
              Lot / batch number (optional)
            </label>
            <input
              id="prep-lot"
              type="text"
              className={`${c.input} mt-1.5 w-full`}
              value={form.lot_number}
              onChange={(e) => onFieldChange('lot_number', e.target.value)}
            />
          </div>

          <div className="mt-4">
            <IntakeTextarea
              id="prep-counseling"
              label="Counseling notes (optional)"
              className={c.textarea}
              rows={2}
              value={form.counseling_notes}
              onChange={(e) => onFieldChange('counseling_notes', e.target.value)}
            />
          </div>

          <div className="mt-4">
            <IntakeTextarea
              id="prep-notes"
              label="Administration notes (optional)"
              className={c.textarea}
              rows={2}
              value={form.notes}
              onChange={(e) => onFieldChange('notes', e.target.value)}
            />
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              checked={form.confirmInjection}
              onChange={(e) => onFieldChange('confirmInjection', e.target.checked)}
            />
            <span className="text-sm text-slate-700">
              I confirm that the PrEP injection was administered to this patient and the details above are accurate.
            </span>
          </label>

          <div className="mt-6">
            <button
              type="button"
              className={injectionButtonClass()}
              disabled={!canRecord || actionLoading}
              onClick={onRecordInjection}
            >
              {injectionButtonLabel(actionLoading)}
            </button>
          </div>
        </>
      )}

      {injectionRecorded ? (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <p className="text-sm text-slate-600">
            Injection is on file. Finalize to securely save this PrEP session to the patient record
            and end the active consultation.
          </p>
          <button
            type="button"
            className={`${finalizeButtonClass()} mt-4`}
            disabled={actionLoading}
            onClick={onFinalize}
          >
            {finalizeButtonLabel(actionLoading)}
          </button>
        </div>
      ) : null}

      {submitError ? (
        <p className={c.submitError} role="alert">{submitError}</p>
      ) : null}
    </section>
  );
}
