import { useCallback, useEffect, useState } from 'react';
import { getFacilityDepartmentDetail } from '../../../api/admin';
import { admin as c } from '../styles/adminClasses';

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function ClinicDepartmentDetailView({
  facilityId,
  facilityName,
  departmentKey,
  onBack,
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFacilityDepartmentDetail(facilityId, departmentKey);
      setDetail(data);
    } catch (err) {
      setError(err.message || 'Failed to load department');
    } finally {
      setLoading(false);
    }
  }, [facilityId, departmentKey]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className={`${c.panelHeader} mb-3`}>
        <div>
          <button type="button" className={`${c.btnGhost} mb-2`} onClick={onBack}>
            ← Back to {facilityName || 'clinic'}
          </button>
          <h2 className={c.sectionTitle}>{detail?.label || departmentKey}</h2>
          <p className={c.sectionDesc}>
            Employee roster and day-to-day activity for this department (last 14 days).
          </p>
        </div>
      </div>

      {error ? <p className="mb-3 text-sm text-red-600" role="alert">{error}</p> : null}
      {loading ? (
        <p className={c.cardBody}>Loading department…</p>
      ) : (
        <>
          <div className={c.metricGrid}>
            <article className={c.metricCard}>
              <p className={c.metricValue}>{detail?.employee_count ?? 0}</p>
              <p className={c.metricLabel}>Total employees</p>
            </article>
            <article className={c.metricCard}>
              <p className={c.metricValue}>{detail?.active_employee_count ?? 0}</p>
              <p className={c.metricLabel}>Active accounts</p>
            </article>
            <article className={c.metricCard}>
              <p className={c.metricValue}>{detail?.stats?.patients_served_today ?? 0}</p>
              <p className={c.metricLabel}>Patients served today</p>
            </article>
            <article className={c.metricCard}>
              <p className={c.metricValue}>{detail?.stats?.patients_served_14d ?? 0}</p>
              <p className={c.metricLabel}>Patients served (14 days)</p>
            </article>
            <article className={c.metricCard}>
              <p className={c.metricValue}>{detail?.stats?.in_progress ?? 0}</p>
              <p className={c.metricLabel}>In progress now</p>
            </article>
          </div>

          <section className={`${c.sectionPanel} mt-4`}>
            <h3 className={c.sectionTitle}>Employees</h3>
            {detail?.employees?.length ? (
              <div className={c.tableWrap}>
                <table className={c.table}>
                  <thead>
                    <tr>
                      <th className={c.th}>Name</th>
                      <th className={c.th}>Role</th>
                      <th className={c.th}>Status</th>
                      <th className={c.th}>Today</th>
                      <th className={c.th}>14 days</th>
                      <th className={c.th}>In progress</th>
                      <th className={c.th}>Last login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.employees.map((emp) => (
                      <tr key={emp.id}>
                        <td className={c.td}>
                          {emp.first_name} {emp.last_name}
                          <div className="text-xs text-emerald-100/80">{emp.email}</div>
                        </td>
                        <td className={c.td}>{emp.role}</td>
                        <td className={c.td}>
                          {emp.is_active ? (
                            <span className={c.badgeActive}>Active</span>
                          ) : (
                            <span className={c.badgeInactive}>Inactive</span>
                          )}
                        </td>
                        <td className={`${c.td} tabular-nums`}>{emp.patients_served_today}</td>
                        <td className={`${c.td} tabular-nums`}>{emp.patients_served_14d}</td>
                        <td className={`${c.td} tabular-nums`}>{emp.in_progress}</td>
                        <td className={c.tdMuted}>{formatDateTime(emp.last_login)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={c.cardBody}>No employees assigned to this department yet.</p>
            )}
          </section>

          {detail?.change_history?.length ? (
            <section className={`${c.sectionPanel} mt-4`}>
              <h3 className={c.sectionTitle}>Department change history</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {detail.change_history.map((item) => (
                  <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="font-semibold capitalize">{item.action}</span>
                    {' · '}
                    {formatDateTime(item.created_at)}
                    {' · '}
                    {item.changed_by}
                    <p className="mt-1 text-slate-600">{item.reason}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
