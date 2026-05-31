import { nurse as c } from '../../nurse/styles/nurseClasses';
import { classificationLabel } from '../screeningNurseForm';

function displayValue(value) {
  if (value == null) return '—';
  const s = String(value).trim();
  return s || '—';
}

function StatCard({ label, value, unit }) {
  const shown = displayValue(value);
  return (
    <div className={c.readOnlyStatCard}>
      <p className={c.readOnlyStatLabel}>{label}</p>
      <p className={c.readOnlyStatValue}>
        {shown}
        {unit && shown !== '—' ? (
          <span className="ml-0.5 text-xs font-medium text-slate-500">{unit}</span>
        ) : null}
      </p>
    </div>
  );
}

export default function ParameterHandoverPanel({ vitals, loading }) {
  if (loading) {
    return (
      <section className={c.readOnlyGroup}>
        <p className={c.hint}>Loading parameter nurse records…</p>
      </section>
    );
  }

  if (!vitals) {
    return (
      <section className={c.readOnlyGroup}>
        <h3 className={c.readOnlyGroupTitle}>Parameter Nurse handover</h3>
        <p className={`${c.hint} mt-2`}>No parameter nurse vitals recorded for this visit yet.</p>
      </section>
    );
  }

  const recorder = vitals.recordedBy
    ? [vitals.recordedBy.first_name, vitals.recordedBy.last_name].filter(Boolean).join(' ')
    : null;

  return (
    <section className={c.readOnlyGroup}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={c.readOnlyGroupTitle}>Parameter Nurse handover</h3>
        <span className={c.readOnlyBadge}>Read only</span>
      </div>
      {recorder ? (
        <p className="mt-1 text-xs text-slate-500">Recorded by {recorder}</p>
      ) : null}

      <div className="mt-4 space-y-4">
        <section className={c.readOnlySectionCard}>
          <h4 className={c.readOnlySectionTitle}>Visit classification</h4>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {classificationLabel(vitals.visit_classification)}
          </p>
        </section>

        <section className={c.readOnlySectionCard}>
          <h4 className={c.readOnlySectionTitle}>Vitals captured</h4>
          <div className={c.readOnlyStatGrid}>
            <StatCard label="BP (systolic)" value={vitals.blood_pressure_systolic} unit="mmHg" />
            <StatCard label="BP (diastolic)" value={vitals.blood_pressure_diastolic} unit="mmHg" />
            <StatCard label="Heart rate" value={vitals.pulse_rate} unit="BPM" />
            <StatCard label="Temperature" value={vitals.temperature} unit="°C" />
            <StatCard label="SpO₂" value={vitals.oxygen_saturation} unit="%" />
          </div>
        </section>
      </div>
    </section>
  );
}
