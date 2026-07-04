import { useCallback, useEffect, useState } from 'react';
import { getMyBillingShift } from '../../../api/revenue';

function formatMoney(n) {
  return `N$ ${(parseFloat(n) || 0).toFixed(2)}`;
}

function formatShiftDate(start) {
  if (!start) return '';
  return new Date(start).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function ShiftClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CollectionCard({ label, cash, eft, paymentCount, accent }) {
  const total = (parseFloat(cash) || 0) + (parseFloat(eft) || 0);
  const count = paymentCount ?? 0;

  return (
    <article
      className={`min-w-0 flex-1 rounded-lg border p-2 shadow-sm ${
        accent
          ? 'border-teal-200 bg-gradient-to-br from-teal-50/90 to-white'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[0.6rem] font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <p className={`shrink-0 text-sm font-bold tabular-nums ${accent ? 'text-teal-800' : 'text-slate-900'}`}>
          {formatMoney(total)}
        </p>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[0.65rem] ring-1 ring-slate-200/90">
          <span className="text-slate-500">Cash</span>
          <span className="font-semibold tabular-nums text-slate-800">{formatMoney(cash)}</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[0.65rem] ring-1 ring-slate-200/90">
          <span className="text-slate-500">EFT</span>
          <span className="font-semibold tabular-nums text-slate-800">{formatMoney(eft)}</span>
        </span>
      </div>
      <p className="mt-1 text-[0.6rem] text-slate-500">
        {count} payment{count === 1 ? '' : 's'}
      </p>
    </article>
  );
}

function ShiftBarSkeleton() {
  return (
    <div className="shrink-0 animate-pulse border-b border-slate-200 bg-slate-50/60 px-3 py-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="h-16 rounded-lg bg-slate-100" />
        <div className="h-16 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

/** Read-only banner: hospital 12-hour shifts or clinic 08:00–17:00 (from server). */
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
    return <ShiftBarSkeleton />;
  }

  if (!shift) {
    return (
      <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-3 py-2">
        <p className="text-xs font-medium text-amber-900">Could not load the current billing shift.</p>
      </div>
    );
  }

  const isActive = shift.is_active !== false;

  return (
    <div className="shrink-0 border-b border-slate-200 bg-slate-50/60 px-3 py-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <section className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${
              isActive ? 'bg-gradient-to-br from-teal-600 to-teal-700' : 'bg-slate-400'
            }`}
          >
            <ShiftClockIcon />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-xs font-bold leading-tight text-slate-900">
                {shift.shift_label || 'Billing shift'}
              </h2>
              <span
                className={`inline-flex rounded-full px-1.5 py-px text-[0.55rem] font-bold uppercase tracking-wide ${
                  isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}
              >
                {isActive ? 'Active' : 'Outside window'}
              </span>
            </div>
            <p className="mt-0.5 text-[0.65rem] text-slate-500">{formatShiftDate(shift.shift_start)}</p>
            {!isActive ? (
              <p className="mt-1 text-[0.6rem] leading-snug text-amber-800">
                Collections only during active shift.
              </p>
            ) : null}
          </div>
        </section>

        <CollectionCard
          label="Your collections"
          cash={shift.expected_cash}
          eft={shift.expected_eft}
          paymentCount={shift.payment_count}
          accent
        />
      </div>

      <p className="mt-1.5 text-[0.65rem] text-slate-400">
        Revenue office verifies cash when the shift ends.
      </p>
    </div>
  );
}
