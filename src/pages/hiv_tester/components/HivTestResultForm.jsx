import { IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import { confirmButtonClass, confirmButtonLabel, canSubmitHivResult } from '../hivTesterForm';

export default function HivTestResultForm({
  form,
  onFieldChange,
  onSubmit,
  actionLoading,
  submitError,
}) {
  const canSubmit = canSubmitHivResult(form);

  return (
    <section className={c.sectionPanel}>
      <h3 className={c.sectionTitle}>HIV test result</h3>
      <p className="mt-1 text-sm text-slate-500">
        Record the rapid test outcome. For a negative result, optionally send the patient to the
        PrEP Suite. Positive automatically escalates to the ART queue.
      </p>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold text-slate-800">Test outcome</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {[
            { value: 'negative', label: 'Negative', desc: 'Optionally route to PrEP Suite' },
            { value: 'positive', label: 'Positive', desc: 'Escalate to ART queue' },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex min-w-[140px] flex-1 cursor-pointer flex-col rounded-lg border-2 p-4 transition ${
                form.result === opt.value
                  ? opt.value === 'positive'
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-teal-600 bg-teal-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="hiv-result"
                className="sr-only"
                value={opt.value}
                checked={form.result === opt.value}
                onChange={() => {
                  onFieldChange('result', opt.value);
                  if (opt.value !== 'negative') onFieldChange('sendToPrepSuite', false);
                }}
              />
              <span className="text-sm font-bold text-slate-900">{opt.label}</span>
              <span className="mt-1 text-xs text-slate-500">{opt.desc}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {form.result === 'negative' ? (
        <label
          className={`mt-6 flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition ${
            form.sendToPrepSuite
              ? 'border-teal-600 bg-teal-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            checked={!!form.sendToPrepSuite}
            onChange={(e) => onFieldChange('sendToPrepSuite', e.target.checked)}
          />
          <span>
            <span className="text-sm font-bold text-slate-900">Send to PrEP Suite</span>
            <span className="mt-1 block text-xs text-slate-500">
              Patient will be routed to the PrEP suite for injectable PrEP administration.
            </span>
          </span>
        </label>
      ) : null}

      <div className="mt-4">
        <IntakeTextarea
          id="ht-notes"
          label="Notes (optional)"
          className={c.textarea}
          rows={2}
          value={form.notes}
          onChange={(e) => onFieldChange('notes', e.target.value)}
        />
      </div>

      {form.result ? (
        <div className="mt-6">
          <button
            type="button"
            className={confirmButtonClass(form)}
            disabled={!canSubmit || actionLoading}
            onClick={onSubmit}
          >
            {confirmButtonLabel(form, actionLoading)}
          </button>
        </div>
      ) : (
        <p className={`${c.hint} mt-6`}>Select a test outcome to enable confirmation.</p>
      )}

      {submitError ? (
        <p className={c.submitError} role="alert">{submitError}</p>
      ) : null}
    </section>
  );
}
