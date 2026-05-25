import { admin as c } from '../styles/adminClasses';

function formatTs(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

export default function SystemSettingsView({ auditLogs, loading, onRefresh }) {
  return (
    <div>
      <div className={`${c.panelHeader} mb-3`}>
        <div>
          <h2 className={c.sectionTitle}>System settings</h2>
          <p className={c.sectionDesc}>Audit trail and platform configuration overview.</p>
        </div>
        <button type="button" className={c.btnSecondary} onClick={onRefresh}>
          Refresh logs
        </button>
      </div>

      <div className={`${c.sectionPanel} mb-3`}>
        <h3 className={c.sectionTitle}>Configuration</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>Employee lifecycle: accounts are inactivated, never deleted from the system.</li>
          <li>Facilities: hospital, clinic, and health center types are supported nationally.</li>
          <li>Billing shifts and fee schedules are managed per facility by supervisors and revenue staff.</li>
        </ul>
      </div>

      <h3 className="mb-3 text-sm font-semibold text-slate-800">Audit logs</h3>
      <div className={c.tableWrap}>
        <table className={c.table}>
          <thead>
            <tr>
              <th className={c.th}>Time</th>
              <th className={c.th}>User</th>
              <th className={c.th}>Action</th>
              <th className={c.th}>Resource</th>
              <th className={c.th}>Resource ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className={c.tdMuted}>
                  Loading audit logs…
                </td>
              </tr>
            ) : auditLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className={c.tdMuted}>
                  No audit entries yet.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className={`${c.td} whitespace-nowrap text-xs`}>{formatTs(log.timestamp)}</td>
                  <td className={c.td}>{log.user_id?.slice(0, 8) || '—'}…</td>
                  <td className={c.td}>{log.action}</td>
                  <td className={c.td}>{log.resource}</td>
                  <td className={`${c.td} font-mono text-xs`}>{log.resource_id || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
