import { nurse as c } from '../../nurse/styles/nurseClasses';
import ParameterHandoverPanel from '../../screening_nurse/components/ParameterHandoverPanel';

function displayValue(value) {
  if (value == null) return '—';
  const s = String(value).trim();
  return s || '—';
}

export default function ClinicalHandoverPanel({ handover, loading }) {
  if (loading) {
    return <p className={c.hint}>Loading patient records…</p>;
  }

  const { vitals, screeningAssessment } = handover || {};

  return (
    <div className="space-y-4">
      <ParameterHandoverPanel vitals={vitals} loading={false} />

      <section className={c.readOnlyGroup}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className={c.readOnlyGroupTitle}>Screening Nurse handover</h3>
          <span className={c.readOnlyBadge}>Read only</span>
        </div>
        {!screeningAssessment ? (
          <p className={`${c.hint} mt-2`}>No screening assessment on file for this visit.</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Symptoms</p>
              <p className="mt-1">{displayValue(screeningAssessment.symptoms)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason for visit</p>
              <p className="mt-1">{displayValue(screeningAssessment.reason)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Screening impression</p>
              <p className="mt-1">{displayValue(screeningAssessment.diagnosis)}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
