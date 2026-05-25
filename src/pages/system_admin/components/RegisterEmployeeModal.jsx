import { useEffect, useState } from 'react';
import { admin as c } from '../styles/adminClasses';

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
  roles,
  facilities,
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

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
          A temporary password is generated if none is set. Share it securely with the employee.
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
            <label className={c.label} htmlFor="emp-role">
              Role
            </label>
            <select id="emp-role" className={c.input} value={form.role_id} onChange={set('role_id')} required>
              <option value="">Select role…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.display_name || r.name}
                </option>
              ))}
            </select>
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
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={c.btnSecondary} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className={c.btnPrimary} disabled={submitting}>
              {submitting ? 'Registering…' : 'Register employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
