import { useCallback, useEffect, useMemo, useState } from 'react';
import { confirmAction } from '../../utils/confirmAction';
import { getTransportRequest } from '../../api/transport';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import QueueEntryCard from '../../components/queue/QueueEntryCard';
import { layout as c } from '../doctor/styles/doctorLayoutClasses';
import PorterTopbar from './components/PorterTopbar';
import PorterWorkspace from './components/PorterWorkspace';
import { usePorterQueue } from './hooks/usePorterQueue';
import { usePorterSession } from './hooks/usePorterSession';

const KOPANO = 'https://kopanovertex.com/';

function QueueEmptyIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden className="text-slate-300">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function priorityBadge(priority) {
  if (priority === 'emergency') {
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[0.58rem] font-bold uppercase text-red-800">Emergency</span>;
  }
  if (priority === 'urgent') {
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.58rem] font-bold uppercase text-amber-900">Urgent</span>;
  }
  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.58rem] font-bold uppercase text-slate-600">Normal</span>;
}

function statusBadge(status) {
  if (status === 'in_transit') return <span className={c.badgeProgress}>Picked up</span>;
  return <span className={c.badgePending}>Awaiting pickup</span>;
}

export default function PorterConsultationPage() {
  const { porterLabel, initials } = usePorterSession();
  const [queueSearch, setQueueSearch] = useState('');
  const [activeTransportId, setActiveTransportId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [queueActionError, setQueueActionError] = useState('');
  const [workspaceError, setWorkspaceError] = useState('');

  const { queue, loading, error: queueLoadError, live, refresh } = usePorterQueue();

  const refreshDetail = useCallback(async () => {
    if (!activeTransportId) return;
    try {
      const row = await getTransportRequest(activeTransportId);
      setDetail(row);
    } catch {
      /* keep existing detail */
    }
  }, [activeTransportId]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!activeTransportId) {
      setDetail(null);
      setDetailError('');
      return undefined;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError('');
    getTransportRequest(activeTransportId)
      .then((row) => {
        if (!cancelled) setDetail(row);
      })
      .catch((err) => {
        if (!cancelled) {
          setDetailError(err.message || 'Failed to load transport job');
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTransportId]);

  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    if (!q) return queue;
    return queue.filter((row) => {
      return (
        row.patientName.toLowerCase().includes(q) ||
        String(row.patientNumber).toLowerCase().includes(q) ||
        (row.fromLocation || '').toLowerCase().includes(q) ||
        (row.toLocation || '').toLowerCase().includes(q)
      );
    });
  }, [queue, queueSearch]);

  const totalCount = queue.length;
  const sessionActive = Boolean(activeTransportId);
  const showWorkspace = sessionActive && detail && !detailLoading && !detailError;

  async function handleOpen(row) {
    setQueueActionError('');
    setWorkspaceError('');
    if (activeTransportId && activeTransportId !== row.id) {
      setQueueActionError('Return to the queue or finish the current job before opening another.');
      return;
    }
    if (!(await confirmAction({
      title: 'Open transport job?',
      text: `Open transport for ${row.patientName}?`,
      icon: 'question',
      confirmButtonText: 'Open job',
    }))) return;
    setActiveTransportId(row.id);
  }

  async function handleReturnToQueue() {
    const name = activeSnapshot?.patientName || 'this patient';
    if (!(await confirmAction({
      title: 'Return to queue?',
      text: `Return ${name} to the transport queue? Progress on this job will be paused.`,
      icon: 'question',
      confirmButtonText: 'Return to queue',
    }))) return;
    setActiveTransportId(null);
    setDetail(null);
    setWorkspaceError('');
    setDetailError('');
    refresh();
  }

  async function handleJobDone() {
    if (!(await confirmAction({
      title: 'Close job?',
      text: 'Close this transport job and return to the queue list?',
      icon: 'question',
      confirmButtonText: 'Close job',
    }))) return;
    setActiveTransportId(null);
    setDetail(null);
    setWorkspaceError('');
    refresh();
  }

  const activeSnapshot = useMemo(() => {
    if (!activeTransportId) return null;
    return queue.find((r) => r.id === activeTransportId) || null;
  }, [queue, activeTransportId]);

  const bannerPatient = useMemo(() => {
    if (activeSnapshot) {
      return {
        name: activeSnapshot.patientName,
        id: activeSnapshot.patientNumber,
      };
    }
    const p = detail?.visit?.patient;
    if (!p) return { name: 'Patient', id: '' };
    const name = [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Patient';
    return { name, id: p.patient_number || '' };
  }, [activeSnapshot, detail]);

  return (
    <div className={c.page}>
      <PorterTopbar porterLabel={porterLabel} initials={initials} live={live} />

      {toast ? (
        <div className={c.toast} role="status">
          {toast}
        </div>
      ) : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="Transport queue">
          <h2 className={c.queueTitle}>Transport queue</h2>
          {sessionActive ? (
            <p className={c.queueSub}>You have an active transport job</p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{totalCount}</span> job{totalCount === 1 ? '' : 's'} waiting or in
              progress
            </p>
          )}

          {sessionActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="Active"
              title="Current transport"
              message="Mark picked up when you collect the patient, then delivered at the ward. Use Return to queue to pause."
            />
          ) : (
            <>
              <div className={c.searchWrap}>
                <label htmlFor="porter-queue-search" className="sr-only">
                  Search queue
                </label>
                <input
                  id="porter-queue-search"
                  type="search"
                  className={c.searchInput}
                  placeholder="Search by name, ID, or location"
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
                      ? 'No jobs match your search.'
                      : 'No transport jobs right now.'}
                  </p>
                ) : (
                  filteredQueue.map((row) => (
                    <QueueEntryCard
                      key={row.id}
                      classes={c}
                      name={row.patientName}
                      idLabel={row.patientNumber ? `ID: ${row.patientNumber}` : undefined}
                      subtitle={`${row.fromLocation} → ${row.toLocation} · Mode: ${row.equipmentRequired}`}
                      badge={(
                        <div className="flex flex-wrap items-center gap-1">
                          {statusBadge(row.status)}
                          {priorityBadge(row.priority)}
                        </div>
                      )}
                      active={row.id === activeTransportId}
                      disabled={actionLoading}
                      onClick={() => handleOpen(row)}
                      openLabel="Open job"
                    />
                  ))
                )}
              </div>
            </>
          )}
        </aside>

        <div className={c.main}>
          {!sessionActive ? (
            <div className={c.idle} role="region" aria-label="Porter workspace">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No job selected</h3>
              <p className={c.idleText}>
                Choose a patient from the queue to view critical notes, the doctor&rsquo;s equipment checklist, and
                update pickup and delivery status.
              </p>
            </div>
          ) : detailLoading ? (
            <div className={c.idle} role="region" aria-label="Porter workspace">
              <p className={c.hint}>Loading job…</p>
            </div>
          ) : detailError ? (
            <div className={c.idle} role="region" aria-label="Porter workspace">
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
                  <strong className={c.bannerValue}>{bannerPatient.name}</strong>
                </div>
                <div>
                  <span className={c.bannerLabel}>Patient ID</span>
                  <strong className={c.bannerValue}>{bannerPatient.id || '—'}</strong>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <button type="button" className={c.btnSecondary} onClick={handleReturnToQueue}>
                    Return to queue
                  </button>
                </div>
              </div>

              <div className={c.formScroll}>
                <PorterWorkspace
                  transport={detail}
                  actionLoading={actionLoading}
                  setActionLoading={setActionLoading}
                  onToast={setToast}
                  onActionError={setWorkspaceError}
                  onRefreshQueue={refresh}
                  onRefreshDetail={refreshDetail}
                  onDone={handleJobDone}
                />
                {workspaceError ? (
                  <p className={c.submitError} role="alert">
                    {workspaceError}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className={c.idle} role="region" aria-label="Porter workspace">
              <p className={c.hint}>Unable to display this job.</p>
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
        | Porter module
      </footer>
    </div>
  );
}
