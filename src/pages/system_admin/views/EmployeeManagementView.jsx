import { admin as c } from '../styles/adminClasses';

function fullName(row) {
  return [row.first_name, row.last_name].filter(Boolean).join(' ').trim() || '—';
}

function facilityName(row) {
  return row.facility?.name || '—';
}

function roleLabel(row) {
  return row.role?.display_name || row.role?.name || '—';
}

export default function EmployeeManagementView({
  employees,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  facilityFilter,
  onFacilityFilterChange,
  facilities,
  roles,
  onRoleFilterChange,
  roleFilter,
  onRegisterClick,
  onToggleActive,
  togglingId,
}) {
  return (
    <div>
      <div className={`${c.panelHeader} mb-3`}>
        <div>
          <h2 className={c.sectionTitle}>Employee management</h2>
          <p className={c.sectionDesc}>
            Search and manage staff. Use inactivate instead of delete — records stay in audit logs.
          </p>
        </div>
        <button type="button" className={c.btnPrimary} onClick={onRegisterClick}>
          Register new employee
        </button>
      </div>

      <div className={`${c.filters}`}>
        <input
          type="search"
          className={`${c.searchInput} max-w-xs`}
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search employees"
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
        <select
          className={`${c.select} w-auto min-w-[160px]`}
          value={facilityFilter}
          onChange={(e) => onFacilityFilterChange(e.target.value)}
          aria-label="Filter by facility"
        >
          <option value="">All facilities</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <select
          className={`${c.select} w-auto min-w-[160px]`}
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.name}>
              {r.display_name || r.name}
            </option>
          ))}
        </select>
      </div>

      <div className={c.tableWrap}>
        <table className={c.table}>
          <thead>
            <tr>
              <th className={c.th}>Full name</th>
              <th className={c.th}>Email</th>
              <th className={c.th}>Role</th>
              <th className={c.th}>Assigned facility</th>
              <th className={c.th}>Status</th>
              <th className={c.th}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className={c.tdMuted}>
                  Loading employees…
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={6} className={c.tdMuted}>
                  No employees match your filters.
                </td>
              </tr>
            ) : (
              employees.map((row) => {
                const inactive = !row.is_active;
                return (
                  <tr key={row.id} className={inactive ? c.rowInactive : ''}>
                    <td className={`${c.td} font-medium`}>{fullName(row)}</td>
                    <td className={c.td}>{row.email}</td>
                    <td className={c.td}>{roleLabel(row)}</td>
                    <td className={c.td}>{facilityName(row)}</td>
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
                          disabled={togglingId === row.id}
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
