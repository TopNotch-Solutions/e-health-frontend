import { IntakeTextarea } from '../../pages/nurse/components/IntakeField';
import { nurse as c } from '../../pages/nurse/styles/nurseClasses';
import {
  DISCHARGE_BUTTON_LABEL,
  DISCHARGE_REASON_LABEL,
  DISCHARGE_REASON_PLACEHOLDER,
  DISCHARGE_SECTION_DESCRIPTION,
  DISCHARGE_SECTION_TITLE,
} from '../../utils/dischargeDocumentation';

export default function DischargePatientSection({
  idPrefix = 'discharge',
  dischargeReason,
  onDischargeReasonChange,
  error,
  actionLoading,
  onDischarge,
  locked = false,
  lockedMessage,
}) {
  const canDischarge = Boolean(dischargeReason?.trim()) && !locked && !actionLoading;

  return (
    <section className={`${c.sectionPanel} border-slate-300`} aria-labelledby={`${idPrefix}-discharge-heading`}>
      <h3 id={`${idPrefix}-discharge-heading`} className={c.sectionTitle}>
        {DISCHARGE_SECTION_TITLE}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        {DISCHARGE_SECTION_DESCRIPTION}
      </p>

      {locked && lockedMessage ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>{lockedMessage}</span>
        </div>
      ) : null}

      <div className={`mt-4 space-y-4 ${locked ? 'pointer-events-none opacity-50' : ''}`}>
        <IntakeTextarea
          id={`${idPrefix}-reason`}
          label={DISCHARGE_REASON_LABEL}
          required
          error={error}
          className={c.textarea}
          rows={4}
          placeholder={DISCHARGE_REASON_PLACEHOLDER}
          value={dischargeReason}
          onChange={(e) => onDischargeReasonChange(e.target.value)}
        />
        <button
          type="button"
          className={`${c.btnAction} ${c.btnDischarge} max-w-md`}
          disabled={!canDischarge}
          onClick={onDischarge}
        >
          {actionLoading ? 'Saving record…' : DISCHARGE_BUTTON_LABEL}
        </button>
      </div>
    </section>
  );
}
