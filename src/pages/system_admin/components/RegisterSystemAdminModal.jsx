import { useEffect, useState } from 'react';
import { admin as c } from '../styles/adminClasses';

const EMPTY = {
  first_name: '',
  last_name: '',
  email: '',
};

export default function RegisterSystemAdminModal({
  open,
  onClose,
  onSubmit,
  submitting,
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

  if (!open) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <div className={c.modalBackdrop} role="presentation" onClick={onClose}>
      <div
        className={c.modal}
        role="dialog"
        aria-labelledby="register-admin-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="register-admin-title" className={c.modalTitle}>
          Add system administrator
        </h2>
        <p className={c.modalSub}>
          National administrators manage every state hospital and clinic on the network — onboarding
          staff, creating facilities, and transfers. A temporary password is generated automatically.
          Accounts can only be inactivated, not deleted.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={c.label} htmlFor="admin-first">
                First name
              </label>
              <input id="admin-first" className={c.input} value={form.first_name} onChange={set('first_name')} required />
            </div>
            <div>
              <label className={c.label} htmlFor="admin-last">
                Last name
              </label>
              <input id="admin-last" className={c.input} value={form.last_name} onChange={set('last_name')} required />
            </div>
          </div>
          <div>
            <label className={c.label} htmlFor="admin-email">
              Email
            </label>
            <input id="admin-email" type="email" className={c.input} value={form.email} onChange={set('email')} required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={c.btnSecondary} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className={c.btnPrimary} disabled={submitting}>
              {submitting ? 'Creating…' : 'Add administrator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
