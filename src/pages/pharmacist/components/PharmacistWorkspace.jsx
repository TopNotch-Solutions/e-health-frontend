import { useEffect, useMemo, useState } from 'react';
import { confirmAction } from '../../../utils/confirmAction';
import { dispensePrescription } from '../../../api/pharmacy';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import {
  isOutOfStock,
  lineStockStatus,
  pendingItems,
  statusBadgeClass,
  stockSummary,
} from '../pharmacyStockDisplay';

function patientFromPrescription(rx) {
  const p = rx?.visit?.patient;
  if (!p) return { name: 'Patient', idLabel: '' };
  const name = [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Patient';
  const num = p.patient_number ? `ID: ${p.patient_number}` : '';
  return { name, idLabel: num };
}

export default function PharmacistWorkspace({
  prescription,
  actionLoading,
  setActionLoading,
  onToast,
  onActionError,
  onDone,
  onRefreshDetail,
}) {
  const [availableIds, setAvailableIds] = useState(() => new Set());

  const pending = useMemo(
    () => pendingItems(prescription?.items),
    [prescription?.items]
  );

  const summary = useMemo(
    () => stockSummary(prescription?.items),
    [prescription?.items]
  );

  useEffect(() => {
    setAvailableIds(new Set());
  }, [prescription?.id]);

  function toggleAvailable(id) {
    const item = pending.find((i) => i.id === id);
    if (item && isOutOfStock(item)) return;

    setAvailableIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleConfirmDispensing() {
    if (!prescription?.id || pending.length === 0) return;

    const { name: patientName } = patientFromPrescription(prescription);
    const tickedCount = pending.filter((i) => availableIds.has(i.id)).length;
    if (!(await confirmAction({
      title: 'Confirm dispensing?',
      text: `Update dispensing for ${patientName}? ${tickedCount} of ${pending.length} medication(s) marked to give.`,
      icon: 'question',
      confirmButtonText: 'Confirm dispensing',
    }))) return;

    setActionLoading(true);
    onActionError('');
    try {
      const dispensed_items = pending.map((item) => ({
        item_id: item.id,
        is_dispensed: availableIds.has(item.id),
      }));

      await dispensePrescription(prescription.id, dispensed_items);
      setAvailableIds(new Set());
      const refreshed = await onRefreshDetail();

      const given = dispensed_items.filter((d) => d.is_dispensed).length;
      const notGiven = dispensed_items.length - given;
      let message = '';
      if (given > 0 && notGiven > 0) {
        message = `${given} medication(s) given, ${notGiven} recorded as not given or out of stock.`;
      } else if (given > 0) {
        message = 'All selected medications given to patient.';
      } else {
        message = 'No medications given — items recorded as unavailable or out of stock.';
      }
      onToast(message);

      const items = refreshed?.items || [];
      const allResolved = items.every((i) => i.dispensed_at);
      if (allResolved) onDone();
    } catch (err) {
      onActionError(err.message || 'Failed to update prescription');
    } finally {
      setActionLoading(false);
    }
  }

  const { name: patientName, idLabel } = patientFromPrescription(prescription);
  const tickedCount = pending.filter((i) => availableIds.has(i.id)).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Prescription · {patientName}</h3>
        {idLabel ? <p className="mt-0.5 text-xs font-semibold text-slate-600">{idLabel}</p> : null}
        <p className="mt-2 text-sm text-slate-600">
          Tick medications you are giving. Lines marked <strong className="text-rose-800">Out of stock</strong>{' '}
          cannot be dispensed. <strong className="text-amber-800">Low stock</strong> lines can still be given but
          need replenishment soon.
        </p>

        {summary.pending > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {summary.outOfStock > 0 ? (
              <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-900">
                {summary.outOfStock} out of stock
              </span>
            ) : null}
            {summary.lowStock > 0 ? (
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
                {summary.lowStock} low stock
              </span>
            ) : null}
            {summary.inStock > 0 ? (
              <span className="inline-flex rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-800">
                {summary.inStock} in stock
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3 py-2">Give</th>
                <th className="px-3 py-2">Medication</th>
                <th className="px-3 py-2">Dosage</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">On hand</th>
                <th className="px-3 py-2">Frequency</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(prescription?.items || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-sm text-slate-500">
                    No line items on this prescription.
                  </td>
                </tr>
              ) : (
                (prescription?.items || []).map((item) => {
                  const isPending = !item.dispensed_at;
                  const out = isOutOfStock(item) && isPending;
                  const checked = availableIds.has(item.id);
                  const status = lineStockStatus(item);

                  return (
                    <tr
                      key={item.id}
                      className={
                        item.is_dispensed
                          ? 'bg-emerald-50/40'
                          : out
                            ? 'bg-rose-50/50'
                            : item.stock_status === 'low_stock' && isPending
                              ? 'bg-amber-50/40'
                              : checked
                                ? 'bg-teal-50/30'
                                : ''
                      }
                    >
                      <td className="px-3 py-2 align-middle">
                        {item.is_dispensed ? (
                          <span className="text-xs font-semibold text-emerald-800">Given</span>
                        ) : isPending ? (
                          out ? (
                            <span className="text-xs font-semibold text-rose-800">N/A</span>
                          ) : (
                            <label className="inline-flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                checked={checked}
                                disabled={actionLoading}
                                onChange={() => toggleAvailable(item.id)}
                              />
                              <span className="text-xs font-medium text-slate-600">
                                {checked ? 'Give' : '—'}
                              </span>
                            </label>
                          )
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-900">
                        {item.medication_name}
                        {out ? (
                          <span className="mt-0.5 block text-xs font-normal text-rose-700">
                            Not enough stock to fill order
                          </span>
                        ) : item.stock_status === 'low_stock' && isPending ? (
                          <span className="mt-0.5 block text-xs font-normal text-amber-700">
                            Reorder level {item.reorder_level ?? '—'} — replenish soon
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{item.dosage || '—'}</td>
                      <td className="px-3 py-2 text-slate-700">{item.quantity ?? '—'}</td>
                      <td className="px-3 py-2 text-slate-700 tabular-nums">
                        {item.quantity_in_stock != null ? item.quantity_in_stock : '—'}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{item.frequency || '—'}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${statusBadgeClass(status.tone)}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pending.length > 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            <span className="font-semibold text-teal-800">{tickedCount}</span> of{' '}
            <span className="font-semibold">{pending.filter((i) => !isOutOfStock(i)).length}</span> dispensable
            medication{pending.length === 1 ? '' : 's'} marked to give.
            {summary.outOfStock > 0 ? (
              <span className="block text-xs text-rose-700">
                {summary.outOfStock} line{summary.outOfStock === 1 ? ' is' : 's are'} out of stock and will be
                recorded as not given.
              </span>
            ) : null}
          </p>
        ) : null}

        <div className="mt-6">
          <button
            type="button"
            className={`${c.btnAction} ${c.btnPharmacy} w-full sm:w-auto sm:min-w-[240px]`}
            disabled={actionLoading || pending.length === 0}
            onClick={handleConfirmDispensing}
          >
            Confirm dispensing
          </button>
        </div>
      </div>
    </div>
  );
}
