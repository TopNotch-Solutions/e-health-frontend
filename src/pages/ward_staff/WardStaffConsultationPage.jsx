import { useCallback, useEffect, useMemo, useState } from 'react';
import { confirmAction } from '../../utils/confirmAction';
import { getWardAdmission } from '../../api/ward';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import QueueEntryCard from '../../components/queue/QueueEntryCard';
import { layout as c } from '../doctor/styles/doctorLayoutClasses';
import WardStaffTopbar from './components/WardStaffTopbar';
import WardStaffWorkspace from './components/WardStaffWorkspace';
import { useWardStaffQueue } from './hooks/useWardStaffQueue';
import { useWardStaffSession } from './hooks/useWardStaffSession';

const KOPANO = 'https://kopanovertex.com/';

function QueueEmptyIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden className="text-slate-300">
      <path
        d="M4 20V6a2 2 0 012-2h12a2 2 0 012 2v14M8 20v-6h2v6M14 20v-4h2v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M4 10h16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function priorityBadge(priority) {
  if (priority === 'emergency') {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[0.58rem] font-bold uppercase text-red-800">
        Emergency
      </span>
    );
  }
  if (priority === 'urgent') {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.58rem] font-bold uppercase text-amber-900">
        Urgent
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.58rem] font-bold uppercase text-slate-600">
      Normal
    </span>
  );
}

