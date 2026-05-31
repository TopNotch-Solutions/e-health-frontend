import { useEffect, useMemo, useState } from 'react';
import { addMedication, getMedicationCatalog } from '../../api/inventory';
import { nurse as nc } from '../../pages/nurse/styles/nurseClasses';

const emptyForm = {
  catalog_id: '',
  quantity_in_stock: '0',
  reorder_level: '10',
};

/**
 * Add facility inventory from the master medication catalog (name, generic, price preset).
 */
export default function AddMedicationForm({ onSuccess, onCancel, submitLabel = 'Save medication' }) {
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [addForm, setAddForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getMedicationCatalog({ available: true })
      .then((rows) => {
        if (!cancelled) setCatalog(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setCatalog([]);
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => catalog.find((c) => c.id === addForm.catalog_id),
    [catalog, addForm.catalog_id]
  );

  function handleSelect(catalogId) {
    setAddForm((f) => ({ ...f, catalog_id: catalogId }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!addForm.catalog_id) {
      setError('Select a medication from the catalog.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await addMedication({
        catalog_id: addForm.catalog_id,
        quantity_in_stock: parseInt(addForm.quantity_in_stock, 10) || 0,
        reorder_level: parseInt(addForm.reorder_level, 10) || 10,
      });
      setAddForm(emptyForm);
      onSuccess?.(
        parseInt(addForm.quantity_in_stock, 10) > 0
          ? 'Medication added — stock pending confirmation by another pharmacy supervisor.'
          : 'Medication added to inventory.'
      );
    } catch (err) {
      setError(err.message || 'Failed to add medication');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      {error ? (
        <p className="sm:col-span-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <label className="block sm:col-span-2">
        <span className={nc.label}>Medication *</span>
        <select
          className={nc.select}
          value={addForm.catalog_id}
          onChange={(e) => handleSelect(e.target.value)}
          required
          disabled={catalogLoading}
        >
          <option value="">
            {catalogLoading
              ? 'Loading catalog…'
              : catalog.length === 0
                ? 'All catalog medications are already stocked'
                : 'Select medication…'}
          </option>
          {catalog.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} — {item.generic} (N$ {Number(item.unit_price).toFixed(2)})
            </option>
          ))}
        </select>
      </label>

      {selected ? (
        <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <p>
            <span className="font-medium">Generic:</span> {selected.generic}
          </p>
          <p>
            <span className="font-medium">Category:</span> {selected.category || '—'}
          </p>
          <p>
            <span className="font-medium">Unit price:</span> N$ {Number(selected.unit_price).toFixed(2)}{' '}
            <span className="text-slate-500">(from catalog; charged when dispensed to private patients)</span>
          </p>
        </div>
      ) : null}

      <label className="block">
        <span className={nc.label}>Initial quantity (pending confirmation)</span>
        <input
          type="number"
          min="0"
          className={nc.input}
          value={addForm.quantity_in_stock}
          onChange={(e) => setAddForm((f) => ({ ...f, quantity_in_stock: e.target.value }))}
        />
      </label>

      <label className="block">
        <span className={nc.label}>Reorder level</span>
        <input
          type="number"
          min="0"
          className={nc.input}
          value={addForm.reorder_level}
          onChange={(e) => setAddForm((f) => ({ ...f, reorder_level: e.target.value }))}
        />
      </label>

      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button
          type="submit"
          className={nc.btnComplete}
          disabled={submitting || !catalog.length}
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className={nc.btnSecondary} onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
