import { nurse as c } from '../../nurse/styles/nurseClasses';

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

function FieldCard({ label, value }) {
  return (
    <div className={c.readOnlyFieldCard}>
      <p className={c.readOnlyFieldLabel}>{label}</p>
      <p className={c.readOnlyFieldValue}>{displayValue(value)}</p>
    </div>
  );
}

function SectionCard({ title, headingId, children }) {
  return (
    <section className={c.readOnlySectionCard} aria-labelledby={headingId}>
      <h4 id={headingId} className={c.readOnlySectionTitle}>
        {title}
      </h4>
      {children}
    </section>
  );
}

export default function NurseReadOnlyIntakeCards({ form, idPrefix = 'doc' }) {
  return (
    <div className={c.readOnlyGroup}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={c.readOnlyGroupTitle}>Nurse intake</h3>
      </div>

      <div className="space-y-4">
        <SectionCard title="Vital signs" headingId={`${idPrefix}-ro-vitals`}>
          <div className={c.readOnlyStatGrid}>
            <StatCard label="BP (systolic)" value={form.blood_pressure_systolic} unit="mmHg" />
            <StatCard label="BP (diastolic)" value={form.blood_pressure_diastolic} unit="mmHg" />
            <StatCard label="Heart rate" value={form.pulse_rate} unit="BPM" />
            <StatCard label="Temperature" value={form.temperature} unit="°C" />
            <StatCard label="Weight" value={form.weight} unit="kg" />
            <StatCard label="Respiratory rate" value={form.respiratory_rate} unit="/min" />
          </div>
        </SectionCard>

        <SectionCard title="Main complaint" headingId={`${idPrefix}-ro-complaint`}>
          <div className="space-y-3">
            <FieldCard label="Chief complaint" value={form.chief_complaint} />
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldCard label="Onset date" value={form.onset_date} />
              <FieldCard label="Onset time" value={form.onset_time} />
            </div>
            <FieldCard label="Aggravating factors" value={form.aggravating_factors} />
            <FieldCard label="Alleviating factors" value={form.alleviating_factors} />
          </div>
        </SectionCard>

        <SectionCard title="Medical history" headingId={`${idPrefix}-ro-history`}>
          <div className="space-y-3">
            <FieldCard label="Current medications" value={form.current_medications} />
            <FieldCard label="Immunization status" value={form.immunization_status} />
            <FieldCard label="Social history" value={form.social_history} />
          </div>
        </SectionCard>

        <SectionCard title="Physical examination" headingId={`${idPrefix}-ro-pe`}>
          <FieldCard label="Examination findings" value={form.physical_examination} />
        </SectionCard>
      </div>
    </div>
  );
}
