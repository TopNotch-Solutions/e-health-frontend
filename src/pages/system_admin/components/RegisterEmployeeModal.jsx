import { useEffect, useMemo, useState } from 'react';
import { getAdminRoles } from '../../../api/admin';
import { getApiBase } from '../../../api/client';
import { admin as c, facilityTypeLabel, isOperationalFacility } from '../styles/adminClasses';

const EMPTY = {
  first_name: '',
  last_name: '',
  email: '',
  role_id: '',
  facility_id: '',
};

export default function RegisterEmployeeModal({
  open,
  onClose,
  onSubmit,
  submitting,
  facilities,
}) {
  const [form, setForm] = useState(EMPTY);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState('');

  const selectedFacility = useMemo(
    () => facilities.find((f) => f.id === form.facility_id),
    [facilities, form.facility_id]
  );
  const isClinic = selectedFacility?.type === 'clinic';
  const isHospital = selectedFacility?.type === 'hospital' || selectedFacility?.type === 'health_center';

  const groupedRoles = useMemo(() => {
    const maternity = roles.filter((r) => r.name?.startsWith('maternity_'));
    const general = roles.filter((r) => !r.name?.startsWith('maternity_'));
    return { maternity, general };
  }, [roles]);

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    const loadRoles = async () => {
      setRolesLoading(true);
      setRolesError('');
      try {
        const params = form.facility_id
          ? { facility_id: form.facility_id }
          : {};
        const list = await getAdminRoles(params);
        if (!cancelled) {
          setRoles(list || []);
          if (form.facility_id && isHospital) {
            const hasMaternity = (list || []).some((r) => r.name?.startsWith('maternity_'));
            if (!hasMaternity) {
              setRolesError(
                `Maternity roles are missing from the API (${getApiBase()}). `
                + 'Use a local backend with the latest code, or deploy the updated backend to production.'
              );
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setRoles([]);
          setRolesError(err.message || 'Could not load roles for this facility');
        }
      } finally {
        if (!cancelled) setRolesLoading(false);
      }
    };

    loadRoles();
    return () => { cancelled = true; };
  }, [open, form.facility_id, isHospital]);

  if (!open) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      role_id: parseInt(form.role_id, 10),
    });
  };

  return (
    <div className={c.modalBackdrop} role="presentation" onClick={onClose}>
      <div
        className={c.modal}
        role="dialog"
        aria-labelledby="register-employee-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="register-employee-title" className={c.modalTitle}>
          Register new employee
        </h2>
        <p className={c.modalSub}>
          {isClinic
            ? 'All new employees receive the temporary password Demo123! (clinic roles only at clinic facilities). Maternity roles are hospital-only.'
            : isHospital
              ? 'All new employees receive the temporary password Demo123! Hospital and maternity roles are available here.'
              : 'Select a facility first. All new employees receive the temporary password Demo123!'}
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={c.label} htmlFor="emp-first">
                First name
              </label>
              <input id="emp-first" className={c.input} value={form.first_name} onChange={set('first_name')} required />
            </div>
            <div>
              <label className={c.label} htmlFor="emp-last">
                Last name
              </label>
              <input id="emp-last" className={c.input} value={form.last_name} onChange={set('last_name')} required />
            </div>
          </div>
          <div>
            <label className={c.label} htmlFor="emp-email">
              Email
            </label>
            <input id="emp-email" type="email" className={c.input} value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className={c.label} htmlFor="emp-facility">
              Assigned facility
            </label>
            <select
              id="emp-facility"
              className={c.input}
              value={form.facility_id}
              onChange={set('facility_id')}
              required
            >
              <option value="">Select facility…</option>
              {facilities.filter(isOperationalFacility).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({facilityTypeLabel(f.type)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={c.label} htmlFor="emp-role">
              {isClinic ? 'Clinic role' : 'Role'}
            </label>
            <select
              id="emp-role"
              className={c.input}
              value={form.role_id}
              onChange={set('role_id')}
              required
              disabled={!form.facility_id || rolesLoading}
            >
              <option value="">
                {!form.facility_id
                  ? 'Select a facility first…'
                  : rolesLoading
                    ? 'Loading roles…'
                    : 'Select role…'}
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
                <optgroup label={isClinic ? 'Clinic roles' : 'Hospital roles'}>
                  {groupedRoles.general.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.display_name || r.name}
                    </option>
                  ))}
                </optgroup>
              ) : null}
              {!rolesLoading && form.facility_id && roles.length === 0 ? (
                <option value="" disabled>No roles available for this facility</option>
              ) : null}
            </select>
            {rolesError ? (
              <p className="mt-2 text-sm font-medium text-amber-800" role="alert">{rolesError}</p>
            ) : null}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={c.btnSecondary} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className={c.btnPrimary} disabled={submitting || rolesLoading}>
              {submitting ? 'Registering…' : 'Register employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
