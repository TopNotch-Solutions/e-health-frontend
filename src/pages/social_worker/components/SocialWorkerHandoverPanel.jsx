import { nurse as c } from '../../nurse/styles/nurseClasses';
import ParameterHandoverPanel from '../../screening_nurse/components/ParameterHandoverPanel';

export default function SocialWorkerHandoverPanel({ handover, loading }) {
  if (loading) {
    return <p className={c.hint}>Loading patient records…</p>;
  }

  const { vitals, screeningAssessment } = handover || {};

  return (
    <div className="space-y-4">
      <ParameterHandoverPanel vitals={vitals} loading={false} />

      {screeningAssessment ? (
        <section className={c.readOnlyGroup}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className={c.readOnlyGroupTitle}>Prior screening (if routed via nurse)</h3>
            <span className={c.readOnlyBadge}>Read only</span>
          </div>
          <p className="mt-3 text-sm text-slate-700">
            {screeningAssessment.reason || '—'}
          </p>
        </section>
      ) : null}
    </div>
  );
}
