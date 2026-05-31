import { useState } from 'react';
import { updatePatient } from '../../../api/patients';
import { useToast } from '../context/ToastContext';
import { lookup } from '../styles/lookupClasses';
import { fo } from '../styles/frontOfficeModuleClasses';

export default function EditPatientModal({ registration, onClose, onSaved }) {
  const { showToast } = useToast();
  const p = registration.patient;
  const isUnknown = p.category === 'unknown';

  const [form, setForm] = useState({
    first_name: isUnknown ? '' : (p.first_name || ''),
    last_name: isUnknown ? '' : (p.last_name || ''),
    date_of_birth: p.date_of_birth || '',
    sex: p.sex === 'female' ? 'female' : p.sex === 'male' ? 'male' : 'other',
    id_number: p.id_number || '',
    phone: p.phone || '',
    address: p.address || '',
    payment_type: p.payment_type === 'private' ? 'private' : 'state',
    emergency_contact_name: p.emergency_contact_name || '',
    emergency_contact_phone: p.emergency_contact_phone || '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (isUnknown && payload.first_name && payload.last_name) {
        payload.category = 'known';
      }
      await updatePatient(p.id, payload);
      showToast('Patient profile updated.', 'success');
      onSaved();
      onClose();
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">Edit patient profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Same-day edit only — patients you registered today at this facility.
        </p>
        {isUnknown ? (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Unknown patient ({p.patient_number}). Enter identity details when confirmed.
          </p>
        ) : null}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={fo.field}>
              <span className={fo.label}>First name</span>
              <input
                className={fo.input}
                required
                placeholder={isUnknown ? 'Enter first name' : undefined}
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </label>
            <label className={fo.field}>
              <span className={fo.label}>Last name</span>
              <input
                className={fo.input}
                required
                placeholder={isUnknown ? 'Enter last name' : undefined}
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </label>
          </div>
          <label className={fo.field}>
            <span className={fo.label}>Date of birth</span>
            <input
              type="date"
              className={fo.input}
              value={form.date_of_birth}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
            />
          </label>
          <label className={fo.field}>
            <span className={fo.label}>Sex</span>
            <select
              className={fo.select}
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value })}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className={fo.field}>
            <span className={fo.label}>National ID</span>
            <input
              className={fo.input}
              value={form.id_number}
              onChange={(e) => setForm({ ...form, id_number: e.target.value })}
            />
          </label>
          <label className={fo.field}>
            <span className={fo.label}>Phone</span>
            <input
              className={fo.input}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label className={fo.field}>
            <span className={fo.label}>Address</span>
            <textarea
              className={fo.textarea}
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>
          <label className={fo.field}>
            <span className={fo.label}>Payment type</span>
            <select
              className={fo.select}
              value={form.payment_type}
              onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
            >
              <option value="state">Public / State</option>
              <option value="private">Private</option>
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={fo.field}>
              <span className={fo.label}>Next of kin</span>
              <input
                className={fo.input}
                value={form.emergency_contact_name}
                onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
              />
            </label>
            <label className={fo.field}>
              <span className={fo.label}>Kin phone</span>
              <input
                className={fo.input}
                value={form.emergency_contact_phone}
                onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" className={lookup.btnSecondary} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={lookup.btnPrimary} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
