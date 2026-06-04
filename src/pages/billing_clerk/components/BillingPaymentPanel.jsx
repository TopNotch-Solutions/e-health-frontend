import { useMemo, useState } from 'react';
import { confirmAction } from '../../../utils/confirmAction';
import { recordPayment } from '../../../api/billing';
import { nurse as nc } from '../../nurse/styles/nurseClasses';

const CATEGORY_LABELS = {
  nursing: 'Admission fee',
  consultation: 'Consultation',
  medication: 'Medication',
  lab: 'Laboratory',
  sonar: 'Ultrasound',
  ward: 'Ward stay',
  other: 'Other',
};

function formatMoney(n) {
  const v = parseFloat(n) || 0;
  return `N$ ${v.toFixed(2)}`;
}

export default function BillingPaymentPanel({ billRow, onPaid, onActionError }) {
  const [cash, setCash] = useState('');
  const [eft, setEft] = useState('');
  const [loading, setLoading] = useState(false);

  const total = parseFloat(billRow?.total_amount) || 0;
  const cashNum = parseFloat(cash) || 0;
  const eftNum = parseFloat(eft) || 0;
  const sum = Math.round((cashNum + eftNum) * 100) / 100;
  const totalsMatch = Math.abs(sum - total) < 0.01 && total > 0;

  const balanceHint = useMemo(() => {
    if (!total) return 'No amount due';
    if (totalsMatch) return 'Ready to confirm payment';
    return `Remaining: ${formatMoney(total - sum)}`;
  }, [total, sum, totalsMatch]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!totalsMatch) return;
    if (!(await confirmAction({
      title: 'Confirm payment?',
      text: `Record payment of ${formatMoney(total)} for this visit?`,
      icon: 'question',
      confirmButtonText: 'Confirm payment',
    }))) return;
    setLoading(true);
    onActionError('');
    try {
      await recordPayment({
        bill_id: billRow.bill_id,
        cash_amount: cashNum,
        eft_amount: eftNum,
      });
      onPaid();
    } catch (err) {
      onActionError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <section className={nc.sectionPanel}>
        <h3 className={nc.sectionTitle}>Bill summary</h3>
        <p className="mt-1 text-sm text-slate-600">
          Visit {billRow.visit_number} · Private payer
        </p>
        <p className="mt-3 text-2xl font-bold text-violet-900">{formatMoney(total)}</p>

        <ul className="mt-4 space-y-2">
          {(billRow.items || []).map((item) => (
            <li
              key={item.id}
              className="flex justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <span>
                <span className="font-medium text-slate-800">{item.description}</span>
                <span className="ml-2 text-xs text-slate-500">
                  {CATEGORY_LABELS[item.category] || item.category}
                </span>
              </span>
              <span className="shrink-0 font-semibold text-slate-900">
                {formatMoney(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={nc.sectionPanel}>
        <h3 className={nc.sectionTitle}>Record payment</h3>
        <p className="mt-1 text-sm text-slate-600">
          EFT is processed elsewhere — capture the amount here. Cash plus EFT must equal the total
          before you can confirm.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className={nc.label}>Cash (NAD)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className={nc.input}
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="0.00"
            />
          </label>
          <label className="block text-sm">
            <span className={nc.label}>EFT (NAD)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className={nc.input}
              value={eft}
              onChange={(e) => setEft(e.target.value)}
              placeholder="0.00"
            />
          </label>
        </div>

        <p
          className={`mt-3 text-sm ${totalsMatch ? 'font-medium text-emerald-700' : 'text-amber-800'}`}
        >
          Sum: {formatMoney(sum)} — {balanceHint}
        </p>

        <div className="mt-6">
          <button
            type="submit"
            className={nc.btnComplete}
            disabled={loading || !totalsMatch}
          >
            {loading ? 'Processing…' : 'Confirm payment & discharge'}
          </button>
        </div>
      </section>
    </form>
  );
}
