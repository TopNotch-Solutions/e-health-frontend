import { admin as c } from '../styles/adminClasses';

function fullName(row) {
  return [row.first_name, row.last_name].filter(Boolean).join(' ').trim() || '—';
}

function adminScopeLabel(row) {
  if (row.admin_scope === 'national') return 'All hospitals & clinics';
  return row.facility?.name || '—';
}

export default function SystemAdminManagementView({
  admins,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRegisterClick,
  onToggleActive,
  togglingId,
  currentUserId,
}) {
  return (
    <div>
      <div className={`${c.panelHeader} mb-3`}>
        <div>
          <h2 className={c.sectionTitle}>System administrators</h2>
          <p className={c.sectionDesc}>
            National accounts with access to every state hospital and clinic. Use inactivate instead
            of delete — records stay in audit logs.
          </p>
        </div>
        <button type="button" className={c.btnPrimary} onClick={onRegisterClick}>
          Add system administrator
        </button>
      </div>

      <div className={c.filters}>
        <input
          type="search"
          className={`${c.searchInput} max-w-xs`}
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search administrators"
        />
        <select
          className={`${c.select} w-auto min-w-[140px]`}
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
      </div>

      <div className={c.tableWrap}>
        <table className={c.table}>
          <thead>
            <tr>
              <th className={c.th}>Full name</th>
              <th className={c.th}>Email</th>
              <th className={c.th}>Scope</th>
              <th className={c.th}>Registered by</th>
              <th className={c.th}>Status</th>
              <th className={c.th}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr>
                <td colSpan={6} className={c.tdMuted}>
                  Loading administrators…
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={6} className={c.tdMuted}>
                  No administrators match your filters.
                </td>
              </tr>
            ) : (
              admins.map((row) => {
                const inactive = !row.is_active;
                const isSelf = row.id === currentUserId;
                return (
                  <tr key={row.id} className={inactive ? c.rowInactive : ''}>
                    <td className={`${c.td} font-medium`}>
                      {fullName(row)}
                      {isSelf ? (
                        <span className="ml-2 text-xs font-normal text-emerald-100/80">(you)</span>
                      ) : null}
                    </td>
                    <td className={c.td}>{row.email}</td>
                    <td className={c.td}>{adminScopeLabel(row)}</td>
                    <td className={c.td}>{row.registered_by || '—'}</td>
                    <td className={c.td}>
                      {inactive ? (
                        <span className={c.badgeInactive}>Inactive</span>
                      ) : (
                        <span className={c.badgeActive}>Active</span>
                      )}
                    </td>
                    <td className={c.td}>
                      {inactive ? (
                        <button
                          type="button"
                          className={c.btnSuccess}
                          disabled={togglingId === row.id}
                          onClick={() => onToggleActive(row, true)}
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={c.btnDanger}
                          disabled={togglingId === row.id || isSelf}
                          title={isSelf ? 'You cannot inactivate your own account' : undefined}
                          onClick={() => onToggleActive(row, false)}
                        >
                          Inactivate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
