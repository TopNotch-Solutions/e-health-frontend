import { useState } from 'react';
import { admin as c } from '../styles/adminClasses';

const EMPTY = { code: '', description: '' };

export default function AddIcd10Modal({ open, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(EMPTY);
  const [fieldError, setFieldError] = useState('');

  if (!open) return null;

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.description.trim()) {
      setFieldError('Code and description are required.');
      return;
    }
    await onSubmit(form);
    setForm(EMPTY);
    setFieldError('');
  };

  return (
    <div className={c.modalBackdrop} role="presentation" onClick={onClose}>
      <div
        className={c.modal}
        role="dialog"
        aria-labelledby="add-icd10-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-icd10-title" className={c.modalTitle}>
          Add ICD-10 code
        </h2>
        <p className={c.modalSub}>
          Register a diagnosis code for doctors to use during consultations.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className={c.label} htmlFor="icd10-code">
              ICD-10 code
            </label>
            <input
              id="icd10-code"
              className={c.input}
              value={form.code}
              onChange={set('code')}
              placeholder="e.g. M54.5"
              required
            />
          </div>
          <div>
            <label className={c.label} htmlFor="icd10-description">
              Description
            </label>
            <textarea
              id="icd10-description"
              className={c.input}
              rows={3}
              value={form.description}
              onChange={set('description')}
              placeholder="e.g. Low back pain"
              required
            />
          </div>
          {fieldError ? (
            <p className="text-sm text-red-600" role="alert">{fieldError}</p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" className={c.btnSecondary} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className={c.btnPrimary} disabled={submitting}>
              {submitting ? 'Saving…' : 'Add code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
