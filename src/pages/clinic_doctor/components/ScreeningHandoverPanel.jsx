import { nurse as c } from '../../nurse/styles/nurseClasses';

function displayValue(value) {
  if (value == null) return '—';
  const s = String(value).trim();
  return s || '—';
}

function FieldCard({ label, value }) {
  return (
    <div className={c.readOnlyFieldCard}>
      <p className={c.readOnlyFieldLabel}>{label}</p>
      <p className={c.readOnlyFieldValue}>{displayValue(value)}</p>
    </div>
  );
}

export default function ScreeningHandoverPanel({ assessment, hideStaff = false }) {
  if (!assessment) return null;

  const recorder = assessment.recordedBy
    ? [assessment.recordedBy.first_name, assessment.recordedBy.last_name].filter(Boolean).join(' ')
    : null;

  return (
    <section className={c.readOnlyGroup}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={c.readOnlyGroupTitle}>Screening Nurse handover</h3>
        <span className={c.readOnlyBadge}>Read only</span>
      </div>
      {!hideStaff && recorder ? (
        <p className="mt-1 text-xs text-slate-500">Assessed by {recorder}</p>
      ) : null}

      <div className="mt-4 space-y-3">
        <FieldCard label="Present symptoms" value={assessment.symptoms} />
        <FieldCard label="Reason for visitation" value={assessment.reason} />
        <FieldCard label="Screening clinical impression" value={assessment.diagnosis} />
      </div>
    </section>
  );
}
