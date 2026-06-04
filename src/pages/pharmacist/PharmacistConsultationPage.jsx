import { useCallback, useEffect, useMemo, useState } from 'react';
import { confirmAction } from '../../utils/confirmAction';
import { getPharmacyPrescription } from '../../api/pharmacy';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import { layout as c } from '../doctor/styles/doctorLayoutClasses';
import PharmacistTopbar from './components/PharmacistTopbar';
import PharmacistWorkspace from './components/PharmacistWorkspace';
import { usePharmacistQueue } from './hooks/usePharmacistQueue';
import { usePharmacistSession } from './hooks/usePharmacistSession';
import { pendingItems, stockSummary } from './pharmacyStockDisplay';

const KOPANO = 'https://kopanovertex.com/';

function QueueEmptyIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden className="text-slate-300">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function patientLabel(rx) {
  const p = rx?.visit?.patient;
  if (!p) return { name: 'Patient', sexAge: '', patientIdLabel: '' };
  const name = [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Patient';
  const patientIdLabel = p.patient_number ? `ID: ${p.patient_number}` : '';
  return { name, sexAge: '', patientIdLabel };
}

function pendingMedicationCount(rx) {
  return pendingItems(rx.items).length;
}

export default function PharmacistConsultationPage() {
  const { pharmacistLabel, initials } = usePharmacistSession();
  const [queueSearch, setQueueSearch] = useState('');
  const [activePrescriptionId, setActivePrescriptionId] = useState(null);
  const [prescriptionDetail, setPrescriptionDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [queueActionError, setQueueActionError] = useState('');
  const [workspaceError, setWorkspaceError] = useState('');

  const { queue, loading, error: queueLoadError, live, refresh } = usePharmacistQueue({});

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!activePrescriptionId) {
      setPrescriptionDetail(null);
      setDetailError('');
      return undefined;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError('');
    getPharmacyPrescription(activePrescriptionId)
      .then((rx) => {
        if (!cancelled) setPrescriptionDetail(rx);
      })
      .catch((err) => {
        if (!cancelled) {
          setDetailError(err.message || 'Failed to load prescription');
          setPrescriptionDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activePrescriptionId]);

  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    if (!q) return queue;
    return queue.filter((rx) => {
      const { name, patientIdLabel } = patientLabel(rx);
      const pn = rx?.visit?.patient?.patient_number ?? '';
      return (
        name.toLowerCase().includes(q) ||
        patientIdLabel.toLowerCase().includes(q) ||
        String(pn).toLowerCase().includes(q)
      );
    });
  }, [queue, queueSearch]);

  const totalCount = queue.length;

  const sessionActive = Boolean(activePrescriptionId);

  const showDispensingWorkspace =
    sessionActive && prescriptionDetail && !detailLoading && !detailError;

  const refreshDetailAndQueue = useCallback(async () => {
    await refresh();
    if (!activePrescriptionId) return null;
    try {
      const rx = await getPharmacyPrescription(activePrescriptionId);
      setPrescriptionDetail(rx);
      return rx;
    } catch {
      return null;
    }
  }, [activePrescriptionId, refresh]);

  function handleOpenPrescription(rx, e) {
    e?.stopPropagation();
    setQueueActionError('');
    setWorkspaceError('');
    if (activePrescriptionId && activePrescriptionId !== rx.id) {
      setQueueActionError('Return to the queue or finish the current prescription before opening another patient.');
      return;
    }
    setActivePrescriptionId(rx.id);
  }

  async function handleReturnToQueue() {
    if (!(await confirmAction({
      title: 'Return to queue?',
      text: 'Pause dispensing and return to the prescription queue?',
      icon: 'question',
      confirmButtonText: 'Return to queue',
    }))) return;
    setActivePrescriptionId(null);
    setPrescriptionDetail(null);
    setWorkspaceError('');
    setDetailError('');
    refresh();
  }

  async function handleDispensingDone() {
    if (!(await confirmAction({
      title: 'Finish dispensing?',
      text: 'Close this prescription session and return to the queue?',
      icon: 'question',
      confirmButtonText: 'Done',
    }))) return;
    setActivePrescriptionId(null);
    setPrescriptionDetail(null);
    setWorkspaceError('');
    refresh();
  }

  function renderRxBadge(rx) {
    const pending = pendingMedicationCount(rx);
    const stock = stockSummary(rx.items);
    const statusBadge =
      rx.status === 'partially_dispensed' ? (
        <span className={c.badgeProgress}>
          In progress
          {pending > 0 ? <span className="text-[0.58rem] font-bold normal-case"> · {pending} left</span> : null}
        </span>
      ) : (
        <span className={c.badgePending}>
          Pending
          {pending > 0 ? <span className="text-[0.58rem] font-bold normal-case"> · {pending} items</span> : null}
        </span>
      );

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {statusBadge}
        {stock.outOfStock > 0 ? (
          <span className="inline-flex rounded-full bg-rose-100 px-1.5 py-0.5 text-[0.58rem] font-bold text-rose-900">
            {stock.outOfStock} out
          </span>
        ) : null}
        {stock.lowStock > 0 ? (
          <span className="inline-flex rounded-full bg-amber-100 px-1.5 py-0.5 text-[0.58rem] font-bold text-amber-900">
            {stock.lowStock} low
          </span>
        ) : null}
      </div>
    );
  }

  const activeCardSnapshot = useMemo(() => {
    if (!activePrescriptionId) return null;
    return queue.find((r) => r.id === activePrescriptionId) || prescriptionDetail;
  }, [queue, activePrescriptionId, prescriptionDetail]);

  const activePatientUi = activeCardSnapshot ? patientLabel(activeCardSnapshot) : null;

  return (
    <div className={c.page}>
      <PharmacistTopbar pharmacistLabel={pharmacistLabel} initials={initials} live={live} />

      {toast ? (
        <div className={c.toast} role="status">
          {toast}
        </div>
      ) : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="Pharmacy prescription queue">
          <h2 className={c.queueTitle}>Patient prescription queue</h2>
          {sessionActive ? (
            <p className={c.queueSub}>You have an active dispensing session</p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{totalCount}</span> prescription{totalCount === 1 ? '' : 's'}{' '}
              waiting
            </p>
          )}

          {sessionActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="Dispensing"
              title="Active prescription"
              message="Mark medications as given, then return to the queue when finished. Use Return to queue if you need to pause without completing all items."
            />
          ) : (
            <>
              <div className={c.searchWrap}>
                <label htmlFor="rx-queue-search" className="sr-only">
                  Search queue
                </label>
                <input
                  id="rx-queue-search"
                  type="search"
                  className={c.searchInput}
                  placeholder="Search by name or patient ID"
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
                      ? 'No prescriptions match your search.'
                      : 'No prescriptions waiting for the pharmacy.'}
                  </p>
                ) : (
                  filteredQueue.map((rx) => {
                    const { name, patientIdLabel } = patientLabel(rx);
                    return (
                      <article
                        key={rx.id}
                        className={`${c.queueCard} ${rx.id === activePrescriptionId ? c.queueCardActive : ''}`}
                      >
                        <div>{renderRxBadge(rx)}</div>
                        <p className={c.queueName}>{name}</p>
                        {patientIdLabel ? <p className={c.queueId}>{patientIdLabel}</p> : null}
                        <button
                          type="button"
                          className={c.btnCardPrimary}
                          disabled={actionLoading}
                          onClick={(e) => handleOpenPrescription(rx, e)}
                        >
                          Open prescription
                        </button>
                      </article>
                    );
                  })
                )}
              </div>
            </>
          )}
        </aside>

        <div className={c.main}>
          {!sessionActive ? (
            <div className={c.idle} role="region" aria-label="Dispensing workspace">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No prescription selected</h3>
              <p className={c.idleText}>
                Select a patient from the queue and click &lsquo;Open prescription&rsquo; to
                dispense their medications.
              </p>
            </div>
          ) : detailLoading ? (
            <div className={c.idle} role="region" aria-label="Dispensing workspace">
              <p className={c.hint}>Loading prescription…</p>
            </div>
          ) : detailError ? (
            <div className={c.idle} role="region" aria-label="Dispensing workspace">
              <p className={`${c.hint} text-red-600`} role="alert">
                {detailError}
              </p>
              <button type="button" className={`${c.btnSecondary} mt-4`} onClick={handleReturnToQueue}>
                Back to queue
              </button>
            </div>
          ) : showDispensingWorkspace ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className={`${c.banner} shrink-0`}>
                <div>
                  <span className={c.bannerLabel}>Patient</span>
                  <strong className={c.bannerValue}>{activePatientUi?.name}</strong>
                </div>
                <div>
                  <span className={c.bannerLabel}>Patient ID</span>
                  <strong className={c.bannerValue}>
                    {(activePatientUi?.patientIdLabel || '').replace(/^ID:\s*/, '') || '—'}
                  </strong>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <button type="button" className={c.btnSecondary} onClick={handleReturnToQueue}>
                    Return to queue
                  </button>
                </div>
              </div>

              <div className={c.formScroll}>
                <PharmacistWorkspace
                  prescription={prescriptionDetail}
                  actionLoading={actionLoading}
                  setActionLoading={setActionLoading}
                  onToast={setToast}
                  onActionError={setWorkspaceError}
                  onDone={handleDispensingDone}
                  onRefreshDetail={refreshDetailAndQueue}
                />

                {workspaceError ? (
                  <p className={c.submitError} role="alert">
                    {workspaceError}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className={c.idle} role="region" aria-label="Dispensing workspace">
              <p className={c.hint}>Unable to display this prescription.</p>
              <button type="button" className={`${c.btnSecondary} mt-4`} onClick={handleReturnToQueue}>
                Back to queue
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className={c.footer}>
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className={c.footerLink}>
          Kopano-Vertex
        </a>{' '}
        | Pharmacist module
      </footer>
    </div>
  );
}
