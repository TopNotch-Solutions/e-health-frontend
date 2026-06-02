import { IntakeInput, IntakeSelect, IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import {
  FINAL_DISPOSITIONS,
  dispositionButtonClass,
  dispositionButtonLabel,
} from '../bookingRoomForm';

export default function BookingRoomWorkspace({
  handover,
  form,
  onFormChange,
  stateHospitals,
  stateHospitalsLoading,
  stateHospitalsError,
  actionLoading,
  onSubmit,
}) {
  const canSubmitStateHospital =
    form.disposition === 'state_hospital'
    && form.destination_facility_id
    && form.reason?.trim();
  const canSubmitMortuary =
    form.disposition === 'mortuary'
    && form.date_of_death;

  const canSubmit =
    form.disposition === 'state_hospital'
      ? canSubmitStateHospital
      : form.disposition === 'mortuary'
        ? canSubmitMortuary
        : false;

  return (
    <div className="space-y-4">
      {handover?.consultation ? (
        <section className={c.readOnlyGroup}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className={c.readOnlyGroupTitle}>Clinical summary</h3>
            <span className={c.readOnlyBadge}>Read only</span>
          </div>
          <p className="mt-3 text-sm">
            <span className="font-semibold text-slate-800">Diagnosis:</span>{' '}
            {handover.consultation.diagnosis || '—'}
          </p>
          {handover.consultation.notes ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{handover.consultation.notes}</p>
          ) : null}
        </section>
      ) : null}

      <section className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Final disposition</h3>
        <p className="mt-1 text-sm text-slate-500">
          Transfer the patient to an external state hospital or process to the mortuary.
        </p>

        <div className="mt-4">
          <IntakeSelect
            id="br-disp"
            label="Disposition action"
            className={c.select}
            value={form.disposition}
            onChange={(e) => onFormChange({ disposition: e.target.value })}
          >
            <option value="">Select disposition…</option>
            {FINAL_DISPOSITIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </IntakeSelect>
        </div>

        {form.disposition === 'state_hospital' ? (
          <div className="mt-4 space-y-4">
            {stateHospitalsLoading ? (
              <p className={c.hint}>Loading state hospital facilities…</p>
            ) : (
              <IntakeSelect
                id="br-dest"
                label="State hospital / facility"
                required
                error={stateHospitalsError}
                className={c.select}
                value={form.destination_facility_id}
                onChange={(e) => onFormChange({ destination_facility_id: e.target.value })}
              >
                <option value="">Select state hospital…</option>
                {stateHospitals.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.label || facility.name}
                  </option>
                ))}
              </IntakeSelect>
            )}
            {!stateHospitalsLoading && stateHospitals.length === 0 && !stateHospitalsError ? (
              <p className={c.hint}>No other state hospital facilities are registered in the system.</p>
            ) : null}
            <IntakeTextarea
              id="br-reason"
              label="Transfer reason"
              required
              className={c.textarea}
              rows={3}
              value={form.reason}
              onChange={(e) => onFormChange({ reason: e.target.value })}
            />
          </div>
        ) : null}

        {form.disposition === 'mortuary' ? (
          <div className="mt-4 space-y-4">
            <IntakeInput
              id="br-dod"
              label="Date of death"
              type="date"
              required
              className={c.input}
              value={form.date_of_death}
              onChange={(e) => onFormChange({ date_of_death: e.target.value })}
            />
            <IntakeInput
              id="br-cod"
              label="Cause of death (optional)"
              className={c.input}
              value={form.cause_of_death}
              onChange={(e) => onFormChange({ cause_of_death: e.target.value })}
            />
            <IntakeTextarea
              id="br-notes"
              label="Notes (optional)"
              className={c.textarea}
              rows={2}
              value={form.notes}
              onChange={(e) => onFormChange({ notes: e.target.value })}
            />
          </div>
        ) : null}

        {form.disposition ? (
          <button
            type="button"
            className={`${dispositionButtonClass(form.disposition)} mt-6`}
            disabled={actionLoading || !canSubmit}
            onClick={onSubmit}
          >
            {dispositionButtonLabel(form, actionLoading)}
          </button>
        ) : (
          <p className={`${c.hint} mt-4`}>Choose a disposition action above to continue.</p>
        )}
      </section>
    </div>
  );
}
