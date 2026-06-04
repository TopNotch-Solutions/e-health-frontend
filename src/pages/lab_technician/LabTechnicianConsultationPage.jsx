import { useCallback, useEffect, useMemo, useState } from 'react';
import { confirmAction } from '../../utils/confirmAction';
import { getLabRequest, startLabProcessing } from '../../api/lab';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import { layout as c } from '../doctor/styles/doctorLayoutClasses';
import LabTechnicianTopbar from './components/LabTechnicianTopbar';
import LabTechnicianWorkspace from './components/LabTechnicianWorkspace';
import { useLabQueue } from './hooks/useLabQueue';
import { useLabSession } from './hooks/useLabSession';

const KOPANO = 'https://kopanovertex.com/';

function QueueEmptyIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden className="text-slate-300">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function statusBadge(status) {
  if (status === 'processing') return <span className={c.badgeProgress}>In progress</span>;
  if (status === 'sample_collected') return <span className={c.badgeProgress}>Sample collected</span>;
  return <span className={c.badgePending}>Pending</span>;
}

export default function LabTechnicianConsultationPage() {
  const { technicianLabel, initials } = useLabSession();
  const [queueSearch, setQueueSearch] = useState('');
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [requestDetail, setRequestDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [queueActionError, setQueueActionError] = useState('');
  const [workspaceError, setWorkspaceError] = useState('');

  const { queue, loading, error: queueLoadError, live, refresh } = useLabQueue({});

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!activeRequestId) {
      setRequestDetail(null);
      setDetailError('');
      return undefined;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError('');
    (async () => {
      try {
        await startLabProcessing(activeRequestId).catch(() => {});
        const req = await getLabRequest(activeRequestId);
        if (!cancelled) setRequestDetail(req);
      } catch (err) {
        if (!cancelled) {
          setDetailError(err.message || 'Failed to load laboratory request');
          setRequestDetail(null);
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeRequestId]);

  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    if (!q) return queue;
    return queue.filter((row) => {
      return (
        row.patientName.toLowerCase().includes(q) ||
        String(row.patientNumber).toLowerCase().includes(q) ||
        (row.testType || '').toLowerCase().includes(q)
      );
    });
  }, [queue, queueSearch]);

  const totalCount = queue.length;
  const sessionActive = Boolean(activeRequestId);
  const showLabWorkspace =
    sessionActive && requestDetail && !detailLoading && !detailError;

  async function handleOpenRequest(row, e) {
    e?.stopPropagation();
    setQueueActionError('');
    setWorkspaceError('');
    if (activeRequestId && activeRequestId !== row.id) {
      setQueueActionError(
        'Return to the queue or finish the current patient before opening another request.'
      );
      return;
    }
    const name = row.patientName || 'this patient';
    if (!(await confirmAction({
      title: 'Open lab request?',
      text: `Open lab processing for ${name}?`,
      icon: 'question',
      confirmButtonText: 'Open request',
    }))) return;
    setActiveRequestId(row.id);
  }

  async function handleReturnToQueue() {
    const name = activeCardSnapshot?.patientName
      || (requestDetail?.visit?.patient
        ? [requestDetail.visit.patient.first_name, requestDetail.visit.patient.last_name].filter(Boolean).join(' ')
        : 'this patient');
    if (!(await confirmAction({
      title: 'Return to queue?',
      text: `Return ${name} to the waiting queue? Unsaved lab work will be discarded.`,
      icon: 'question',
      confirmButtonText: 'Return to queue',
    }))) return;
    setActiveRequestId(null);
    setRequestDetail(null);
    setWorkspaceError('');
    setDetailError('');
    refresh();
  }

  async function handleLabDone() {
    const name = activeCardSnapshot?.patientName || 'this patient';
    if (!(await confirmAction({
      title: 'Close session?',
      text: `Close the lab session for ${name} and return to the queue?`,
      icon: 'question',
      confirmButtonText: 'Close session',
    }))) return;
    setActiveRequestId(null);
    setRequestDetail(null);
    setWorkspaceError('');
    refresh();
  }

  const activeCardSnapshot = useMemo(() => {
    if (!activeRequestId) return null;
    return queue.find((r) => r.id === activeRequestId) || requestDetail;
  }, [queue, activeRequestId, requestDetail]);

  const activePatientName = useMemo(() => {
    if (activeCardSnapshot?.patientName) return activeCardSnapshot.patientName;
    const p = requestDetail?.visit?.patient;
    if (!p) return 'Patient';
    return [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Patient';
  }, [activeCardSnapshot, requestDetail]);

  const activePatientId = useMemo(() => {
    if (activeCardSnapshot?.patientNumber) return activeCardSnapshot.patientNumber;
    return requestDetail?.visit?.patient?.patient_number ?? '';
  }, [activeCardSnapshot, requestDetail]);

  return (
    <div className={c.page}>
      <LabTechnicianTopbar technicianLabel={technicianLabel} initials={initials} live={live} />

      {toast ? (
        <div className={c.toast} role="status">
          {toast}
        </div>
      ) : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="Laboratory patient queue">
          <h2 className={c.queueTitle}>Laboratory queue</h2>
          {sessionActive ? (
            <p className={c.queueSub}>You have an active laboratory session</p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{totalCount}</span> request{totalCount === 1 ? '' : 's'}{' '}
              waiting
            </p>
          )}

          {sessionActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="Processing"
              title="Active laboratory request"
              message="Record test results, then send back to the doctor. Use Return to queue if you need to pause."
            />
          ) : (
            <>
              <div className={c.searchWrap}>
                <label htmlFor="lab-queue-search" className="sr-only">
                  Search queue
                </label>
                <input
                  id="lab-queue-search"
                  type="search"
                  className={c.searchInput}
                  placeholder="Search by name, ID, or test"
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
                      ? 'No requests match your search.'
                      : 'No patients waiting in the laboratory queue.'}
                  </p>
                ) : (
                  filteredQueue.map((row) => (
                    <article
                      key={row.id}
                      className={`${c.queueCard} ${row.id === activeRequestId ? c.queueCardActive : ''}`}
                    >
                      <div className="flex flex-wrap items-center gap-1">
                        {statusBadge(row.status)}
                        {row.isEmergency ? (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[0.58rem] font-bold uppercase text-red-800">
                            Emergency
                          </span>
                        ) : null}
                      </div>
                      <p className={c.queueName}>{row.patientName}</p>
                      {row.patientNumber ? (
                        <p className={c.queueId}>ID: {row.patientNumber}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">{row.testType}</p>
                      <button
                        type="button"
                        className={c.btnCardPrimary}
                        disabled={actionLoading}
                        onClick={(e) => handleOpenRequest(row, e)}
                      >
                        Open request
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
            <div className={c.idle} role="region" aria-label="Laboratory workspace">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No request selected</h3>
              <p className={c.idleText}>
                Select a patient from the queue and click &lsquo;Open request&rsquo; to process
                laboratory tests and return results to the doctor.
              </p>
            </div>
          ) : detailLoading ? (
            <div className={c.idle} role="region" aria-label="Laboratory workspace">
              <p className={c.hint}>Loading request…</p>
            </div>
          ) : detailError ? (
            <div className={c.idle} role="region" aria-label="Laboratory workspace">
              <p className={`${c.hint} text-red-600`} role="alert">
                {detailError}
              </p>
              <button type="button" className={`${c.btnSecondary} mt-4`} onClick={handleReturnToQueue}>
                Back to queue
              </button>
            </div>
          ) : showLabWorkspace ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className={`${c.banner} shrink-0`}>
                <div>
                  <span className={c.bannerLabel}>Patient</span>
                  <strong className={c.bannerValue}>{activePatientName}</strong>
                </div>
                <div>
                  <span className={c.bannerLabel}>Patient ID</span>
                  <strong className={c.bannerValue}>{activePatientId || '—'}</strong>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <button type="button" className={c.btnSecondary} onClick={handleReturnToQueue}>
                    Return to queue
                  </button>
                </div>
              </div>

              <div className={c.formScroll}>
                <LabTechnicianWorkspace
                  request={requestDetail}
                  actionLoading={actionLoading}
                  setActionLoading={setActionLoading}
                  onToast={setToast}
                  onActionError={setWorkspaceError}
                  onDone={handleLabDone}
                />

                {workspaceError ? (
                  <p className={c.submitError} role="alert">
                    {workspaceError}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className={c.idle} role="region" aria-label="Laboratory workspace">
              <p className={c.hint}>Unable to display this request.</p>
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
        | Laboratory module
      </footer>
    </div>
  );
}