export default function WardStaffConsultationPage() {
  const { staffLabel, initials, moduleLabel } = useWardStaffSession();
  const [queueSearch, setQueueSearch] = useState('');
  const [activeAdmissionId, setActiveAdmissionId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [queueActionError, setQueueActionError] = useState('');
  const [workspaceError, setWorkspaceError] = useState('');

  const { queue, loading, error: queueLoadError, live, refresh } = useWardStaffQueue();

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!activeAdmissionId) {
      setDetail(null);
      setDetailError('');
      return undefined;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError('');
    getWardAdmission(activeAdmissionId)
      .then((row) => {
        if (!cancelled) setDetail(row);
      })
      .catch((err) => {
        if (!cancelled) {
          setDetailError(err.message || 'Failed to load patient');
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeAdmissionId]);

  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    if (!q) return queue;
    return queue.filter((row) => {
      return (
        row.patientName.toLowerCase().includes(q) ||
        String(row.patientNumber).toLowerCase().includes(q) ||
        (row.wardName || '').toLowerCase().includes(q) ||
        (row.wardNumber || '').toLowerCase().includes(q) ||
        String(row.roomNumber).toLowerCase().includes(q)
      );
    });
  }, [queue, queueSearch]);

  const totalCount = queue.length;
  const sessionActive = Boolean(activeAdmissionId);
  const showWorkspace = sessionActive && detail && !detailLoading && !detailError;

  async function handleOpen(row) {
    setQueueActionError('');
    setWorkspaceError('');
    if (activeAdmissionId && activeAdmissionId !== row.id) {
      setQueueActionError('Finish or return from the current patient before opening another.');
      return;
    }
    const name = row.patientName || 'this patient';
    if (!(await confirmAction({
      title: 'Open patient?',
      text: `Open ward arrival details for ${name}?`,
      icon: 'question',
      confirmButtonText: 'Open patient',
    }))) return;
    setActiveAdmissionId(row.id);
  }

  async function handleReturnToQueue() {
    const name = bannerPatient?.name || 'this patient';
    if (!(await confirmAction({
      title: 'Return to queue?',
      text: `Return ${name} to the waiting queue?`,
      icon: 'question',
      confirmButtonText: 'Return to queue',
    }))) return;
    setActiveAdmissionId(null);
    setDetail(null);
    setWorkspaceError('');
    setDetailError('');
    refresh();
  }

  async function handleDone() {
    const name = bannerPatient?.name || 'this patient';
    if (!(await confirmAction({
      title: 'Close session?',
      text: `Close the session for ${name} and return to the queue?`,
      icon: 'question',
      confirmButtonText: 'Close session',
    }))) return;
    setActiveAdmissionId(null);
    setDetail(null);
    setWorkspaceError('');
    refresh();
  }

  const activeSnapshot = useMemo(() => {
    if (!activeAdmissionId) return null;
    return queue.find((r) => r.id === activeAdmissionId) || null;
  }, [queue, activeAdmissionId]);

  const bannerPatient = useMemo(() => {
    if (activeSnapshot) {
      return {
        name: activeSnapshot.patientName,
        id: activeSnapshot.patientNumber,
      };
    }
    const p = detail?.patient;
    if (!p) return { name: 'Patient', id: '' };
    const name = [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Patient';
    return { name, id: p.patient_number || '' };
  }, [activeSnapshot, detail]);

  return (
    <div className={c.page}>
      <WardStaffTopbar staffLabel={staffLabel} initials={initials} live={live} moduleLabel={moduleLabel} />

      {toast ? (
        <div className={c.toast} role="status">
          {toast}
        </div>
      ) : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="Arrival queue">
          <h2 className={c.queueTitle}>Arrival queue</h2>
          {sessionActive ? (
            <p className={c.queueSub}>Confirming arrival for selected patient</p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{totalCount}</span> patient{totalCount === 1 ? '' : 's'} awaiting
              ward arrival
            </p>
          )}

          {sessionActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="Active"
              title="Current patient"
              message="Confirm the arrival date when the patient reaches the ward. Use Return to queue to choose another."
            />
          ) : (
            <>
              <div className={c.searchWrap}>
                <label htmlFor="ward-staff-queue-search" className="sr-only">
                  Search queue
                </label>
                <input
                  id="ward-staff-queue-search"
                  type="search"
                  className={c.searchInput}
                  placeholder="Search by name, ID, or ward"
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
                      : 'No patients awaiting arrival confirmation.'}
                  </p>
                ) : (
                  filteredQueue.map((row) => (
                    <QueueEntryCard
                      key={row.id}
                      classes={c}
                      name={row.patientName}
                      idLabel={row.patientNumber ? `ID: ${row.patientNumber}` : undefined}
                      subtitle={`${row.wardName} (${row.wardNumber}) · Room ${row.roomNumber} · Bed ${row.bedNumber}`}
                      badge={(
                        <div className="flex flex-wrap items-center gap-1">
                          <span className={c.badgePending}>Awaiting arrival</span>
                          {row.isEmergency ? (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[0.58rem] font-bold uppercase text-red-800">
                              Emergency
                            </span>
                          ) : (
                            priorityBadge(row.transportPriority)
                          )}
                        </div>
                      )}
                      active={row.id === activeAdmissionId}
                      emergency={row.isEmergency}
                      disabled={actionLoading}
                      onClick={() => handleOpen(row)}
                      openLabel="Open patient"
                    />
                  ))
                )}
              </div>
            </>
          )}
        </aside>

        <div className={c.main}>
          {!sessionActive ? (
            <div className={c.idle} role="region" aria-label="Ward staff workspace">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No patient selected</h3>
              <p className={c.idleText}>
                When a doctor admits a patient, they appear here for ward staff and in the porter transport
                queue. Select a patient to review ward, room, and bed details and confirm their arrival date.
              </p>
            </div>
          ) : detailLoading ? (
            <div className={c.idle} role="region" aria-label="Ward staff workspace">
              <p className={c.hint}>Loading patient…</p>
            </div>
          ) : detailError ? (
            <div className={c.idle} role="region" aria-label="Ward staff workspace">
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
                <WardStaffWorkspace
                  admission={detail}
                  actionLoading={actionLoading}
                  setActionLoading={setActionLoading}
                  onToast={setToast}
                  onActionError={setWorkspaceError}
                  onRefreshQueue={refresh}
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
            <div className={c.idle} role="region" aria-label="Ward staff workspace">
              <p className={c.hint}>Unable to display this patient.</p>
              <button type="button" className={`${c.btnSecondary} mt-4`} onClick={handleReturnToQueue}>
                Back to queue
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className={c.footer}>
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className="text-teal-700 font-semibold hover:underline">
          Kopano-Vertex
        </a>{' '}
        | {moduleLabel}
      </footer>
    </div>
  );
}
