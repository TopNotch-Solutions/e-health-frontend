import { useCallback, useEffect, useState } from 'react';
import { getMyBillingShift } from '../../../api/revenue';

function formatMoney(n) {
  return `N$ ${(parseFloat(n) || 0).toFixed(2)}`;
}

function formatRange(start, end) {
  if (!start || !end) return '';
  const opts = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
  return `${new Date(start).toLocaleString('en-GB', opts)} – ${new Date(end).toLocaleString('en-GB', opts)}`;
}

/** Read-only banner: fixed 12-hour shifts (08:00–20:00, 20:00–08:00). */
export default function BillingShiftBar({ onShiftChange }) {
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const row = await getMyBillingShift();
      setShift(row);
      onShiftChange?.(row);
    } catch {
      setShift(null);
      onShiftChange?.(null);
    } finally {
      setLoading(false);
    }
  }, [onShiftChange]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 60_000);
    return () => clearInterval(timer);
  }, [refresh]);

  if (loading) {
    return (
      <div className="shrink-0 border-b border-violet-200 bg-violet-50/80 px-4 py-2 text-sm text-slate-600">
        Loading shift schedule…
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
        Could not load current billing shift.
      </div>
    );
  }

  return (
    <div className="shrink-0 border-b border-violet-200 bg-violet-50/90 px-4 py-3 text-sm text-slate-800">
      <p>
        <span className="font-bold text-violet-900">{shift.shift_label || 'Billing shift'}</span>
        <span className="ml-2 text-slate-600">{formatRange(shift.shift_start, shift.shift_end)}</span>
      </p>
      <p className="mt-1 text-slate-700">
        Your collections this shift: cash <strong>{formatMoney(shift.expected_cash)}</strong>
        {' · '}EFT <strong>{formatMoney(shift.expected_eft)}</strong>
        {' · '}({shift.payment_count ?? 0} payment{(shift.payment_count ?? 0) === 1 ? '' : 's'})
      </p>
      <p className="mt-0.5 text-xs text-slate-500">
        Facility total this shift: cash {formatMoney(shift.facility_expected_cash)} · EFT{' '}
        {formatMoney(shift.facility_expected_eft)} ({shift.facility_payment_count ?? 0} payments).
        Revenue office verifies cash when the shift ends.
      </p>
    </div>
  );
}
