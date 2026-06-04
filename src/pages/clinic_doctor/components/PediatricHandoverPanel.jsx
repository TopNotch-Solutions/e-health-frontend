import { nurse as c } from '../../nurse/styles/nurseClasses';

function displayValue(value) {
  if (value == null) return '—';
  const s = String(value).trim();
  return s || '—';
}

export default function PediatricHandoverPanel({ assessment }) {
  if (!assessment) return null;

  const recorder = assessment.assessedBy
    ? [assessment.assessedBy.first_name, assessment.assessedBy.last_name].filter(Boolean).join(' ')
    : null;

  return (
    <section className={c.readOnlyGroup}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={c.readOnlyGroupTitle}>Pediatric Corner handover</h3>
        <span className={c.readOnlyBadge}>Read only</span>
      </div>
      {recorder ? (
        <p className="mt-1 text-xs text-slate-500">Assessed by {recorder}</p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className={c.readOnlyFieldCard}>
          <p className={c.readOnlyFieldLabel}>Temperature</p>
          <p className={c.readOnlyFieldValue}>
            {assessment.temperature != null ? `${assessment.temperature} °C` : '—'}
          </p>
        </div>
        <div className={c.readOnlyFieldCard}>
          <p className={c.readOnlyFieldLabel}>Weight</p>
          <p className={c.readOnlyFieldValue}>
            {assessment.weight != null ? `${assessment.weight} kg` : '—'}
          </p>
        </div>
      </div>

      <div className={`${c.readOnlyFieldCard} mt-3`}>
        <p className={c.readOnlyFieldLabel}>General assessment</p>
        <p className={c.readOnlyFieldValue}>{displayValue(assessment.general_assessment)}</p>
      </div>
    </section>
  );
}
