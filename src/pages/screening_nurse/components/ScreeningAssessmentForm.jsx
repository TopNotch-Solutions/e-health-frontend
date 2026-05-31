import { IntakeSelect, IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import {
  SCREENING_DESTINATIONS,
  routingButtonClass,
  routingButtonLabel,
} from '../screeningNurseForm';

export default function ScreeningAssessmentForm({
  form,
  fieldErrors,
  onFieldChange,
  canSubmit,
  onSubmit,
  actionLoading,
}) {
  const err = (key) => fieldErrors[key];
  const submitLabel = routingButtonLabel(form, actionLoading);

  return (
    <div className="space-y-4">
      <section className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Screening assessment</h3>
        <p className="mt-1 text-sm text-slate-500">
          Document present symptoms, reason for visit, and your clinical impression.
        </p>
        <div className="mt-4 space-y-4">
          <IntakeTextarea
            id="sn-symptoms"
            label="Present symptoms"
            error={err('symptoms')}
            className={c.textarea}
            rows={3}
            value={form.symptoms}
            onChange={(e) => onFieldChange('symptoms', e.target.value)}
          />
          <IntakeTextarea
            id="sn-reason"
            label="Reason for visitation"
            error={err('reason')}
            className={c.textarea}
            rows={3}
            value={form.reason}
            onChange={(e) => onFieldChange('reason', e.target.value)}
          />
          <IntakeTextarea
            id="sn-diagnosis"
            label="Clinical diagnosis (screening impression)"
            error={err('diagnosis')}
            className={c.textarea}
            rows={3}
            value={form.diagnosis}
            onChange={(e) => onFieldChange('diagnosis', e.target.value)}
          />
        </div>
      </section>

      <section className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Route patient</h3>
        <p className="mt-1 text-sm text-slate-500">
          Select a destination queue. The submit button appears once a destination is chosen.
        </p>
        <div className="mt-4">
          <IntakeSelect
            id="sn-routing"
            label="Destination queue"
            error={err('routing_destination')}
            className={c.select}
            value={form.routing_destination}
            onChange={(e) => onFieldChange('routing_destination', e.target.value)}
          >
            <option value="">Select destination…</option>
            {SCREENING_DESTINATIONS.map((dest) => (
              <option key={dest.value} value={dest.value}>
                {dest.label}
              </option>
            ))}
          </IntakeSelect>
        </div>

        {form.routing_destination ? (
          <div className="mt-4">
            <button
              type="button"
              disabled={actionLoading || !canSubmit}
              className={routingButtonClass(form)}
              onClick={onSubmit}
            >
              {submitLabel}
            </button>
            {!canSubmit ? (
              <p className={`${c.hint} mt-3`}>
                Complete symptoms, reason, and diagnosis to submit and route.
              </p>
            ) : null}
          </div>
        ) : (
          <p className={`${c.hint} mt-4`}>
            Choose a destination above to enable routing.
          </p>
        )}
      </section>
    </div>
  );
}
