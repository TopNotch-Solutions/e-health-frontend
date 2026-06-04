import { useCallback, useEffect, useState } from 'react';
import { confirmAction } from '../../utils/confirmAction';
import {
  confirmStockReceipt,
  getConfirmedReceipts,
  getPendingReceipts,
} from '../../api/inventory';
import { getStoredUser } from '../../api/authSession';

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Pending stock receipts — dual control: recorder cannot confirm their own entry.
 */
export default function PendingReceiptsPanel({
  classNames,
  onUpdated,
  compact = false,
}) {
  const ui = classNames || {};
  const card = ui.receiptCard || 'rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm';
  const title = ui.sectionTitle || 'text-sm font-bold text-slate-900';
  const hint = ui.hint || 'text-sm text-slate-500';
  const btnPrimary = ui.btnPrimary || 'rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50';
  const btnGhost = ui.btnGhost || 'text-xs font-semibold text-slate-600 hover:text-slate-900';

  const currentUserId = getStoredUser()?.id;
  const [pending, setPending] = useState([]);
  const [confirmed, setConfirmed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const [pendingRows, confirmedRows] = await Promise.all([
        getPendingReceipts(),
        getConfirmedReceipts(compact ? 8 : 15),
      ]);
      setPending(Array.isArray(pendingRows) ? pendingRows : []);
      setConfirmed(Array.isArray(confirmedRows) ? confirmedRows : []);
    } catch (err) {
      setError(err.message || 'Failed to load stock receipts');
    } finally {
      setLoading(false);
    }
  }, [compact]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleConfirm(transactionId) {
    if (!(await confirmAction({
      title: 'Confirm stock receipt?',
      text: 'Confirm this stock receipt and add the quantity to inventory? You cannot confirm your own entry.',
      icon: 'question',
      confirmButtonText: 'Confirm receipt',
    }))) return;
    setConfirmingId(transactionId);
    setError('');
    try {
      await confirmStockReceipt(transactionId);
      await load();
      onUpdated?.();
    } catch (err) {
      setError(err.message || 'Failed to confirm receipt');
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div>
        <h3 className={title}>Pending stock receipts</h3>
        <p className={`${hint} mt-0.5`}>
          Recorded stock must be confirmed by a different pharmacy supervisor before it is added to inventory.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-red-700" role="alert">{error}</p>
      ) : null}

      {loading ? (
        <p className={hint}>Loading receipts…</p>
      ) : pending.length === 0 ? (
        <p className={hint}>No receipts awaiting confirmation.</p>
      ) : (
        <ul className="space-y-2">
          {pending.map((row) => {
            const isSelf = row.performed_by === currentUserId;
            return (
              <li key={row.id} className={card}>
                <p className="font-semibold text-slate-900">
                  {row.medication_name || row.inventory?.medication_name}
                  {' '}
                  × {row.quantity}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Recorded by <strong>{row.recorded_by_name || 'Staff'}</strong>
                  {' · '}
                  {formatDateTime(row.created_at)}
                </p>
                {isSelf ? (
                  <p className="mt-2 text-xs font-medium text-amber-900">
                    You recorded this receipt — another pharmacy supervisor must confirm.
                  </p>
                ) : (
                  <button
                    type="button"
                    className={`${btnPrimary} mt-2`}
                    disabled={confirmingId === row.id}
                    onClick={() => handleConfirm(row.id)}
                  >
                    {confirmingId === row.id ? 'Confirming…' : 'Confirm receipt'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!compact && confirmed.length > 0 ? (
        <div className="border-t border-slate-200 pt-4">
          <h3 className={title}>Confirmed receipts</h3>
          <ul className="mt-2 space-y-2">
            {confirmed.map((row) => (
              <li key={row.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <p className="font-semibold text-slate-900">
                  {row.medication_name || row.inventory?.medication_name}
                  {' '}
                  × {row.quantity}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Added by <strong>{row.recorded_by_name || 'Staff'}</strong>
                  {' · '}
                  {formatDateTime(row.created_at)}
                </p>
                <p className="mt-0.5 text-xs text-teal-800">
                  Confirmed by <strong>{row.confirmed_by_name || 'Staff'}</strong>
                  {' · '}
                  {formatDateTime(row.confirmed_at)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
