import { nurse as nc } from '../../nurse/styles/nurseClasses';

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

function statusBadge(status) {
  const map = {
    open: 'bg-sky-100 text-sky-900',
    closed: 'bg-amber-100 text-amber-900',
    reconciled: 'bg-emerald-100 text-emerald-900',
    discrepancy: 'bg-rose-100 text-rose-900',
  };
  return map[status] || 'bg-slate-100 text-slate-800';
}

export default function ShiftClerkCard({ shift, onVerify, showPayments = true }) {
  const clerk = shift.billing_clerk;
  const payments = shift.payments || [];
  const needsVerify = shift.needs_verification && onVerify;
  const label = shift.verify_button_label || 'Verify';

  return (
    <article
      className={`rounded-xl border bg-white shadow-sm ${
        shift.status === 'discrepancy'
          ? 'border-rose-300'
          : shift.needs_verification
            ? 'border-amber-300'
            : 'border-slate-200'
      }`}
    >
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900">
              {clerk?.full_name || shift.clerk_name || 'Billing clerk'}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-violet-800">
              This clerk collected {formatMoney(shift.expected_total)} in this shift
            </p>
            <dl className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
              {clerk?.employee_id ? (
                <div>
                  <dt className="inline font-medium text-slate-500">Employee ID: </dt>
                  <dd className="inline">{clerk.employee_id}</dd>
                </div>
              ) : null}
              {clerk?.email ? (
                <div>
                  <dt className="inline font-medium text-slate-500">Email: </dt>
                  <dd className="inline break-all">{clerk.email}</dd>
                </div>
              ) : null}
              {clerk?.phone ? (
                <div>
                  <dt className="inline font-medium text-slate-500">Phone: </dt>
                  <dd className="inline">{clerk.phone}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadge(shift.status)}`}
            >
              {shift.status === 'discrepancy' ? 'Deficit' : shift.status}
            </span>
            {needsVerify ? (
              <button
                type="button"
                className={
                  shift.status === 'discrepancy'
                    ? `${nc.btnComplete} !bg-rose-700 hover:!bg-rose-800`
                    : nc.btnComplete
                }
                onClick={() => onVerify(shift.id)}
              >
                {label}
              </button>
            ) : shift.is_verified ? (
              <span className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-900">
                Verified
              </span>
            ) : null}
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {shift.shift_label} · {formatWhen(shift.shift_start)} — {formatWhen(shift.shift_end)}
        </p>
      </div>

      <div className="grid gap-3 px-4 py-3 sm:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Total collected</p>
          <p className="text-lg font-bold text-slate-900">{formatMoney(shift.expected_total)}</p>
        </div>
        <div className="rounded-lg bg-emerald-50/80 px-2 py-1">
          <p className="text-xs font-semibold uppercase text-emerald-800">Cash to verify</p>
          <p className="text-lg font-bold text-emerald-900">{formatMoney(shift.expected_cash)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">EFT (system)</p>
          <p className="text-lg font-bold text-violet-800">{formatMoney(shift.expected_eft)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Payments</p>
          <p className="text-lg font-bold text-slate-900">{shift.payment_count ?? 0}</p>
        </div>
      </div>

      {shift.verified_cash != null ? (
        <p className="border-t border-slate-100 px-4 py-2 text-sm text-slate-700">
          Cash counted: <strong>{formatMoney(shift.verified_cash)}</strong>
          {' · '}System cash: <strong>{formatMoney(shift.expected_cash)}</strong>
          {shift.has_deficit ? (
            <span className="ml-2 font-bold text-rose-700">
              · Deficit {formatMoney(shift.cash_deficit)}
            </span>
          ) : (
            <span className="ml-2 font-bold text-emerald-700">· No deficit</span>
          )}
        </p>
      ) : needsVerify ? (
        <p className="border-t border-amber-100 bg-amber-50/60 px-4 py-2 text-sm text-amber-900">
          Count this clerk’s physical cash and click <strong>Verify</strong>. A deficit is recorded
          if counted cash is less than {formatMoney(shift.expected_cash)}.
        </p>
      ) : null}

      {showPayments && payments.length > 0 ? (
        <div className="border-t border-slate-100 px-4 py-3">
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Payments collected by this clerk
          </h4>
          <div className="mt-2 max-h-40 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-slate-500">
                  <th className="py-1 pr-2">Patient</th>
                  <th className="py-1 pr-2">Visit</th>
                  <th className="py-1 pr-2">Cash</th>
                  <th className="py-1 pr-2">EFT</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.bill_id} className="border-t border-slate-50">
                    <td className="py-1.5 pr-2 font-medium text-slate-800">{p.patient_name || '—'}</td>
                    <td className="py-1.5 pr-2 text-slate-600">{p.visit_number || '—'}</td>
                    <td className="py-1.5 pr-2">{formatMoney(p.cash)}</td>
                    <td className="py-1.5 pr-2">{formatMoney(p.eft)}</td>
                    <td className="py-1.5 text-right font-semibold">{formatMoney(p.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : showPayments ? (
        <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          No payments recorded for this clerk in this shift yet.
        </p>
      ) : null}
    </article>
  );
}
