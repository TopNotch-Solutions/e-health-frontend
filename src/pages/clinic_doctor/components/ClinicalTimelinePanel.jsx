import { nurse as c } from '../../nurse/styles/nurseClasses';
import ParameterHandoverPanel from '../../screening_nurse/components/ParameterHandoverPanel';
import ScreeningHandoverPanel from './ScreeningHandoverPanel';
import { pathTypeLabel } from '../clinicDoctorForm';

export default function ClinicalTimelinePanel({ timeline, loading }) {
  if (loading) {
    return (
      <section className={c.readOnlyGroup}>
        <p className={c.hint}>Loading clinical timeline…</p>
      </section>
    );
  }

  if (!timeline) {
    return (
      <section className={c.readOnlyGroup}>
        <h3 className={c.readOnlyGroupTitle}>Clinical timeline</h3>
        <p className={`${c.hint} mt-2`}>No upstream clinical records for this visit yet.</p>
      </section>
    );
  }

  const { vitals, screeningAssessment, pathType } = timeline;
  const showParameter = Boolean(vitals);
  const showScreening = pathType === 'sick' && Boolean(screeningAssessment);

  return (
    <div className="space-y-4">
      <section className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Clinical timeline</h3>
        <p className="mt-1 text-sm text-slate-500">{pathTypeLabel(pathType)}</p>
      </section>

      {showParameter ? (
        <ParameterHandoverPanel vitals={vitals} loading={false} />
      ) : (
        <section className={c.readOnlyGroup}>
          <h3 className={c.readOnlyGroupTitle}>Parameter Nurse handover</h3>
          <p className={`${c.hint} mt-2`}>No parameter nurse vitals recorded for this visit.</p>
        </section>
      )}

      {pathType === 'sick' ? (
        showScreening ? (
          <ScreeningHandoverPanel assessment={screeningAssessment} />
        ) : (
          <section className={c.readOnlyGroup}>
            <h3 className={c.readOnlyGroupTitle}>Screening Nurse handover</h3>
            <p className={`${c.hint} mt-2`}>No screening assessment recorded for this visit.</p>
          </section>
        )
      ) : null}
    </div>
  );
}
