import { useEffect, useMemo, useState } from 'react';
import { getSonarRequest, startSonarScan } from '../../api/sonar';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import { layout as c } from '../doctor/styles/doctorLayoutClasses';
import RadiologistTopbar from './components/RadiologistTopbar';
import RadiologistWorkspace from './components/RadiologistWorkspace';
import { useSonarQueue } from './hooks/useSonarQueue';
import { useRadiologistSession } from './hooks/useRadiologistSession';

const KOPANO = 'https://kopanovertex.com/';

function QueueEmptyIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden className="text-slate-300">
      <path
        d="M4 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function statusBadge(status) {
  if (status === 'awaiting_report') {
    return <span className={c.badgeProgress}>Awaiting report</span>;
  }
  if (status === 'in_progress') {
    return <span className={c.badgeProgress}>In progress</span>;
  }
  return <span className={c.badgePending}>Pending</span>;
}

export default function RadiologistConsultationPage() {
  const { radiologistLabel, initials } = useRadiologistSession();
  const [queueSearch, setQueueSearch] = useState('');
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [requestDetail, setRequestDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [queueActionError, setQueueActionError] = useState('');
  const [workspaceError, setWorkspaceError] = useState('');

  const { queue, loading, error: queueLoadError, live, refresh } = useSonarQueue({});

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
        await startSonarScan(activeRequestId).catch(() => {});
        const req = await getSonarRequest(activeRequestId);
        if (!cancelled) setRequestDetail(req);
      } catch (err) {
        if (!cancelled) {
          setDetailError(err.message || 'Failed to load imaging request');
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
    return queue.filter(
      (row) =>
        row.patientName.toLowerCase().includes(q) ||
        String(row.patientNumber).toLowerCase().includes(q) ||
        (row.scanType || '').toLowerCase().includes(q)
    );
  }, [queue, queueSearch]);

  const totalCount = queue.length;
  const sessionActive = Boolean(activeRequestId);
  const showWorkspace =
    sessionActive && requestDetail && !detailLoading && !detailError;

  function handleOpenRequest(row, e) {
    e?.stopPropagation();
    setQueueActionError('');
    setWorkspaceError('');
    if (activeRequestId && activeRequestId !== row.id) {
      setQueueActionError(
        'Finish the current ultrasound session before opening another patient.'
      );
      return;
    }
    setActiveRequestId(row.id);
  }

  function handleReturnToQueue() {
    setActiveRequestId(null);
    setRequestDetail(null);
    setWorkspaceError('');
    setDetailError('');
    refresh();
  }

  function handleDone() {
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
      <RadiologistTopbar radiologistLabel={radiologistLabel} initials={initials} live={live} />

      {toast ? (
        <div className={c.toast} role="status">
          {toast}
        </div>
      ) : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="Ultrasound patient queue">
          <h2 className={c.queueTitle}>Sonar queue</h2>
          {sessionActive ? (
            <p className={c.queueSub}>Active imaging session</p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{totalCount}</span> referral
              {totalCount === 1 ? '' : 's'} waiting
            </p>
          )}

          {sessionActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="Imaging"
              title="Active ultrasound referral"
              message="Complete imaging notes and the diagnostic report, then return the patient to the doctor."
            />
          ) : (
            <>
              <div className={c.searchWrap}>
                <label htmlFor="sonar-queue-search" className="sr-only">
                  Search queue
                </label>
                <input
                  id="sonar-queue-search"
                  type="search"
                  className={c.searchInput}
                  placeholder="Search by name, ID, or scan"
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
                      ? 'No referrals match your search.'
                      : 'No patients waiting in the sonar queue.'}
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
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">{row.scanType}</p>
                      {row.prepInstructions ? (
                        <p className="mt-1 text-[0.65rem] text-amber-800 line-clamp-2">
                          Prep: {row.prepInstructions}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        className={c.btnCardPrimary}
                        disabled={actionLoading}
                        onClick={(e) => handleOpenRequest(row, e)}
                      >
                        Open referral
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
            <div className={c.idle} role="region" aria-label="Radiologist workspace">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No referral selected</h3>
              <p className={c.idleText}>
                Select a patient from the sonar queue to review the doctor&apos;s referral,
                perform ultrasound, and submit a formal report back to the referring doctor.
              </p>
            </div>
          ) : detailLoading ? (
            <div className={c.idle} role="region" aria-label="Radiologist workspace">
              <p className={c.hint}>Loading referral…</p>
            </div>
          ) : detailError ? (
            <div className={c.idle} role="region" aria-label="Radiologist workspace">
              <p className={`${c.hint} text-red-600`} role="alert">
                {detailError}
              </p>
              <button type="button" className={`${c.btnSecondary} mt-4`} onClick={handleReturnToQueue}>
                Back to queue
              </button>
            </div>
          ) : showWorkspace ? (
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

              <div className={`${c.formScroll} pr-1`}>
                <RadiologistWorkspace
                  request={requestDetail}
                  actionLoading={actionLoading}
                  setActionLoading={setActionLoading}
                  onToast={setToast}
                  onActionError={setWorkspaceError}
                  onDone={handleDone}
                />

                {workspaceError ? (
                  <p className={c.submitError} role="alert">
                    {workspaceError}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className={c.idle} role="region" aria-label="Radiologist workspace">
              <p className={c.hint}>Unable to display this referral.</p>
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
        | Ultrasound (sonar)
      </footer>
    </div>
  );
}
