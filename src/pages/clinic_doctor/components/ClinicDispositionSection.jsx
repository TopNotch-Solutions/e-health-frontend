import { IntakeInput, IntakeSelect } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import DoctorPrescriptionSection from '../../doctor/components/DoctorPrescriptionSection';
import {
  CLINIC_DISPOSITIONS,
  dispositionButtonLabel,
  dispositionRequiresPrescription,
  dispositionShowsPrescription,
} from '../clinicDoctorForm';

const ROUTING_BTN_STRUCTURE =
  'w-full rounded-lg py-3 text-sm font-semibold text-white shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const ROUTING_BTN_COLORS = {
  pharmacy: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500',
  follow_up: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
  booking_room: 'bg-amber-700 hover:bg-amber-800 focus:ring-amber-500',
  emergency_unit: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
};

function dispositionButtonClass(disposition) {
  const colorKey = disposition || 'pharmacy';
  return `${ROUTING_BTN_STRUCTURE} ${ROUTING_BTN_COLORS[colorKey] || ROUTING_BTN_COLORS.pharmacy}`;
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 10h-1V7a4 4 0 10-8 0v3H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2zm-3 0h-4V7a2 2 0 114 0v3z" />
    </svg>
  );
}

export default function ClinicDispositionSection({
  unlocked,
  form,
  fieldErrors,
  onDispositionChange,
  onFollowUpDateChange,
  onSubmit,
  actionLoading,
  canSubmitDisposition,
  hasPrescription,
  catalog,
  catalogLoading,
  catalogError,
  medLine,
  medFieldErrors,
  onMedFieldChange,
  onMedicationSelect,
  liveStock,
  stockChecking,
  prescriptionLines,
  onAddMedToList,
  onRemoveMedLine,
}) {
  const submitLabel = dispositionButtonLabel(form, actionLoading, hasPrescription);
  const showPrescription = dispositionShowsPrescription(form.disposition);
  const prescriptionRequired = dispositionRequiresPrescription(form.disposition);

  return (
    <section className={`${c.sectionPanel} relative`} aria-labelledby="cd-disposition-heading">
      <h3 id="cd-disposition-heading" className={c.sectionTitle}>
        Disposition &amp; routing
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Route to pharmacy, schedule a follow-up, or transfer to the Booking Room. You may add
        medications with follow-up or Booking Room dispositions.
      </p>

      {!unlocked ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <LockIcon />
          <span>Complete the diagnosis field above to unlock disposition controls.</span>
        </div>
      ) : null}

      <div className={`mt-4 space-y-4 ${unlocked ? '' : 'pointer-events-none opacity-50'}`}>
        <IntakeSelect
          id="cd-disposition"
          label="Disposition action"
          error={fieldErrors.disposition}
          className={c.select}
          value={form.disposition}
          disabled={!unlocked}
          onChange={(e) => onDispositionChange(e.target.value)}
        >
          <option value="">Select disposition…</option>
          {CLINIC_DISPOSITIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </IntakeSelect>

        {showPrescription ? (
          <>
            {!prescriptionRequired ? (
              <p className="text-sm text-slate-600">
                Optional: add medications below to send a prescription to the pharmacy at the same time.
              </p>
            ) : null}
            <DoctorPrescriptionSection
              catalog={catalog}
              catalogLoading={catalogLoading}
              catalogError={catalogError}
              medLine={medLine}
              medFieldErrors={medFieldErrors}
              onMedFieldChange={onMedFieldChange}
              onMedicationSelect={onMedicationSelect}
              liveStock={liveStock}
              stockChecking={stockChecking}
              prescriptionLines={prescriptionLines}
              onAddMedToList={onAddMedToList}
              onRemoveMedLine={onRemoveMedLine}
              actionLoading={actionLoading}
              onSendToPharmacy={() => {}}
              hideSubmitButton
            />
          </>
        ) : null}

        {form.disposition === 'follow_up' ? (
          <IntakeInput
            id="cd-follow-up-date"
            label="Follow-up date"
            type="date"
            required
            error={fieldErrors.follow_up_date}
            className={c.input}
            value={form.follow_up_date}
            onChange={(e) => onFollowUpDateChange(e.target.value)}
          />
        ) : null}

        {fieldErrors.prescription ? (
          <p className={c.fieldError} role="alert">{fieldErrors.prescription}</p>
        ) : null}

        {form.disposition ? (
          <button
            type="button"
            disabled={!unlocked || actionLoading || !canSubmitDisposition}
            className={dispositionButtonClass(form.disposition)}
            onClick={onSubmit}
          >
            {submitLabel}
          </button>
        ) : (
          <p className={c.hint}>Choose a disposition action above to continue.</p>
        )}
      </div>
    </section>
  );
}
