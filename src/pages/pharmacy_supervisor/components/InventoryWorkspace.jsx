import { useCallback, useEffect, useMemo, useState } from 'react';
import AddMedicationForm from '../../../components/pharmacy/AddMedicationForm';
import {
  getPharmacyAlerts,
  getPharmacyInventory,
  getRecentPrescriptions,
  receiveStock,
} from '../../../api/inventory';
import { ps } from '../styles/pharmacySupervisorClasses';

function stockClass(qty, reorder) {
  return qty <= reorder ? ps.stockLow : ps.stockOk;
}

export default function InventoryWorkspace({ onStockUpdated }) {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');

  const [receiveId, setReceiveId] = useState(null);
  const [receiveQty, setReceiveQty] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showAdd, setShowAdd] = useState(false);

  const loadAll = useCallback(async () => {
    setError('');
    try {
      const [invRes, alertRes, rxRes] = await Promise.all([
        getPharmacyInventory(),
        getPharmacyAlerts(),
        getRecentPrescriptions(20),
      ]);
      setInventory(Array.isArray(invRes) ? invRes : []);
      setAlerts(Array.isArray(alertRes) ? alertRes : []);
      setPrescriptions(Array.isArray(rxRes) ? rxRes : []);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleReceive(e) {
    e.preventDefault();
    const qty = parseInt(receiveQty, 10);
    if (!receiveId || !Number.isFinite(qty) || qty < 1) {
      setError('Enter a valid quantity to receive.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await receiveStock(receiveId, { quantity: qty });
      setToast('Stock received and quantity updated.');
      setReceiveId(null);
      setReceiveQty('');
      await loadAll();
      onStockUpdated?.();
    } catch (err) {
      setError(err.message || 'Failed to receive stock');
    } finally {
      setSubmitting(false);
    }
  }

  function handleMedicationAdded(message) {
    setToast(message);
    setShowAdd(false);
    setError('');
    loadAll();
    onStockUpdated?.();
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inventory;
    return inventory.filter(
      (item) =>
        item.medication_name?.toLowerCase().includes(q) ||
        item.generic_name?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    );
  }, [inventory, search]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
      <aside className={`${ps.queueAside} lg:w-[32%] lg:max-w-sm`} aria-label="Low stock alerts">
        <h2 className={ps.queueTitle}>Low stock alerts</h2>
        <p className={ps.queueSub}>
          <span className="font-bold text-rose-700">{alerts.length}</span> need reorder
        </p>
        <div className={`${ps.queueList} mt-3`}>
          {alerts.length === 0 ? (
            <p className={ps.hint}>No low-stock medications.</p>
          ) : (
            alerts.map((item) => (
              <div key={item.id} className={ps.alertCard}>
                <p className={ps.alertCardTitle}>{item.medication_name}</p>
                <p className={ps.alertCardMeta}>
                  {item.quantity_in_stock} left · reorder at {item.reorder_level}
                </p>
                <button
                  type="button"
                  className={`${ps.btnPrimary} mt-2 !min-h-0 w-full py-1.5 text-xs`}
                  onClick={() => {
                    setReceiveId(item.id);
                    setReceiveQty(String(Math.max(item.reorder_level - item.quantity_in_stock, 1)));
                  }}
                >
                  Load purchased stock
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        {toast ? (
          <p className={ps.toastLow} role="status">
            {toast}
          </p>
        ) : null}
        {error ? (
          <p className={ps.alert} role="alert">
            {error}
          </p>
        ) : null}

        <div className={ps.sectionPanel}>
          <div className={ps.panelHeader}>
            <div>
              <h2 className={ps.sectionTitle}>Medication inventory</h2>
              <p className="mt-0.5 text-xs text-slate-600">
                Record purchased stock and quantities received into the pharmacy.
              </p>
            </div>
            <button type="button" className={ps.btnPrimary} onClick={() => setShowAdd((v) => !v)}>
              {showAdd ? 'Cancel' : '+ Add medication'}
            </button>
          </div>

          {showAdd ? (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <AddMedicationForm
                onSuccess={handleMedicationAdded}
                onCancel={() => setShowAdd(false)}
              />
            </div>
          ) : null}

          {receiveId ? (
            <form onSubmit={handleReceive} className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border border-teal-200 bg-teal-50/50 p-3">
              <label className="block min-w-[8rem] flex-1">
                <span className={ps.formLabel}>Quantity received *</span>
                <input
                  type="number"
                  min="1"
                  className={ps.formInput}
                  value={receiveQty}
                  onChange={(e) => setReceiveQty(e.target.value)}
                  autoFocus
                />
              </label>
              <button type="submit" className={ps.btnPrimary} disabled={submitting}>
                {submitting ? 'Receiving…' : 'Confirm receipt'}
              </button>
              <button type="button" className={ps.btnGhost} onClick={() => setReceiveId(null)}>
                Cancel
              </button>
            </form>
          ) : null}

          <div className={ps.searchWrap}>
            <input
              type="search"
              className={ps.searchInput}
              placeholder="Search medications"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={`${ps.workspaceScroll} mt-3 flex max-h-[280px] flex-col gap-2`}>
            {loading ? (
              <p className={ps.hint}>Loading inventory…</p>
            ) : filtered.length === 0 ? (
              <p className={ps.hint}>No medications found.</p>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className={ps.inventoryRow}>
                  <div>
                    <p className={ps.inventoryName}>{item.medication_name}</p>
                    <p className={ps.inventoryMeta}>
                      {item.category || 'General'} · N${' '}
                      {parseFloat(item.unit_price || 0).toFixed(2)} each · reorder at{' '}
                      {item.reorder_level}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`${ps.stockBadge} ${stockClass(item.quantity_in_stock, item.reorder_level)}`}>
                      {item.quantity_in_stock} in stock
                    </span>
                    <button
                      type="button"
                      className={ps.btnGhost}
                      onClick={() => {
                        setReceiveId(item.id);
                        setReceiveQty('');
                      }}
                    >
                      Receive stock
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={ps.sectionPanel}>
          <h2 className={ps.sectionTitle}>Prescription audit</h2>
          <p className="mt-0.5 text-xs text-slate-600">
            Prescribing doctor and dispensing pharmacist per medication line.
          </p>
          <div className={`${ps.workspaceScroll} mt-3 flex max-h-[320px] flex-col gap-2`}>
            {prescriptions.length === 0 ? (
              <p className={ps.hint}>No recent prescriptions.</p>
            ) : (
              prescriptions.map((rx) => (
                <article key={rx.id} className={ps.rxCard}>
                  <p className={ps.rxDoctor}>Prescribed by Dr. {rx.prescribed_by}</p>
                  <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">
                    Status: {rx.status.replace(/_/g, ' ')}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {rx.items?.map((item) => (
                      <li key={item.id} className={ps.rxItem}>
                        <span className="font-semibold text-slate-800">{item.medication_name}</span>
                        {' '}
                        × {item.quantity}
                        {item.pharmacist_name ? (
                          <span className="text-teal-700"> — dispensed by {item.pharmacist_name}</span>
                        ) : (
                          <span className="text-slate-400"> — not yet dispensed</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
