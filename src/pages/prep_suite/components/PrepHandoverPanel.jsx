import { nurse as c } from '../../nurse/styles/nurseClasses';
import ParameterHandoverPanel from '../../screening_nurse/components/ParameterHandoverPanel';

function displayValue(value) {
  if (value == null) return '—';
  const s = String(value).trim();
  return s || '—';
}

function hivTesterDisplayName(hivTest) {
  if (!hivTest) return null;
  if (hivTest.submittedByName?.trim()) return hivTest.submittedByName.trim();
  const tester = hivTest.testedBy;
  if (!tester) return null;
  const name = [tester.first_name, tester.last_name].filter(Boolean).join(' ').trim();
  return name || null;
}

function formatReferralType(type) {
  const labels = {
    pharmacy_unavailable: 'Pharmacy unavailable',
    external_facility: 'External facility',
    specialist: 'Specialist',
    follow_up: 'Follow-up',
  };
  return labels[type] || type;
}

export default function PrepHandoverPanel({ handover, loading }) {
  if (loading) {
    return <p className={c.hint}>Loading patient records…</p>;
  }

  const {
    vitals,
    screeningAssessment,
    hivTest,
    referrals = [],
  } = handover || {};

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

      <section className={c.readOnlyGroup}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className={c.readOnlyGroupTitle}>HIV testing result</h3>
          <span className={c.readOnlyBadge}>Read only</span>
        </div>
        {!hivTest ? (
          <p className={`${c.hint} mt-2`}>No HIV test on file for this visit.</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Result</p>
              <p className="mt-1 font-semibold capitalize text-teal-800">{hivTest.result || 'negative'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Submitted by (HIV Testing Room)
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {hivTesterDisplayName(hivTest) || '—'}
              </p>
            </div>
            {hivTest.notes ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Test notes</p>
                <p className="mt-1">{hivTest.notes}</p>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className={c.readOnlyGroup}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className={c.readOnlyGroupTitle}>Referral history (this visit)</h3>
          <span className={c.readOnlyBadge}>Read only</span>
        </div>
        {referrals.length === 0 ? (
          <p className={`${c.hint} mt-2`}>No referrals recorded for this visit.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {referrals.map((ref) => (
              <li key={ref.id} className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{formatReferralType(ref.referral_type)}</p>
                {ref.destination ? (
                  <p className="mt-1 text-slate-600">Destination: {ref.destination}</p>
                ) : null}
                {ref.reason ? <p className="mt-1">{ref.reason}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
