import { useCallback, useEffect, useState } from 'react';
import { getStoredUser } from '../../api/authSession';
import {
  getRevenueDashboard,
  getRevenueShifts,
  getRevenueTransactions,
} from '../../api/revenue';
import { layout as c } from '../doctor/styles/doctorLayoutClasses';
import RevenueTopbar from './components/RevenueTopbar';
import RevenueKpiCard from './components/RevenueKpiCard';
import ShiftClerkCard from './components/ShiftClerkCard';
import ShiftVerifyModal from './components/ShiftVerifyModal';
import { revenue as rc } from './styles/revenueClasses';

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

  const facilityLabel = user?.facility_name || null;

  const [dashboard, setDashboard] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [transactions, setTransactions] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [verifyShiftId, setVerifyShiftId] = useState(null);
  const [shiftFilter, setShiftFilter] = useState('pending');
  const [openShifts, setOpenShifts] = useState([]);

  const load = useCallback(async () => {
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
      <RevenueTopbar officerLabel={label} facilityLabel={facilityLabel} initials={initials} />

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

        <div className={rc.main}>
            <div className={rc.kpiGrid}>
              <RevenueKpiCard
                title="Today"
                value={formatMoney(dashboard?.today?.total)}
                hint={`${dashboard?.today?.payment_count ?? 0} payments`}
              />
              <RevenueKpiCard
                title="This week"
                value={formatMoney(dashboard?.week?.total)}
                hint={`Cash ${formatMoney(dashboard?.week?.cash)}`}
              />
              <RevenueKpiCard
                title="This month"
                value={formatMoney(dashboard?.month?.total)}
                hint={`EFT ${formatMoney(dashboard?.month?.eft)}`}
              />
              <RevenueKpiCard
                title="Awaiting verification"
                value={String(dashboard?.pending_reconciliation ?? 0)}
                hint={`${dashboard?.discrepancies ?? 0} with deficit`}
                alert={(dashboard?.pending_reconciliation ?? 0) > 0}
              />
            </div>

            <section className={rc.sectionPanel}>
              <div className={rc.sectionHeader}>
                <div>
                  <h2 className={rc.sectionTitle}>Transactions</h2>
                  <p className={rc.sectionDesc}>Collections by period for your facility.</p>
                </div>
                <select
                  className={rc.select}
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
                <p className={rc.summaryBar}>
                  Period total <strong>{formatMoney(transactions.summary.total)}</strong>
                  {' · '}Cash <strong>{formatMoney(transactions.summary.cash)}</strong>
                  {' · '}EFT <strong>{formatMoney(transactions.summary.eft)}</strong>
                  {' · '}
                  <strong>{transactions.summary.payment_count}</strong> payments
                </p>
              ) : null}
              <div className={rc.tableWrap}>
                <table className={rc.table}>
                  <thead>
                    <tr className={rc.tableHead}>
                      <th className={rc.tableHeadCell}>Period</th>
                      <th className={rc.tableHeadCell}>Total</th>
                      <th className={rc.tableHeadCell}>Cash</th>
                      <th className={rc.tableHeadCell}>EFT</th>
                      <th className={rc.tableHeadCell}>Payments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(transactions?.series || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className={rc.emptyState}>
                          No paid transactions in this range.
                        </td>
                      </tr>
                    ) : (
                      transactions.series.map((row) => (
                        <tr key={row.key} className={rc.tableRow}>
                          <td className={rc.tableCellStrong}>{row.label}</td>
                          <td className={rc.tableCell}>{formatMoney(row.total)}</td>
                          <td className={rc.tableCell}>{formatMoney(row.cash)}</td>
                          <td className={rc.tableCell}>{formatMoney(row.eft)}</td>
                          <td className={rc.tableCell}>{row.count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {openShifts.length > 0 ? (
              <section className={rc.sectionPanel}>
                <h2 className={rc.sectionTitle}>Current shift — billing clerks on duty</h2>
                <p className={rc.sectionDesc}>
                  Live collections for the active window (updates as clerks take payments).
                </p>
                <ul className={rc.shiftList}>
                  {openShifts.map((s) => (
                    <li key={s.id}>
                      <ShiftClerkCard shift={s} showPayments />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className={rc.sectionPanel}>
              <div className={rc.sectionHeader}>
                <div>
                  <h2 className={rc.sectionTitle}>Verify billing clerks</h2>
                  <p className={rc.sectionDesc}>
                    Each card is one clerk&apos;s shift. Enter counted cash to verify; deficits are
                    flagged automatically.
                  </p>
                </div>
                <select
                  className={rc.select}
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
              <ul className={rc.shiftList}>
                {shifts.length === 0 ? (
                  <li className={rc.emptyState}>No shifts match this filter.</li>
                ) : (
                  shifts.map((s) => (
                    <li key={s.id}>
                      <ShiftClerkCard shift={s} showPayments onVerify={setVerifyShiftId} />
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>
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
