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

function severityLabel(severity) {
  if (severity === 'severe') return 'Severe — escalated';
  if (severity === 'routine') return 'Routine';
  return displayValue(severity);
}

export default function PapSmearHandoverPanel({ screening }) {
  if (!screening) return null;

  const recorder = screening.screenedBy
    ? [screening.screenedBy.first_name, screening.screenedBy.last_name].filter(Boolean).join(' ')
    : null;

  return (
    <section className={c.readOnlyGroup}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={c.readOnlyGroupTitle}>Pap Smear Suite handover</h3>
        <span className={c.readOnlyBadge}>Read only</span>
      </div>
      {recorder ? (
        <p className="mt-1 text-xs text-slate-500">Documented by {recorder}</p>
      ) : null}

      <div className="mt-4 space-y-3">
        <FieldCard label="Classification" value={severityLabel(screening.severity)} />
        <FieldCard label="Screening details" value={screening.screening_details} />
        <FieldCard label="Test observations" value={screening.test_observations} />
        <FieldCard label="Clinical findings" value={screening.clinical_findings} />
      </div>
    </section>
  );
}
