import { useEffect, useMemo, useState } from 'react';
import { confirmAction } from '../../../utils/confirmAction';
import { dispensePrescription, releaseOutOfStockPrescription, stopRecurringSchedule } from '../../../api/pharmacy';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import {
  isOutOfStock,
  lineStockStatus,
  pendingItems,
  statusBadgeClass,
  stockSummary,
  formatAvailabilityElsewhereLine,
} from '../pharmacyStockDisplay';
import {
  formatPrescriptionScheduleLabel,
  isRecurringPrescriptionItem,
} from '../../../utils/prescriptionSchedule';

function OutOfStockAvailabilityPanel({ items }) {
  const outOfStockItems = (items || []).filter(isOutOfStock);
  if (!outOfStockItems.length) return null;

  return (
    <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/90 px-4 py-3 text-sm">
      <p className="font-bold text-indigo-950">Stock at other clinics &amp; hospitals</p>
      <p className="mt-0.5 text-xs text-indigo-900">
        Facilities on the network with enough stock to fill this order.
      </p>
      <ul className="mt-3 space-y-3">
        {outOfStockItems.map((item) => {
          const elsewhereRows = item.availability_elsewhere || [];
          return (
            <li key={item.id} className="rounded-lg border border-indigo-100 bg-white/80 px-3 py-2">
              <p className="font-semibold text-slate-900">{item.medication_name}</p>
              {elsewhereRows.length > 0 ? (
                <ul className="mt-1.5 space-y-1 text-xs text-indigo-900">
                  {elsewhereRows.map((row) => (
                    <li key={`${item.id}-${row.facility_id}`} className="flex gap-2">
                      <span className="text-indigo-400" aria-hidden>
                        •
                      </span>
                      <span>{formatAvailabilityElsewhereLine(row)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs text-slate-600">
                  Not available at any other clinic or hospital on the network.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

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

  const dispensablePending = useMemo(
    () => pending.filter((i) => !isOutOfStock(i)),
    [pending]
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

  async function handleStopSchedule(item) {
    if (!(await confirmAction({
      title: 'Stop recurring medication?',
      text: `Mark ${item.medication_name} as no longer needed (patient is better)?`,
      icon: 'warning',
      confirmButtonText: 'Stop schedule',
    }))) return;

    setActionLoading(true);
    onActionError('');
    try {
      await stopRecurringSchedule(item.id);
      await onRefreshDetail();
      onToast(`Recurring schedule stopped for ${item.medication_name}`);
    } catch (err) {
      onActionError(err.message || 'Failed to stop recurring schedule');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReleaseOutOfStock() {
    if (!prescription?.id || !allPendingOutOfStock) return;

    const { name: patientName } = patientFromPrescription(prescription);
    if (!(await confirmAction({
      title: 'Release patient — out of stock?',
      text: `${patientName} cannot receive medications today because stock is unavailable. Remove them from the pharmacy queue? If pharmacy was their last stop, the consultation will be ended.`,
      icon: 'warning',
      confirmButtonText: 'Release from queue',
    }))) return;

    setActionLoading(true);
    onActionError('');
    try {
      const result = await releaseOutOfStockPrescription(prescription.id);
      const message = result?.visit_completed
        ? 'Patient removed from queue. Consultation completed.'
        : result?.routed_to_billing
          ? 'Patient removed from queue and sent to billing.'
          : result?.hold_visit_open
            ? 'Patient removed from pharmacy queue. Visit continues at other departments.'
            : 'Patient removed from pharmacy queue.';
      onToast(message);
      await onDone?.({ skipConfirm: true });
    } catch (err) {
      onActionError(err.message || 'Failed to release patient from queue');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirmDispensing() {
    if (!prescription?.id || pending.length === 0) return;

    if (dispensablePending.length === 0) {
      onActionError('Cannot dispense — all medications are out of stock. Replenish stock before dispensing.');
      return;
    }

    const tickedCount = pending.filter((i) => availableIds.has(i.id)).length;
    if (tickedCount === 0) {
      onActionError('Select at least one in-stock medication to give before confirming.');
      return;
    }

    const { name: patientName } = patientFromPrescription(prescription);
    if (!(await confirmAction({
      title: 'Confirm dispensing?',
      text: `Update dispensing for ${patientName}? ${tickedCount} of ${dispensablePending.length} dispensable medication(s) marked to give.`,
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
  const allPendingOutOfStock = pending.length > 0 && dispensablePending.length === 0;
  const canConfirmDispensing =
    pending.length > 0 && dispensablePending.length > 0 && tickedCount > 0 && !actionLoading;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Prescription · {patientName}</h3>
        {idLabel ? <p className="mt-0.5 text-xs font-semibold text-slate-600">{idLabel}</p> : null}
        {prescription?.is_cross_facility && prescription?.prescribed_at_facility ? (
          <p className="mt-1 text-xs font-semibold text-indigo-800">
            Prescribed at {prescription.prescribed_at_facility} — dispensing from your facility stock.
          </p>
        ) : null}
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
                <th className="px-3 py-2">Schedule</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(prescription?.items || []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-sm text-slate-500">
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
                      <td className="px-3 py-2 text-slate-700">
                        <span className="block text-xs font-medium text-indigo-900">
                          {item.schedule_label || formatPrescriptionScheduleLabel(item)}
                        </span>
                        {isRecurringPrescriptionItem(item) ? (
                          <button
                            type="button"
                            className="mt-1 text-xs font-semibold text-rose-700 hover:underline"
                            disabled={actionLoading}
                            onClick={() => handleStopSchedule(item)}
                          >
                            Patient is better — stop
                          </button>
                        ) : null}
                      </td>
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
            {allPendingOutOfStock ? (
              <>
                <span className="block font-semibold text-rose-800">
                  All pending medications are out of stock. Release the patient from the queue when they
                  leave — if pharmacy was their last stop, the consultation will be ended.
                </span>
                <OutOfStockAvailabilityPanel items={pending} />
              </>
            ) : (
              <>
                <span className="font-semibold text-teal-800">{tickedCount}</span> of{' '}
                <span className="font-semibold">{dispensablePending.length}</span> dispensable
                medication{dispensablePending.length === 1 ? '' : 's'} marked to give.
                {summary.outOfStock > 0 ? (
                  <span className="block text-xs text-rose-700">
                    {summary.outOfStock} line{summary.outOfStock === 1 ? ' is' : 's are'} out of stock and
                    cannot be dispensed until stock is available.
                  </span>
                ) : null}
              </>
            )}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={`${c.btnAction} ${c.btnPharmacy} w-full sm:w-auto sm:min-w-[240px]`}
            disabled={!canConfirmDispensing}
            onClick={handleConfirmDispensing}
          >
            Confirm dispensing
          </button>
          {allPendingOutOfStock ? (
            <button
              type="button"
              className={`${c.btnSecondary} w-full sm:w-auto`}
              disabled={actionLoading}
              onClick={handleReleaseOutOfStock}
            >
              Release patient — out of stock
            </button>
          ) : null}
          {pending.length > 0 && !canConfirmDispensing && !actionLoading && !allPendingOutOfStock ? (
            <p className="w-full text-xs text-slate-500">
              Tick at least one in-stock medication to enable confirm.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
