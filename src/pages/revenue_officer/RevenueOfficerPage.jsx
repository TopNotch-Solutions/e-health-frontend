import { useCallback, useEffect, useState } from 'react';
import { getStoredUser } from '../../api/authSession';
import {
  getRevenueDashboard,
  getRevenueShifts,
  getRevenueTransactions,
} from '../../api/revenue';
import { layout as c } from '../doctor/styles/doctorLayoutClasses';
import { nurse as nc } from '../nurse/styles/nurseClasses';
import RevenueTopbar from './components/RevenueTopbar';
import ShiftClerkCard from './components/ShiftClerkCard';
import ShiftVerifyModal from './components/ShiftVerifyModal';

const KOPANO = 'https://kopanovertex.com/';
const PERIODS = [
  { id: 'daily', label: 'Daily (14 days)' },
  { id: 'weekly', label: 'Weekly (12 weeks)' },
  { id: 'monthly', label: 'Monthly (12 months)' },
];

function formatMoney(n) {
  return `N$ ${(parseFloat(n) || 0).toFixed(2)}`;
}

export default function RevenueOfficerPage() {
  const user = getStoredUser();
  const label =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Revenue officer';
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'RO';

  const [dashboard, setDashboard] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [transactions, setTransactions] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [verifyShiftId, setVerifyShiftId] = useState(null);
  const [shiftFilter, setShiftFilter] = useState('pending');
  const [openShifts, setOpenShifts] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const statusParam = shiftFilter || undefined;
      const [dash, tx, shiftData, openData] = await Promise.all([
        getRevenueDashboard(),
        getRevenueTransactions(period),
        getRevenueShifts({ status: statusParam, limit: 50 }),
        getRevenueShifts({ status: 'open', limit: 20 }),
      ]);
      setDashboard(dash);
      setTransactions(tx);
      const rows = shiftData?.rows || [];
      setShifts(shiftFilter === '' ? rows.filter((s) => s.status !== 'open') : rows);
      setOpenShifts(openData?.rows || []);
    } catch (err) {
      setError(err.message || 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  }, [period, shiftFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    getRevenueTransactions(period)
      .then(setTransactions)
      .catch(() => {});
  }, [period]);

  return (
    <div className={c.page}>
      <RevenueTopbar officerLabel={label} initials={initials} />

      {toast ? (
        <div className={c.toast} role="status">
          {toast}
        </div>
      ) : null}

      <div className={`${c.body} !flex-col`}>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        {loading && !dashboard ? (
          <p className={c.hint}>Loading revenue office…</p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            <section className={nc.sectionPanel}>
              <h2 className={nc.sectionTitle}>Collections overview</h2>
              <p className="mt-1 text-sm text-slate-600">
                Shifts run automatically: day 08:00–20:00, night 20:00–08:00. Verify physical cash
                at the end of each 12-hour window. A deficit means collected cash is less than system
                records.
              </p>
              {dashboard?.current_shift ? (
                <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                  Active now: <strong>{dashboard.current_shift.label}</strong>
                </p>
              ) : null}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Today" value={formatMoney(dashboard?.today?.total)} sub={`${dashboard?.today?.payment_count ?? 0} payments`} />
                <KpiCard title="This week" value={formatMoney(dashboard?.week?.total)} sub={`Cash ${formatMoney(dashboard?.week?.cash)}`} />
                <KpiCard title="This month" value={formatMoney(dashboard?.month?.total)} sub={`EFT ${formatMoney(dashboard?.month?.eft)}`} />
                <KpiCard
                  title="Awaiting verification"
                  value={String(dashboard?.pending_reconciliation ?? 0)}
                  sub={`${dashboard?.discrepancies ?? 0} with deficit`}
                  alert={(dashboard?.pending_reconciliation ?? 0) > 0}
                />
              </div>
            </section>

            <section className={nc.sectionPanel}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className={nc.sectionTitle}>Transactions</h2>
                <select
                  className={nc.select}
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  aria-label="Transaction period"
                >
                  {PERIODS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              {transactions?.summary ? (
                <p className="mt-2 text-sm text-slate-600">
                  Period total {formatMoney(transactions.summary.total)} · Cash{' '}
                  {formatMoney(transactions.summary.cash)} · EFT{' '}
                  {formatMoney(transactions.summary.eft)} · {transactions.summary.payment_count}{' '}
                  payments
                </p>
              ) : null}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                      <th className="py-2 pr-3">Period</th>
                      <th className="py-2 pr-3">Total</th>
                      <th className="py-2 pr-3">Cash</th>
                      <th className="py-2 pr-3">EFT</th>
                      <th className="py-2">Payments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(transactions?.series || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-slate-500">
                          No paid transactions in this range.
                        </td>
                      </tr>
                    ) : (
                      transactions.series.map((row) => (
                        <tr key={row.key} className="border-b border-slate-100">
                          <td className="py-2 pr-3 font-medium text-slate-800">{row.label}</td>
                          <td className="py-2 pr-3">{formatMoney(row.total)}</td>
                          <td className="py-2 pr-3">{formatMoney(row.cash)}</td>
                          <td className="py-2 pr-3">{formatMoney(row.eft)}</td>
                          <td className="py-2">{row.count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {openShifts.length > 0 ? (
              <section className={nc.sectionPanel}>
                <h2 className={nc.sectionTitle}>Current shift — billing clerks on duty</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Live collections for the active 12-hour window (updates as clerks take payments).
                </p>
                <ul className="mt-4 space-y-4">
                  {openShifts.map((s) => (
                    <li key={s.id}>
                      <ShiftClerkCard shift={s} showPayments />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className={nc.sectionPanel}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className={nc.sectionTitle}>Verify billing clerks</h2>
                <select
                  className={nc.select}
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value)}
                  aria-label="Shift status filter"
                >
                  <option value="pending">Awaiting verify</option>
                  <option value="discrepancy">Deficits only</option>
                  <option value="reconciled">Verified</option>
                  <option value="closed">Closed (unverified)</option>
                  <option value="open">Shift in progress</option>
                  <option value="">All</option>
                </select>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Each card is one billing clerk’s collections for a shift. Use <strong>Verify</strong>{' '}
                to enter cash counted for that clerk only; the system flags a deficit if it is less
                than their recorded cash.
              </p>
              <ul className="mt-4 space-y-4">
                {shifts.length === 0 ? (
                  <li className="text-sm text-slate-500">No shifts match this filter.</li>
                ) : (
                  shifts.map((s) => (
                    <li key={s.id}>
                      <ShiftClerkCard
                        shift={s}
                        showPayments
                        onVerify={setVerifyShiftId}
                      />
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>
        )}
      </div>

      {verifyShiftId ? (
        <ShiftVerifyModal
          shiftId={verifyShiftId}
          onClose={() => setVerifyShiftId(null)}
          onVerified={() => {
            setToast('Shift verified.');
            load();
          }}
        />
      ) : null}

      <footer className={c.footer}>
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className={c.footerLink}>
          Kopano-Vertex
        </a>{' '}
        | Revenue office
      </footer>
    </div>
  );
}

function KpiCard({ title, value, sub, alert }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        alert ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-slate-600">{sub}</p> : null}
    </div>
  );
}
