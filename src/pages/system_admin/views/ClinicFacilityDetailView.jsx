import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addFacilityDepartment,
  getClinicDepartmentCatalog,
  getHospitalDepartmentCatalog,
  getFacilityDepartments,
  removeFacilityDepartments,
} from '../../../api/admin';
import { admin as c, facilityTypeLabel } from '../styles/adminClasses';
import ClinicDepartmentDetailView from './ClinicDepartmentDetailView';

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function ClinicFacilityDetailView({
  facilityId,
  facilityName,
  facilityType = 'clinic',
  onBack,
  onOpenDepartment,
  selectedDepartmentKey,
  onBackFromDepartment,
}) {
  const isHospital = facilityType === 'hospital' || facilityType === 'health_center';
  const facilityLabel = facilityTypeLabel(facilityType);
  const [summary, setSummary] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [manageMode, setManageMode] = useState(null);
  const [pendingKeys, setPendingKeys] = useState([]);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [deptSummary, deptCatalog] = await Promise.all([
        getFacilityDepartments(facilityId),
        isHospital ? getHospitalDepartmentCatalog() : getClinicDepartmentCatalog(),
      ]);
      setSummary(deptSummary);
      setCatalog(deptCatalog);
    } catch (err) {
      setError(err.message || `Failed to load ${facilityLabel.toLowerCase()} departments`);
    } finally {
      setLoading(false);
    }
  }, [facilityId, isHospital, facilityLabel]);

  useEffect(() => {
    load();
  }, [load]);

  const activeKeys = useMemo(
    () => new Set((summary?.departments || []).map((d) => d.department_key)),
    [summary]
  );

  const pendingSet = useMemo(() => new Set(pendingKeys), [pendingKeys]);

  const catalogByKey = useMemo(
    () => Object.fromEntries((catalog?.departments || []).map((d) => [d.key, d])),
    [catalog]
  );

  const availableToAdd = useMemo(() => {
    const effectiveActive = new Set([...activeKeys, ...pendingKeys]);
    return (catalog?.departments || []).filter((d) => !activeKeys.has(d.key)).map((d) => ({
      ...d,
      requiresMissing: d.requires_department && !effectiveActive.has(d.requires_department),
    }));
  }, [catalog, activeKeys, pendingKeys]);

  const removableDepartments = useMemo(
    () => (summary?.departments || []).filter((d) => !d.is_foundation),
    [summary]
  );

  const allDepartmentsAdded = useMemo(() => {
    const catalogDepts = catalog?.departments || [];
    if (!catalogDepts.length) return false;
    return catalogDepts.every((d) => activeKeys.has(d.key));
  }, [catalog, activeKeys]);

  const autoCascadeKeys = useMemo(() => {
    const auto = new Set();
    for (const key of pendingKeys) {
      for (const cascadeKey of catalogByKey[key]?.removal_cascades_to || []) {
        if (!pendingSet.has(cascadeKey) && activeKeys.has(cascadeKey)) {
          auto.add(cascadeKey);
        }
      }
    }
    return [...auto];
  }, [pendingKeys, pendingSet, catalogByKey, activeKeys]);

  const autoCascadeLabels = autoCascadeKeys.map(
    (key) => catalogByKey[key]?.label || key
  );

  if (selectedDepartmentKey) {
    return (
      <ClinicDepartmentDetailView
        facilityId={facilityId}
        facilityName={facilityName}
        departmentKey={selectedDepartmentKey}
        onBack={onBackFromDepartment}
      />
    );
  }

  function closeManagePanel() {
    setManageMode(null);
    setPendingKeys([]);
    setReason('');
  }

  function openManagePanel(mode) {
    if (manageMode === mode) {
      closeManagePanel();
      return;
    }
    setManageMode(mode);
    setPendingKeys([]);
    setReason('');
    setError('');
  }

  function togglePendingDepartment(key) {
    const dept = catalogByKey[key];
    if (manageMode === 'add') {
      if (dept?.requires_department && !activeKeys.has(dept.requires_department) && !pendingSet.has(dept.requires_department)) {
        return;
      }
      setPendingKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
          (dept?.removal_cascades_to || []).forEach((cascadeKey) => next.delete(cascadeKey));
        } else {
          next.add(key);
        }
        return [...next];
      });
      return;
    }

    setPendingKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        (dept?.removal_cascades_to || []).forEach((cascadeKey) => next.delete(cascadeKey));
      } else {
        next.add(key);
        (dept?.removal_cascades_to || []).forEach((cascadeKey) => {
          if (activeKeys.has(cascadeKey)) next.add(cascadeKey);
        });
      }
      return [...next];
    });
  }

  async function handleAddDepartments() {
    if (!pendingKeys.length || !reason.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await addFacilityDepartment(facilityId, {
        department_keys: pendingKeys,
        reason: reason.trim(),
      });
      setSummary(updated);
      closeManagePanel();
    } catch (err) {
      setError(err.message || 'Could not add departments');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveDepartments() {
    if (!pendingKeys.length || !reason.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await removeFacilityDepartments(facilityId, {
        department_keys: pendingKeys,
        reason: reason.trim(),
      });
      setSummary(updated);
      closeManagePanel();
    } catch (err) {
      setError(err.message || 'Could not remove departments');
    } finally {
      setSubmitting(false);
    }
  }

  const selectionCount = pendingKeys.length;
  const isAddMode = manageMode === 'add';
  const isRemoveMode = manageMode === 'remove';

  return (
    <div>
      <div className={`${c.panelHeader} mb-3`}>
        <div>
          <button type="button" className={`${c.btnGhost} mb-2`} onClick={onBack}>
            ← Back to facilities
          </button>
          <h2 className={c.sectionTitle}>{facilityName || summary?.facility?.name || facilityLabel}</h2>
          <p className={c.sectionDesc}>
            Departments and staff assigned to this {facilityLabel.toLowerCase()}. Click a department to view employees and activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!allDepartmentsAdded ? (
            <button
              type="button"
              className={isAddMode ? c.btnPrimary : c.btnSecondary}
              onClick={() => openManagePanel('add')}
              disabled={submitting}
            >
              {isAddMode ? 'Close add' : 'Add departments'}
            </button>
          ) : null}
          <button
            type="button"
            className={isRemoveMode ? c.btnDanger : c.btnSecondary}
            onClick={() => openManagePanel('remove')}
            disabled={submitting || removableDepartments.length === 0}
          >
            {isRemoveMode ? 'Close remove' : 'Remove departments'}
          </button>
        </div>
      </div>

      {error ? <p className="mb-3 text-sm text-red-600" role="alert">{error}</p> : null}

      {isAddMode && !allDepartmentsAdded ? (
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-bold text-slate-900">Add departments</h3>
          <p className="mt-1 text-xs text-slate-600">
            Select one or more departments to add. A single reason applies to all selected departments.
          </p>

          {availableToAdd.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">All departments are already active at this {facilityLabel.toLowerCase()}.</p>
          ) : (
            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
              {availableToAdd.map((dept) => {
                const requiredLabel = dept.requires_department
                  ? catalogByKey[dept.requires_department]?.label
                  : null;
                return (
                  <label
                    key={dept.key}
                    className={`flex items-center gap-2 text-sm ${
                      dept.requiresMissing ? 'text-slate-500' : 'text-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={pendingSet.has(dept.key)}
                      disabled={dept.requiresMissing}
                      onChange={() => togglePendingDepartment(dept.key)}
                    />
                    <span>
                      {dept.label}
                      {dept.requiresMissing && requiredLabel ? (
                        <span className="ml-1 text-xs text-slate-500">(requires {requiredLabel})</span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          <div className="mt-3">
            <label className={c.label} htmlFor="add-dept-reason">Reason *</label>
            <textarea
              id="add-dept-reason"
              className={c.input}
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are these departments being added?"
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xs text-slate-600">
              {selectionCount === 0
                ? 'No departments selected'
                : `${selectionCount} department${selectionCount === 1 ? '' : 's'} selected`}
            </p>
            <button
              type="button"
              className={c.btnPrimary}
              disabled={submitting || selectionCount === 0 || !reason.trim() || availableToAdd.length === 0}
              onClick={handleAddDepartments}
            >
              {submitting
                ? 'Adding…'
                : selectionCount <= 1
                  ? 'Add department'
                  : `Add ${selectionCount} departments`}
            </button>
          </div>
        </section>
      ) : null}

      {isRemoveMode ? (
        <section className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-950">Remove departments</h3>
          <p className="mt-1 text-xs text-amber-900">
            Select one or more departments to remove. Foundation departments cannot be removed.
            Removing Billing also removes Revenue Office.
          </p>

          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto rounded-lg border border-amber-200 bg-white p-3">
            {removableDepartments.map((dept) => (
              <label key={dept.department_key} className="flex items-center gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  checked={pendingSet.has(dept.department_key)}
                  onChange={() => togglePendingDepartment(dept.department_key)}
                />
                <span>{dept.label}</span>
              </label>
            ))}
          </div>

          {autoCascadeLabels.length > 0 ? (
            <p className="mt-2 text-xs text-amber-900">
              <strong>{autoCascadeLabels.join(', ')}</strong> will also be removed automatically
              with your selection.
            </p>
          ) : null}

          <div className="mt-3">
            <label className={c.label} htmlFor="remove-dept-reason">Reason *</label>
            <textarea
              id="remove-dept-reason"
              className={c.input}
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are these departments being removed?"
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xs text-amber-900">
              {selectionCount === 0
                ? 'No departments selected'
                : `${selectionCount} department${selectionCount === 1 ? '' : 's'} selected`}
            </p>
            <button
              type="button"
              className={c.btnDanger}
              disabled={submitting || selectionCount === 0 || !reason.trim()}
              onClick={handleRemoveDepartments}
            >
              {submitting
                ? 'Removing…'
                : selectionCount <= 1
                  ? 'Remove department'
                  : `Remove ${selectionCount} departments`}
            </button>
          </div>
        </section>
      ) : null}

      {loading ? (
        <p className={c.cardBody}>Loading departments…</p>
      ) : (
        <>
          <div className={c.metricGrid}>
            <article className={c.metricCard}>
              <p className={c.metricValue}>{summary?.departments?.length ?? 0}</p>
              <p className={c.metricLabel}>Active departments</p>
            </article>
            <article className={c.metricCard}>
              <p className={c.metricValue}>{summary?.total_employees ?? 0}</p>
              <p className={c.metricLabel}>Assigned staff</p>
            </article>
          </div>

          <div className={`${c.facilityGrid} mt-4`}>
            {(summary?.departments || []).map((dept) => (
              <article key={dept.department_key} className={c.facilityCard}>
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => onOpenDepartment(dept.department_key)}
                >
                  <h3 className={c.cardTitle}>
                    {dept.label}
                    {dept.is_foundation ? (
                      <span className="ml-2 text-xs font-semibold text-teal-200">Foundation</span>
                    ) : null}
                  </h3>
                  <p className={c.cardDesc}>{dept.department_key}</p>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className={c.cardFieldLabel}>Employees</dt>
                      <dd className={`${c.cardFieldValue} tabular-nums`}>{dept.employee_count}</dd>
                    </div>
                  </dl>
                </button>
                {dept.is_foundation ? (
                  <p className="mt-4 text-center text-xs text-emerald-100/80">
                    Foundation department — cannot be removed
                  </p>
                ) : null}
              </article>
            ))}
          </div>

          <section className={`${c.sectionPanel} mt-4`}>
            <h3 className={c.sectionTitle}>Department change history</h3>
            <p className={c.sectionDesc}>
              Record of departments added to or removed from this {facilityLabel.toLowerCase()}, with reasons.
            </p>
            {summary?.change_history?.length ? (
              <div className={`${c.tableWrap} mt-3`}>
                <table className={c.table}>
                  <thead>
                    <tr>
                      <th className={c.th}>Date</th>
                      <th className={c.th}>Department</th>
                      <th className={c.th}>Action</th>
                      <th className={c.th}>Reason</th>
                      <th className={c.th}>Changed by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.change_history.map((item) => (
                      <tr key={item.id}>
                        <td className={c.tdMuted}>{formatDateTime(item.created_at)}</td>
                        <td className={c.td}>{item.department_label}</td>
                        <td className={c.td}>
                          {item.action === 'added' ? (
                            <span className={c.badgeActive}>Added</span>
                          ) : (
                            <span className={c.badgeInactive}>Removed</span>
                          )}
                        </td>
                        <td className={c.td}>{item.reason}</td>
                        <td className={c.tdMuted}>{item.changed_by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={`${c.cardBody} mt-3`}>No department changes recorded yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
