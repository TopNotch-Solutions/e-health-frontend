import { useRef } from 'react';
import { admin as c } from '../styles/adminClasses';
import {
  auditUserLabel,
  formatIcd10AuditSummary,
  icd10ActionLabel,
} from '../../../utils/icd10AuditFormat';

function formatTs(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

export default function Icd10ManagementView({
  rows,
  total,
  totalActive,
  totalInactive,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddClick,
  onToggleActive,
  onUpload,
  uploading,
  togglingId,
  uploadInputRef,
  auditLogs,
  auditLoading,
  onRefreshAudit,
}) {
  const localRef = useRef(null);
  const fileRef = uploadInputRef || localRef;

  return (
    <div>
      <div className={`${c.icd10StatGrid} mb-4`}>
        <article className={c.icd10StatCard}>
          <p className={c.icd10StatValue}>{loading ? '—' : totalActive}</p>
          <p className={c.icd10StatLabel}>Total active ICD-10</p>
          <p className={c.icd10StatHint}>Visible to doctors in diagnosis lookup</p>
        </article>
        <article className={c.icd10StatCard}>
          <p className={c.icd10StatValue}>{loading ? '—' : totalInactive}</p>
          <p className={c.icd10StatLabel}>Total inactive ICD-10</p>
          <p className={c.icd10StatHint}>Hidden from clinical workflows</p>
        </article>
      </div>

      <div className={`${c.panelHeader} mb-3`}>
        <div>
          <h2 className={c.sectionTitle}>ICD-10 catalog</h2>
          <p className={c.sectionDesc}>
            Maintain diagnosis codes used by Master Doctor and Emergency Unit Doctor.
            Inactivate instead of delete — doctors only see active codes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={c.btnSecondary} onClick={onAddClick}>
            Add code
          </button>
          <button
            type="button"
            className={c.btnPrimary}
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? 'Uploading…' : 'Upload .xlsx'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <div className={`${c.card} mb-3`}>
        <p className="text-sm text-slate-600">
          Excel upload expects columns <span className="font-mono font-semibold">ICD10_Code</span> and{' '}
          <span className="font-mono font-semibold">description</span>. Existing codes are updated;
          new codes are added and set active.
        </p>
      </div>

      <div className={c.filters}>
        <input
          type="search"
          className={`${c.searchInput} max-w-xs`}
          placeholder="Search code or description…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search ICD-10 codes"
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
        <span className="text-sm text-slate-500 tabular-nums">{total} code{total !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading ICD-10 catalog…</p>
      ) : rows.length === 0 ? (
        <div className={c.card}>
          <p className="text-sm text-slate-600">No ICD-10 codes match your filters.</p>
        </div>
      ) : (
        <div className={c.tableWrap}>
          <table className={c.table}>
            <thead>
              <tr>
                <th className={c.th}>ICD-10 code</th>
                <th className={c.th}>Description</th>
                <th className={c.th}>Status</th>
                <th className={c.th}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className={row.is_active ? '' : c.rowInactive}>
                  <td className={`${c.td} font-mono font-semibold`}>{row.code}</td>
                  <td className={c.td}>{row.description}</td>
                  <td className={c.td}>
                    {row.is_active ? (
                      <span className={c.badgeActive}>Active</span>
                    ) : (
                      <span className={c.badgeInactive}>Inactive</span>
                    )}
                  </td>
                  <td className={c.td}>
                    {row.is_active ? (
                      <button
                        type="button"
                        className={c.btnDanger}
                        disabled={togglingId === row.id}
                        onClick={() => onToggleActive(row, false)}
                      >
                        {togglingId === row.id ? '…' : 'Inactivate'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={c.btnSuccess}
                        disabled={togglingId === row.id}
                        onClick={() => onToggleActive(row, true)}
                      >
                        {togglingId === row.id ? '…' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={`${c.sectionPanel} mt-6`}>
        <div className={c.panelHeader}>
          <div>
            <h3 className={c.sectionTitle}>ICD-10 audit trail</h3>
            <p className={c.sectionDesc}>
              Who added, activated, or inactivated codes — including bulk spreadsheet imports.
            </p>
          </div>
          <button type="button" className={c.btnSecondary} onClick={onRefreshAudit}>
            Refresh
          </button>
        </div>
        <div className={`${c.tableWrap} mt-3`}>
          <table className={c.table}>
            <thead>
              <tr>
                <th className={c.th}>Time</th>
                <th className={c.th}>User</th>
                <th className={c.th}>Action</th>
                <th className={c.th}>ICD-10 / details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLoading ? (
                <tr>
                  <td colSpan={4} className={c.tdMuted}>Loading audit trail…</td>
                </tr>
              ) : !auditLogs?.length ? (
                <tr>
                  <td colSpan={4} className={c.tdMuted}>No ICD-10 audit entries yet.</td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className={`${c.td} whitespace-nowrap text-xs`}>{formatTs(log.timestamp)}</td>
                    <td className={c.td}>{auditUserLabel(log)}</td>
                    <td className={c.td}>{icd10ActionLabel(log.action)}</td>
                    <td className={c.td}>{formatIcd10AuditSummary(log)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
