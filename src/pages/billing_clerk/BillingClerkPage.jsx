import { useEffect, useMemo, useState } from 'react';
import { confirmAction } from '../../utils/confirmAction';
import { getStoredUser } from '../../api/authSession';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import { layout as c } from '../doctor/styles/doctorLayoutClasses';
import BillingPaymentPanel from './components/BillingPaymentPanel';
import BillingTopbar from './components/BillingTopbar';
import BillingShiftBar from './components/BillingShiftBar';
import { useBillingQueue } from './hooks/useBillingQueue';

const KOPANO = 'https://kopanovertex.com/';

function QueueEmptyIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden className="text-slate-300">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function formatMoney(n) {
  return `N$ ${(parseFloat(n) || 0).toFixed(2)}`;
}

export default function BillingClerkPage() {
  const user = getStoredUser();
  const label =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Billing clerk';
  const facilityLabel = user?.facility_name || null;
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'BC';

  const { queue, loading, error: queueLoadError, live, refresh } = useBillingQueue();
  const [queueSearch, setQueueSearch] = useState('');
  const [activeBillId, setActiveBillId] = useState(null);
  const [toast, setToast] = useState('');
  const [queueActionError, setQueueActionError] = useState('');
  const [workspaceError, setWorkspaceError] = useState('');

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    if (!q) return queue;
    return queue.filter(
      (row) =>
        row.patient_name?.toLowerCase().includes(q) ||
        String(row.patient_number).toLowerCase().includes(q) ||
        String(row.visit_number).toLowerCase().includes(q)
    );
  }, [queue, queueSearch]);

  const activeBill = useMemo(
    () => queue.find((r) => r.bill_id === activeBillId) || null,
    [queue, activeBillId]
  );

  const totalCount = queue.length;
  const sessionActive = Boolean(activeBillId);

  function handleGetStarted(row, e) {
    e?.stopPropagation();
    setQueueActionError('');
    setWorkspaceError('');
    if (activeBillId && activeBillId !== row.bill_id) {
      setQueueActionError(
        'Return to the queue or finish payment before opening another patient.'
      );
      return;
    }
    setActiveBillId(row.bill_id);
  }

  async function handleReturnToQueue() {
    if (!(await confirmAction({
      title: 'Return to queue?',
      text: 'Pause this billing session and return the patient to the queue?',
      icon: 'question',
      confirmButtonText: 'Return to queue',
    }))) return;
    setActiveBillId(null);
    setWorkspaceError('');
    refresh();
  }

  function handlePaid() {
    setToast('Payment recorded — patient discharged.');
    setActiveBillId(null);
    setWorkspaceError('');
    refresh();
  }

  return (
    <div className={c.page}>
      <BillingTopbar clerkLabel={label} facilityLabel={facilityLabel} initials={initials} live={live} />
      <BillingShiftBar />

      {toast ? (
        <div className={c.toast} role="status">
          {toast}
        </div>
      ) : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="Billing patient queue">
          <h2 className={c.queueTitle}>Billing queue</h2>
          {sessionActive ? (
            <p className={c.queueSub}>You have an active payment session</p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{totalCount}</span> private patient
              {totalCount === 1 ? '' : 's'} awaiting payment
            </p>
          )}

          {sessionActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="Collecting payment"
              title="Active billing session"
              message="Enter cash and EFT amounts that match the total, then confirm payment. Use Return to queue to pause."
            />
          ) : (
            <>
              <div className={c.searchWrap}>
                <label htmlFor="billing-queue-search" className="sr-only">
                  Search queue
                </label>
                <input
                  id="billing-queue-search"
                  type="search"
                  className={c.searchInput}
                  placeholder="Search by name, ID, or visit"
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {queueLoadError ? (
                <p className={`${c.hint} text-red-600`} role="alert">
                  {queueLoadError}
                </p>
              ) : null}
              {queueActionError ? (
                <p className={`${c.hint} mt-1 text-red-600`} role="alert">
                  {queueActionError}
                </p>
              ) : null}

              <div className={c.queueList}>
                {loading ? (
                  <p className={c.hint}>Loading queue…</p>
                ) : filteredQueue.length === 0 ? (
                  <p className={c.hint}>
                    {queueSearch.trim()
                      ? 'No patients match your search.'
                      : 'No private patients awaiting payment.'}
                  </p>
                ) : (
                  filteredQueue.map((row) => (
                    <article
                      key={row.bill_id}
                      className={`${c.queueCard} ${row.bill_id === activeBillId ? c.queueCardActive : ''}`}
                    >
                      <span className={c.badgePending}>Payment due</span>
                      <p className={c.queueName}>{row.patient_name}</p>
                      {row.patient_number ? (
                        <p className={c.queueId}>ID: {row.patient_number}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-slate-600">
                        Visit {row.visit_number} · {formatMoney(row.balance_due)}
                      </p>
                      <button
                        type="button"
                        className={c.btnCardPrimary}
                        onClick={(e) => handleGetStarted(row, e)}
                      >
                        Get started
                      </button>
                    </article>
                  ))
                )}
              </div>
            </>
          )}
        </aside>

        <div className={c.main}>
          {!sessionActive ? (
            <div className={c.idle} role="region" aria-label="Billing workspace">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No patient selected</h3>
              <p className={c.idleText}>
                Select a private patient from the queue and click &lsquo;Get started&rsquo; to
                record cash and EFT payment before discharge.
              </p>
            </div>
          ) : !activeBill ? (
            <div className={c.idle} role="region" aria-label="Billing workspace">
              <p className={c.hint}>Bill details are no longer in the queue.</p>
              <button type="button" className={`${c.btnSecondary} mt-4`} onClick={handleReturnToQueue}>
                Back to queue
              </button>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div
                className={`${c.banner} shrink-0 !flex flex-wrap items-center justify-between gap-4`}
              >
                <div className="flex min-w-0 flex-1 flex-wrap gap-6 sm:gap-10">
                  <div>
                    <span className={c.bannerLabel}>Patient</span>
                    <strong className={c.bannerValue}>{activeBill.patient_name}</strong>
                  </div>
                  <div>
                    <span className={c.bannerLabel}>Patient ID</span>
                    <strong className={c.bannerValue}>{activeBill.patient_number || '—'}</strong>
                  </div>
                  <div>
                    <span className={c.bannerLabel}>Amount due</span>
                    <strong className={c.bannerValue}>{formatMoney(activeBill.balance_due)}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${c.btnSecondary} shrink-0`}
                  onClick={handleReturnToQueue}
                >
                  Return to queue
                </button>
              </div>

              <div className={c.formScroll}>
                <BillingPaymentPanel
                  key={activeBill.bill_id}
                  billRow={activeBill}
                  onPaid={handlePaid}
                  onActionError={setWorkspaceError}
                />

                {workspaceError ? (
                  <p className={c.submitError} role="alert">
                    {workspaceError}
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className={c.footer}>
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className={c.footerLink}>
          Kopano-Vertex
        </a>{' '}
        | Billing module
      </footer>
    </div>
  );
}
