import { nurse as c } from '../../nurse/styles/nurseClasses';

function doctorName(doc) {
  if (!doc) return 'Clinician';
  return [doc.first_name, doc.last_name].filter(Boolean).join(' ') || 'Clinician';
}

export default function PriorConsultationsPanel({ consultations }) {
  const rows = consultations || [];

  return (
    <section className={c.readOnlyGroup}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={c.readOnlyGroupTitle}>Historical clinic notes</h3>
        <span className={c.readOnlyBadge}>Read only</span>
      </div>
      {rows.length === 0 ? (
        <p className={`${c.hint} mt-2`}>No prior consultations on file for this patient.</p>
      ) : (
        <ul className="mt-4 max-h-48 space-y-3 overflow-y-auto">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-700"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {doctorName(row.doctor)}
                {row.created_at ? ` · ${new Date(row.created_at).toLocaleDateString()}` : ''}
              </p>
              <p className="mt-1 font-semibold text-slate-900">{row.diagnosis || '—'}</p>
              {row.notes ? <p className="mt-1 leading-relaxed">{row.notes}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
