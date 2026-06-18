import { useEffect, useMemo, useState } from 'react';
import { getAdminEmployeeFacilityHistory, getAdminRoles } from '../../../api/admin';
import { admin as c, facilityTypeLabel, isOperationalFacility } from '../styles/adminClasses';

function formatDate(value) {
  if (!value) return 'Present';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TransferEmployeeModal({
  open,
  employee,
  onClose,
  onSubmit,
  submitting,
  facilities,
}) {
  const [facilityId, setFacilityId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [notes, setNotes] = useState('');
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const targetFacility = useMemo(
    () => facilities.find((f) => f.id === facilityId),
    [facilities, facilityId]
  );

  const currentRoleAvailable = useMemo(
    () => roles.some((r) => r.id === employee?.role?.id || r.id === employee?.role_id),
    [roles, employee]
  );

  const groupedRoles = useMemo(() => {
    const maternity = roles.filter((r) => r.name?.startsWith('maternity_'));
    const general = roles.filter((r) => !r.name?.startsWith('maternity_'));
    return { maternity, general };
  }, [roles]);

  useEffect(() => {
    if (!open || !employee) return;
    setFacilityId('');
    setRoleId('');
    setNotes('');
  }, [open, employee]);

  useEffect(() => {
    if (!open || !employee?.id) return undefined;

    let cancelled = false;
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const rows = await getAdminEmployeeFacilityHistory(employee.id);
        if (!cancelled) setHistory(rows || []);
      } catch {
        if (!cancelled) setHistory([]);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    loadHistory();
    return () => { cancelled = true; };
  }, [open, employee?.id]);

  useEffect(() => {
    if (!open || !facilityId) {
      setRoles([]);
      setRoleId('');
      return undefined;
    }

    let cancelled = false;
    const loadRoles = async () => {
      setRolesLoading(true);
      try {
        const list = await getAdminRoles({ facility_id: facilityId });
        if (cancelled) return;

        const available = list || [];
        setRoles(available);

        const currentId = employee?.role?.id || employee?.role_id;
        const canKeepRole = available.some((r) => r.id === currentId);
        setRoleId(canKeepRole ? String(currentId) : '');
      } catch {
        if (!cancelled) {
          setRoles([]);
          setRoleId('');
        }
      } finally {
        if (!cancelled) setRolesLoading(false);
      }
    };

    loadRoles();
    return () => { cancelled = true; };
  }, [open, facilityId, employee?.role?.id, employee?.role_id]);

  if (!open || !employee) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      facility_id: facilityId,
      role_id: parseInt(roleId, 10),
      notes: notes.trim(),
    });
  };

  const employeeName = [employee.first_name, employee.last_name].filter(Boolean).join(' ');

  return (
    <div className={c.modalBackdrop} role="presentation" onClick={onClose}>
      <div
        className={`${c.modal} max-w-lg`}
        role="dialog"
        aria-labelledby="transfer-employee-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="transfer-employee-title" className={c.modalTitle}>
          Transfer employee
        </h2>
        <p className={c.modalSub}>
          Move {employeeName} to another facility. Assign a role available at the destination.
          Login credentials stay unchanged and profile history is preserved.
        </p>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="font-medium text-slate-700">Current assignment</p>
          <p className="mt-1 text-slate-600">
            {employee.facility?.name || '—'} · {employee.role?.display_name || employee.role?.name || '—'}
          </p>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className={c.label} htmlFor="transfer-facility">
              Target facility
            </label>
            <select
              id="transfer-facility"
              className={c.input}
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              required
            >
              <option value="">Select destination…</option>
              {facilities
                .filter(isOperationalFacility)
                .filter((f) => f.id !== employee.facility_id)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({facilityTypeLabel(f.type)})
                  </option>
                ))}
            </select>
          </div>

          {facilityId ? (
            <div>
              <label className={c.label} htmlFor="transfer-role">
                Role at {targetFacility?.name || 'destination'}
              </label>
              <select
                id="transfer-role"
                className={c.input}
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                required
                disabled={rolesLoading}
              >
                <option value="">
                  {rolesLoading ? 'Loading roles…' : 'Select role for this facility…'}
                </option>
                {groupedRoles.maternity.length > 0 ? (
                  <optgroup label="Maternity">
                    {groupedRoles.maternity.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.display_name || r.name}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                {groupedRoles.general.length > 0 ? (
                  <optgroup label={targetFacility?.type === 'clinic' ? 'Clinic roles' : 'Hospital roles'}>
                    {groupedRoles.general.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.display_name || r.name}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
              </select>
              {!rolesLoading && facilityId && !currentRoleAvailable ? (
                <p className="mt-1 text-xs text-amber-700">
                  The employee&apos;s current role is not available at this{' '}
                  {facilityTypeLabel(targetFacility?.type)}. Select a new role to continue.
                </p>
              ) : null}
              {!rolesLoading && currentRoleAvailable && roleId ? (
                <p className="mt-1 text-xs text-slate-500">
                  Current role pre-selected when available at the destination. Change it if needed.
                </p>
              ) : null}
            </div>
          ) : null}

          <div>
            <label className={c.label} htmlFor="transfer-notes">
              Transfer notes
            </label>
            <textarea
              id="transfer-notes"
              className={c.input}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for transfer, effective date, etc."
              required
            />
          </div>

          <div>
            <p className={c.label}>Facility assignment history</p>
            <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 bg-white text-sm">
              {historyLoading ? (
                <p className="p-3 text-slate-500">Loading history…</p>
              ) : history.length === 0 ? (
                <p className="p-3 text-slate-500">No prior assignments recorded.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {history.map((row) => (
                    <li key={row.id} className="px-3 py-2">
                      <span className="font-medium">{row.facility?.name || '—'}</span>
                      {' · '}
                      {row.role?.display_name || row.role?.name || '—'}
                      <span className="block text-xs text-slate-500">
                        {formatDate(row.started_at)} – {formatDate(row.ended_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={c.btnSecondary} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className={c.btnPrimary}
              disabled={submitting || rolesLoading || !roleId || !notes.trim()}
            >
              {submitting ? 'Transferring…' : 'Transfer employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
