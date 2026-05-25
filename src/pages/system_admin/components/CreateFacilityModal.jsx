import { useState } from 'react';
import { admin as c, FACILITY_TYPE_OPTIONS } from '../styles/adminClasses';

const EMPTY = {
  name: '',
  address: '',
  province: '',
  district: '',
  phone: '',
  type: 'hospital',
};

export default function CreateFacilityModal({ open, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(EMPTY);

  if (!open) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(EMPTY);
  };

  return (
    <div className={c.modalBackdrop} role="presentation" onClick={onClose}>
      <div
        className={c.modal}
        role="dialog"
        aria-labelledby="create-facility-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="create-facility-title" className={c.modalTitle}>
          Create new facility
        </h2>
        <p className={c.modalSub}>Register a facility on the national network.</p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className={c.field}>
            <label className={c.label} htmlFor="fac-name">
              Facility name
            </label>
            <input id="fac-name" className={c.input} value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className={c.label} htmlFor="fac-address">
              Physical address
            </label>
            <textarea
              id="fac-address"
              className={c.input}
              rows={2}
              value={form.address}
              onChange={set('address')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={c.label} htmlFor="fac-province">
                Region / province
              </label>
              <input id="fac-province" className={c.input} value={form.province} onChange={set('province')} />
            </div>
            <div>
              <label className={c.label} htmlFor="fac-district">
                City / district
              </label>
              <input id="fac-district" className={c.input} value={form.district} onChange={set('district')} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={c.label} htmlFor="fac-phone">
                Contact number
              </label>
              <input id="fac-phone" className={c.input} value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className={c.label} htmlFor="fac-type">
                Facility type
              </label>
              <select id="fac-type" className={c.input} value={form.type} onChange={set('type')} required>
                {FACILITY_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={c.btnSecondary} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className={c.btnPrimary} disabled={submitting}>
              {submitting ? 'Creating…' : 'Create facility'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
