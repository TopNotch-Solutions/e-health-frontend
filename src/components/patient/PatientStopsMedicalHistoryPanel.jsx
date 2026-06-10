import { useState } from 'react';
import { nurse as c } from '../../pages/nurse/styles/nurseClasses';
import { formatDateTime, formatLabel, formatVitalsLine } from '../../pages/front_office/utils/ehrUtils';

function displayValue(value) {
  if (value == null) return '—';
  const s = String(value).trim();
  return s || '—';
}

function FieldRow({ label, value }) {
  if (!value || displayValue(value) === '—') return null;
  return (
    <p>
      <span className="font-semibold text-slate-800">{label}: </span>
      {displayValue(value)}
    </p>
  );
}

function VitalsBlock({ vitals }) {
  if (!vitals) return <p className="text-sm text-slate-500">No vitals recorded.</p>;
  const summary = formatVitalsLine(vitals);
  return (
    <div className="space-y-2 text-sm text-slate-700">
      {summary ? <p>{summary}</p> : null}
      <FieldRow label="Chief complaint" value={vitals.chief_complaint} />
      <FieldRow label="Allergies" value={vitals.allergies} />
      <FieldRow label="Current medications" value={vitals.current_medications} />
      <FieldRow label="Immunization status" value={vitals.immunization_status} />
      <FieldRow label="Social history" value={vitals.social_history} />
      <FieldRow label="Physical examination" value={vitals.physical_examination} />
      <FieldRow label="Notes" value={vitals.notes} />
    </div>
  );
}

function ClinicalBlock({ clinical }) {
  if (!clinical) return null;

  if (clinical.vitals) {
    return (
      <div className="mt-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vitals at this stop</p>
        <VitalsBlock vitals={clinical.vitals} />
      </div>
    );
  }

  if (clinical.consultations?.length) {
    return (
      <ul className="mt-2 space-y-2">
        {clinical.consultations.map((row, idx) => (
          <li key={idx} className="rounded-lg border border-slate-200 bg-white/80 p-3 text-sm">
            <FieldRow label="Diagnosis" value={row.diagnosis} />
            <FieldRow label="Notes" value={row.notes} />
          </li>
        ))}
      </ul>
    );
  }

  const simpleFields = Object.entries(clinical).filter(([, v]) => v != null && v !== '');
  if (!simpleFields.length) return null;

  return (
    <div className="mt-2 space-y-1 text-sm text-slate-700">
      {simpleFields.map(([key, value]) => (
        <FieldRow
          key={key}
          label={formatLabel(key)}
          value={Array.isArray(value) ? JSON.stringify(value) : value}
        />
      ))}
    </div>
  );
}

function VisitCard({ visit, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full flex-wrap items-start justify-between gap-3 p-4 text-left hover:bg-slate-50/80"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <p className="font-mono text-sm font-bold text-slate-900">{visit.visit_number}</p>
          <p className="mt-1 text-sm text-slate-600">
            {formatDateTime(visit.created_at)}
            {' · '}
            {formatLabel(visit.visit_type)}
            {' · '}
            {formatLabel(visit.status)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {visit.stops?.length || 0} stop{(visit.stops?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <span className="text-sm font-medium text-teal-700">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-slate-100 px-4 py-4">
          <section className={c.readOnlySectionCard}>
            <h4 className={c.readOnlySectionTitle}>Visit vitals</h4>
            <div className="mt-2">
              <VitalsBlock vitals={visit.vitals} />
            </div>
          </section>

          {visit.stops?.length ? (
            <section>
              <h4 className={c.readOnlySectionTitle}>Stops</h4>
              <ol className="mt-3 space-y-3">
                {visit.stops.map((stop, index) => (
                  <li
                    key={`${stop.department}-${stop.arrived_at}-${index}`}
                    className="rounded-lg border border-slate-200 bg-slate-50/80 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-teal-800">
                        Stop {index + 1}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {stop.department_label || formatLabel(stop.department)}
                      </span>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {formatLabel(stop.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTime(stop.arrived_at)}
                      {stop.completed_at ? ` → ${formatDateTime(stop.completed_at)}` : ''}
                    </p>
                    {stop.notes ? (
                      <p className="mt-2 text-sm text-slate-600">{stop.notes}</p>
                    ) : null}
                    <ClinicalBlock clinical={stop.clinical} />
                  </li>
                ))}
              </ol>
            </section>
          ) : (
            <p className="text-sm text-slate-500">No queue stops recorded for this visit.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}

export default function PatientStopsMedicalHistoryPanel({ history, loading, error }) {
  if (loading) {
    return (
      <section className={c.readOnlyGroup}>
        <p className={c.hint}>Loading patient medical history…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={c.readOnlyGroup}>
        <p className="text-sm text-red-700" role="alert">{error}</p>
      </section>
    );
  }

  const visits = history?.visits || [];

  return (
    <section className={c.readOnlyGroup}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={c.readOnlyGroupTitle}>Patient medical history</h3>
        <span className={c.readOnlyBadge}>Read only</span>
      </div>
      <p className={`${c.hint} mt-1`}>
        All visits, stops, and vitals on file. Staff who attended the patient are not shown.
      </p>

      {!visits.length ? (
        <p className={`${c.hint} mt-4`}>No prior visits or stops on file for this patient.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {visits.map((visit, index) => (
            <VisitCard key={visit.id} visit={visit} defaultOpen={index === 0} />
          ))}
        </div>
      )}
    </section>
  );
}
