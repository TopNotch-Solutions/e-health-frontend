import { useEffect, useState } from 'react';
import { getRevenueShift, reconcileShift } from '../../../api/revenue';
import { nurse as nc } from '../../nurse/styles/nurseClasses';

const cashInputClass =
  'mt-1 block w-full rounded-lg border-2 border-teal-500 bg-white px-3 py-3 text-lg font-semibold text-slate-900 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40';

function formatMoney(n) {
  return `N$ ${(parseFloat(n) || 0).toFixed(2)}`;
}

function formatWhen(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseCashInput(value) {
  const trimmed = String(value).trim();
  if (trimmed === '') return null;
  const n = parseFloat(trimmed);
  return Number.isFinite(n) ? n : null;
}

export default function ShiftVerifyModal({ shiftId, onClose, onVerified }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifiedCash, setVerifiedCash] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setVerifiedCash('');
    setNotes('');
    setError('');
    getRevenueShift(shiftId)
      .then((row) => {
        if (!cancelled) setDetail(row);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load shift');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shiftId]);

  const verifiedNum = parseCashInput(verifiedCash);
  const expectedCash = parseFloat(detail?.expected_cash) || 0;
  const projectedDeficit =
    verifiedNum != null
      ? Math.max(0, Math.round((expectedCash - verifiedNum) * 100) / 100)
      : 0;

  function handleCashChange(e) {
    const v = e.target.value;
    if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) {
      setVerifiedCash(v);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (verifiedNum == null) {
      setError('Enter the cash amount you counted.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await reconcileShift(shiftId, {
        verified_cash: verifiedNum,
        notes: notes.trim() || undefined,
      });
      onVerified?.();
      onClose?.();
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-900/45"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        className={`relative z-10 max-h-[min(92vh,800px)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="verify-shift-title" className={nc.sectionTitle}>
          Verify this clerk&apos;s collections
        </h2>

        {loading ? (
          <p className="mt-4 text-sm text-slate-600">Loading shift details…</p>
        ) : !detail ? (
          <p className="mt-4 text-sm text-red-700">{error || 'Shift not found'}</p>
        ) : (
          <>
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <h3 className="text-sm font-bold text-slate-900">
                {detail.billing_clerk?.full_name || detail.clerk_name}
              </h3>
              <dl className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                {detail.billing_clerk?.employee_id ? (
                  <div>
                    <span className="font-medium text-slate-500">Employee ID: </span>
                    {detail.billing_clerk.employee_id}
                  </div>
                ) : null}
                {detail.billing_clerk?.email ? (
                  <div className="sm:col-span-2">
                    <span className="font-medium text-slate-500">Email: </span>
                    {detail.billing_clerk.email}
                  </div>
                ) : null}
              </dl>
              <p className="mt-2 text-xs text-slate-500">
                {detail.shift_label} · {formatWhen(detail.shift_start)} —{' '}
                {formatWhen(detail.shift_end)}
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-semibold uppercase text-emerald-800">
                System record — cash this clerk collected
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">
                {formatMoney(detail.expected_cash)}
              </p>
              <p className="mt-1 text-xs text-emerald-800">
                EFT {formatMoney(detail.expected_eft)} · Total {formatMoney(detail.expected_total)} ·{' '}
                {detail.payment_count ?? 0} payments
              </p>
            </div>

            <form className="relative z-10 mt-4 space-y-4" onSubmit={handleSubmit}>
              <div className="rounded-xl border-2 border-teal-400 bg-teal-50/30 p-4">
                <label htmlFor="verify-cash-count" className="block">
                  <span className="text-sm font-bold text-slate-900">
                    Cash counted (revenue office) *
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-600">
                    Type the physical cash received from this billing clerk
                  </span>
                  <input
                    id="verify-cash-count"
                    name="verified_cash"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    autoFocus
                    className={cashInputClass}
                    value={verifiedCash}
                    onChange={handleCashChange}
                    placeholder={`e.g. ${expectedCash.toFixed(2)}`}
                    disabled={submitting}
                    aria-required="true"
                  />
                </label>
              </div>

              {verifiedNum != null ? (
                projectedDeficit > 0.01 ? (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900">
                    Deficit: {formatMoney(projectedDeficit)} — counted cash is less than system
                    records.
                  </p>
                ) : (
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                    Counted cash matches or exceeds system cash.
                  </p>
                )
              ) : null}

              <label htmlFor="verify-notes" className="block">
                <span className={nc.label}>Notes</span>
                <textarea
                  id="verify-notes"
                  className={nc.textarea}
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional verification notes"
                  disabled={submitting}
                />
              </label>

              {error ? (
                <p className="text-sm text-red-700" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className={
                    projectedDeficit > 0.01
                      ? `${nc.btnComplete} !bg-rose-700 hover:!bg-rose-800`
                      : nc.btnComplete
                  }
                  disabled={submitting || verifiedNum == null}
                >
                  {submitting
                    ? 'Saving…'
                    : projectedDeficit > 0.01
                      ? 'Verify (record deficit)'
                      : 'Verify'}
                </button>
                <button type="button" className={nc.btnSecondary} onClick={onClose} disabled={submitting}>
                  Cancel
                </button>
              </div>
            </form>

            {(detail.payments || []).length > 0 ? (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold text-slate-800">Payments collected by this clerk</h3>
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
                  {detail.payments.map((p) => (
                    <li
                      key={p.bill_id}
                      className="flex justify-between gap-2 rounded bg-slate-50 px-2 py-1.5"
                    >
                      <span>
                        {p.patient_name} · {p.visit_number}
                        <span className="ml-1 text-xs text-slate-500">
                          cash {formatMoney(p.cash)} · eft {formatMoney(p.eft)}
                        </span>
                      </span>
                      <span className="shrink-0 font-medium">{formatMoney(p.total)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
