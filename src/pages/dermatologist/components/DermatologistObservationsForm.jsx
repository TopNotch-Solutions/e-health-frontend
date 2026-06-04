import { IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import {
  isObservationFormComplete,
  routeBookingButtonClass,
  routeBookingButtonLabel,
  saveObservationsButtonClass,
  saveObservationsButtonLabel,
} from '../dermatologistForm';

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 10h-1V7a4 4 0 10-8 0v3H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2zm-3 0h-4V7a2 2 0 114 0v3z" />
    </svg>
  );
}

export default function DermatologistObservationsForm({
  form,
  fieldErrors,
  onFieldChange,
  onSave,
  onRouteBooking,
  observationsSaved,
  routingUnlocked,
  alreadyRouted,
  actionLoading,
  submitError,
}) {
  const canSave = isObservationFormComplete(form) && !alreadyRouted;

  return (
    <section className={c.sectionPanel}>
      <h3 className={c.sectionTitle}>Clinical observations &amp; skin assessment</h3>
      <p className="mt-1 text-sm text-slate-500">
        Document your findings for this visit. Saving unlocks routing to the Booking Room.
      </p>

      <div className="mt-4 space-y-4">
        <IntakeTextarea
          id="derm-obs"
          label="Clinical observations"
          required
          className={c.textarea}
          rows={4}
          value={form.clinical_observations}
          onChange={(e) => onFieldChange('clinical_observations', e.target.value)}
          error={fieldErrors.clinical_observations}
        />
        <IntakeTextarea
          id="derm-skin"
          label="Skin assessment"
          required
          className={c.textarea}
          rows={4}
          value={form.skin_assessment}
          onChange={(e) => onFieldChange('skin_assessment', e.target.value)}
          error={fieldErrors.skin_assessment}
        />
        <IntakeTextarea
          id="derm-diff"
          label="Differential diagnosis (optional)"
          className={c.textarea}
          rows={2}
          value={form.differential_diagnosis}
          onChange={(e) => onFieldChange('differential_diagnosis', e.target.value)}
        />
        <IntakeTextarea
          id="derm-plan"
          label="Treatment plan (optional)"
          className={c.textarea}
          rows={2}
          value={form.treatment_plan}
          onChange={(e) => onFieldChange('treatment_plan', e.target.value)}
        />
      </div>

      {observationsSaved ? (
        <p className="mt-3 text-sm font-medium text-teal-800" role="status">
          Observations saved to this visit.
        </p>
      ) : null}

      <div className="mt-6">
        <button
          type="button"
          className={saveObservationsButtonClass()}
          disabled={!canSave || actionLoading || alreadyRouted}
          onClick={onSave}
        >
          {saveObservationsButtonLabel(actionLoading)}
        </button>
      </div>

      <div className="relative mt-8 border-t border-slate-200 pt-6">
        <h4 className="text-sm font-semibold text-slate-800">Downstream routing</h4>
        {!routingUnlocked ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <LockIcon />
            <span>Save clinical observations above to unlock Booking Room routing.</span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Refer this patient to the Booking Room for external state hospital transfer.
          </p>
        )}
        <button
          type="button"
          className={`${routeBookingButtonClass()} mt-4`}
          disabled={!routingUnlocked || actionLoading || alreadyRouted}
          onClick={onRouteBooking}
        >
          {alreadyRouted ? 'Routed to Booking Room' : routeBookingButtonLabel(actionLoading)}
        </button>
      </div>

      {submitError ? (
        <p className={c.submitError} role="alert">{submitError}</p>
      ) : null}
    </section>
  );
}
