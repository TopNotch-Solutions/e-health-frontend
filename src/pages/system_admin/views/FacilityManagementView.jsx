import { admin as c, facilityTypeLabel } from '../styles/adminClasses';

export default function FacilityManagementView({
  facilities,
  loading,
  onCreateClick,
}) {
  return (
    <div>
      <div className={`${c.panelHeader} mb-3`}>
        <div>
          <h2 className={c.sectionTitle}>Facility management</h2>
          <p className={c.sectionDesc}>
            Register and oversee every state hospital, clinic, and health center on the national network.
          </p>
        </div>
        <button type="button" className={c.btnPrimary} onClick={onCreateClick}>
          Create new facility
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading facilities…</p>
      ) : facilities.length === 0 ? (
        <div className={c.card}>
          <p className="text-sm text-slate-600">No facilities yet. Create the first facility to get started.</p>
        </div>
      ) : (
        <div className={c.facilityGrid}>
          {facilities.map((f) => (
            <article key={f.id} className={c.facilityCard}>
              <h3 className="font-bold text-slate-900">{f.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.location || '—'}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Type</dt>
                  <dd className="font-medium text-slate-800">{facilityTypeLabel(f.type)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Assigned staff</dt>
                  <dd className="font-medium text-slate-800 tabular-nums">{f.staff_count ?? 0}</dd>
                </div>
                {f.phone ? (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Contact</dt>
                    <dd className="text-slate-800">{f.phone}</dd>
                  </div>
                ) : null}
              </dl>
              {f.address ? (
                <p className="mt-3 text-xs text-slate-400 line-clamp-2">{f.address}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
