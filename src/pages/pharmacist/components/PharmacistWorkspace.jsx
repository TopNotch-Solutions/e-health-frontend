import { useEffect, useMemo, useState } from 'react';
import { dispensePrescription } from '../../../api/pharmacy';
import { nurse as c } from '../../nurse/styles/nurseClasses';

function patientFromPrescription(rx) {
  const p = rx?.visit?.patient;
  if (!p) return { name: 'Patient', idLabel: '' };
  const name = [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Patient';
  const num = p.patient_number ? `ID: ${p.patient_number}` : '';
  return { name, idLabel: num };
}

/** Lines awaiting pharmacist review (not yet given or marked not given). */
function pendingItems(items) {
  return (items || []).filter((i) => !i.dispensed_at);
}

function lineStatus(item) {
  if (item.is_dispensed) return { label: 'Given', tone: 'given' };
  if (item.dispensed_at) return { label: 'Not given', tone: 'notGiven' };
  if (item.is_available === false) return { label: 'Low stock', tone: 'lowStock' };
  return { label: 'Awaiting', tone: 'awaiting' };
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
  /** Ticked = available in pharmacy and will be given to the patient. */
  const [availableIds, setAvailableIds] = useState(() => new Set());

  const pending = useMemo(
    () => pendingItems(prescription?.items),
    [prescription?.items]
  );

  useEffect(() => {
    setAvailableIds(new Set());
  }, [prescription?.id]);

  function toggleAvailable(id) {
    setAvailableIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleConfirmDispensing() {
    if (!prescription?.id || pending.length === 0) return;

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
        message = `${given} medication(s) given, ${notGiven} recorded as not given.`;
      } else if (given > 0) {
        message = 'All selected medications given to patient.';
      } else {
        message = 'No medications given — items recorded as unavailable.';
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
          Tick each medication you have in stock and are giving to the patient. When you confirm,
          ticked lines are marked as given; unticked lines are recorded as not given.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3 py-2">Available</th>
                <th className="px-3 py-2">Medication</th>
                <th className="px-3 py-2">Dosage</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Frequency</th>
                <th className="px-3 py-2">Instructions</th>
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
                  const checked = availableIds.has(item.id);
                  const lowStockAtPrescribe =
                    item.is_available === false && isPending && !item.dispensed_at;
                  const status = lineStatus(item);

                  return (
                    <tr
                      key={item.id}
                      className={
                        item.is_dispensed
                          ? 'bg-emerald-50/40'
                          : checked
                            ? 'bg-teal-50/30'
                            : ''
                      }
                    >
                      <td className="px-3 py-2 align-middle">
                        {item.is_dispensed ? (
                          <span className="text-xs font-semibold text-emerald-800">Given</span>
                        ) : isPending ? (
                          <label className="inline-flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                              checked={checked}
                              disabled={actionLoading}
                              onChange={() => toggleAvailable(item.id)}
                            />
                            <span className="text-xs font-medium text-slate-600">
                              {checked ? 'Ready' : '—'}
                            </span>
                          </label>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-900">
                        {item.medication_name}
                        {lowStockAtPrescribe ? (
                          <span className="mt-0.5 block text-xs font-normal text-amber-700">
                            Low stock when prescribed
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{item.dosage || '—'}</td>
                      <td className="px-3 py-2 text-slate-700">{item.quantity ?? '—'}</td>
                      <td className="px-3 py-2 text-slate-700">{item.frequency || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{item.instructions || '—'}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                            status.tone === 'given'
                              ? 'bg-emerald-100 text-emerald-900'
                              : status.tone === 'notGiven'
                                ? 'bg-rose-100 text-rose-900'
                                : status.tone === 'lowStock'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-slate-100 text-slate-700'
                          }`}
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
            <span className="font-semibold">{pending.length}</span> pending medication
            {pending.length === 1 ? '' : 's'} marked available to give.
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
