import { IntakeInput, IntakeSelect, IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import {
  bookingSubmitButtonClass,
  bookingSubmitLabel,
  canSubmitBooking,
  dispositionsForHandover,
  getBookingSubmitMode,
  resolveBookingTransferReason,
} from '../bookingRoomForm';

import BookingRoomTransportPanel from './BookingRoomTransportPanel';

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
  const transferPlan = handover?.transferPlan;
  const submitMode = getBookingSubmitMode(handover, form);
  const canSubmit = canSubmitBooking(handover, form, { stateHospitalsLoading });
  const dispositionOptions = dispositionsForHandover(handover);
  const pathwayRestricted = !!handover?.pathwayRestricted;
  const showDisposition = !transferPlan;
  const showTransportFields = transferPlan?.transfer_status === 'pending_booking';
  const referralReason = resolveBookingTransferReason(handover);

  return (
    <div className="space-y-4">
      <BookingRoomTransportPanel transferPlan={transferPlan} referralReason={referralReason} />

      {handover?.dermatologyAssessment ? (
        <section className={c.readOnlyGroup}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className={c.readOnlyGroupTitle}>Dermatologist assessment</h3>
            <span className={c.readOnlyBadge}>Read only</span>
          </div>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold">Skin assessment:</span> {handover.dermatologyAssessment.skin_assessment}</p>
            <p><span className="font-semibold">Observations:</span> {handover.dermatologyAssessment.clinical_observations}</p>
          </div>
        </section>
      ) : null}

      {handover?.socialWorkerAssessment ? (
        <section className={c.readOnlyGroup}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className={c.readOnlyGroupTitle}>Social Worker assessment</h3>
            <span className={c.readOnlyBadge}>Read only</span>
          </div>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Classification:</span>{' '}
              {handover.socialWorkerAssessment.severity === 'severe' ? 'Severe' : 'Routine'}
            </p>
            <p>
              <span className="font-semibold">Social assessment:</span>{' '}
              {handover.socialWorkerAssessment.social_assessment_details}
            </p>
            <p>
              <span className="font-semibold">Case history:</span>{' '}
              {handover.socialWorkerAssessment.case_history}
            </p>
            <p>
              <span className="font-semibold">Clinical notes:</span>{' '}
              {handover.socialWorkerAssessment.clinical_notes}
            </p>
          </div>
        </section>
      ) : null}

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

      {showTransportFields ? (
        <section className={c.sectionPanel}>
          <h3 className={c.sectionTitle}>Transport details</h3>
          <p className="mt-1 text-sm text-slate-500">
            Select the receiving state hospital, then submit to dispatch external porters.
          </p>
          <div className="mt-4 space-y-4">
            {stateHospitalsLoading ? (
              <p className={c.hint}>Loading state hospital facilities…</p>
            ) : (
              <IntakeSelect
                id="br-hospital"
                label="State hospital"
                required
                error={stateHospitalsError}
                className={c.select}
                value={form.destination_facility_id}
                onChange={(e) => onFormChange({ destination_facility_id: e.target.value })}
              >
                <option value="">Select hospital…</option>
                {stateHospitals.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.label || facility.name}
                  </option>
                ))}
              </IntakeSelect>
            )}
          </div>
        </section>
      ) : null}

      {showDisposition ? (
        <section className={c.sectionPanel}>
          <h3 className={c.sectionTitle}>Final disposition</h3>
          <p className="mt-1 text-sm text-slate-500">
            {pathwayRestricted
              ? 'This patient was referred from the Dermatologist. Transfer to an external state hospital only.'
              : 'Transfer the patient to an external state hospital or process to the mortuary.'}
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
              {dispositionOptions.map((d) => (
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
              {referralReason ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Transfer reason (from referring clinician)
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{referralReason}</p>
                </div>
              ) : null}
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
        </section>
      ) : null}

      {submitMode ? (
        <div className="border-t border-slate-200 pt-5">
          <button
            type="button"
            className={`${bookingSubmitButtonClass(handover, form)} w-full sm:w-auto sm:min-w-[280px]`}
            disabled={actionLoading || !canSubmit}
            onClick={onSubmit}
          >
            {bookingSubmitLabel(handover, form, actionLoading)}
          </button>
        </div>
      ) : (
        <p className={`${c.hint} border-t border-slate-200 pt-4`}>
          {transferPlan
            ? 'This transfer is already in progress with porters. No further booking room action is required.'
            : 'Choose a disposition action above to continue.'}
        </p>
      )}
    </div>
  );
}
