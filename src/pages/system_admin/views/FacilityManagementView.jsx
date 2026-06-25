import { admin as c, facilityTypeLabel } from '../styles/adminClasses';

export default function FacilityManagementView({
  facilities,
  loading,
  onCreateClick,
  onSelectClinic,
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
        <p className={c.cardBody}>Loading facilities…</p>
      ) : facilities.length === 0 ? (
        <div className={c.card}>
          <p className={c.cardBody}>No facilities yet. Create the first facility to get started.</p>
        </div>
      ) : (
        <div className={c.facilityGrid}>
          {facilities.map((f) => {
            const isClinic = f.type === 'clinic';
            const CardTag = isClinic ? 'button' : 'article';
            return (
              <CardTag
                key={f.id}
                type={isClinic ? 'button' : undefined}
                className={`${c.facilityCard} ${isClinic ? 'cursor-pointer text-left transition hover:border-emerald-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500/40' : ''}`}
                onClick={isClinic ? () => onSelectClinic(f) : undefined}
              >
                <h3 className={c.cardTitle}>{f.name}</h3>
                <p className={c.cardDesc}>{f.location || '—'}</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className={c.cardFieldLabel}>Type</dt>
                    <dd className={c.cardFieldValue}>{facilityTypeLabel(f.type)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className={c.cardFieldLabel}>Assigned staff</dt>
                    <dd className={`${c.cardFieldValue} tabular-nums`}>{f.staff_count ?? 0}</dd>
                  </div>
                  {isClinic ? (
                    <div className="flex justify-between gap-2">
                      <dt className={c.cardFieldLabel}>Departments</dt>
                      <dd className={`${c.cardFieldValue} tabular-nums`}>{f.department_count ?? 0}</dd>
                    </div>
                  ) : null}
                  {f.phone ? (
                    <div className="flex justify-between gap-2">
                      <dt className={c.cardFieldLabel}>Contact</dt>
                      <dd className={c.cardFieldValue}>{f.phone}</dd>
                    </div>
                  ) : null}
                </dl>
                {f.address ? (
                  <p className="mt-3 text-xs text-emerald-100/80 line-clamp-2">{f.address}</p>
                ) : null}
                {isClinic ? (
                  <p className="mt-3 text-xs font-semibold text-teal-100">View departments →</p>
                ) : null}
              </CardTag>
            );
          })}
        </div>
      )}
    </div>
  );
}
