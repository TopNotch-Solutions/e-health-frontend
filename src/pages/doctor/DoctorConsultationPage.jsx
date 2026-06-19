import { useCallback, useEffect, useMemo, useState } from 'react';
import { startQueueEntry } from '../../api/queue';
import DoctorTopbar from './components/DoctorTopbar';
import DoctorWorkspace from './components/DoctorWorkspace';
import { useDoctorQueue, useDoctorSession, pickAutoResumeEntry } from './hooks/useDoctorQueue';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import QueueEntryCard from '../../components/queue/QueueEntryCard';
import { sortQueueEmergencyFirst } from '../../utils/queueDisplay';
import { confirmStartPatientSession } from '../../utils/confirmAction';
import { layout as c } from './styles/doctorLayoutClasses';

const KOPANO = 'https://kopanovertex.com/';

function QueueEmptyIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden className="text-slate-300">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 10h-1V7a4 4 0 10-8 0v3H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2zm-3 0h-4V7a2 2 0 114 0v3z" />
    </svg>
  );
}

export default function DoctorConsultationPage() {
  const { doctorLabel, initials, userId } = useDoctorSession();
  const [queueSearch, setQueueSearch] = useState('');
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [queueActionError, setQueueActionError] = useState('');
  const [workspaceError, setWorkspaceError] = useState('');

  const onQueueSynced = useCallback(
    (mapped) => {
      const mine = pickAutoResumeEntry(mapped, userId);
      if (mine) {
        setActiveEntryId((prev) => prev || mine.entryId);
      }
    },
    [userId]
  );

  const { queue, loading, error: queueLoadError, live, refresh } = useDoctorQueue({
    onQueueSynced,
  });

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!activeEntryId || !userId) return;
    const still = queue.find(
      (p) =>
        p.entryId === activeEntryId &&
        p.status === 'in_progress' &&
        p.assignedToId === userId
    );
    if (!still) setActiveEntryId(null);
  }, [queue, activeEntryId, userId]);

  const activePatient = useMemo(
    () => queue.find((p) => p.entryId === activeEntryId) || null,
    [queue, activeEntryId]
  );

  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    const list = q
      ? queue.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.patientIdLabel.toLowerCase().includes(q) ||
            p.patient?.patient_number?.toLowerCase().includes(q) ||
            p.sexAge.toLowerCase().includes(q)
        )
      : queue;
    return sortQueueEmergencyFirst(list);
  }, [queue, queueSearch]);

  const totalCount = queue.length;

  function isLockedToOther(patient) {
    return (
      patient.status === 'in_progress' &&
      patient.assignedToId &&
      patient.assignedToId !== userId
    );
  }

  function isLockedToMe(patient) {
    return patient.status === 'in_progress' && patient.assignedToId === userId;
  }

  async function handleStartConsultation(patient) {
    if (patient.status === 'completed' || isLockedToOther(patient) || actionLoading) return;

    const starting = patient.status === 'pending';
    if (!(await confirmStartPatientSession(patient.name, starting))) return;

    setActionLoading(true);
    setQueueActionError('');
    setWorkspaceError('');
    try {
      if (patient.status === 'pending') {
        await startQueueEntry(patient.entryId);
        await refresh();
      }
      setActiveEntryId(patient.entryId);
    } catch (err) {
      setQueueActionError(err.message || 'Could not start consultation');
    } finally {
      setActionLoading(false);
    }
  }

  function handleConsultationDone() {
    setActiveEntryId(null);
    setWorkspaceError('');
    refresh();
  }

  function renderBadge(patient) {
    if (patient.status === 'completed') {
      return <span className={c.badgeCompleted}>Completed</span>;
    }
    if (patient.isEmergency) {
      return <span className={c.badgeEmergency}>Emergency</span>;
    }
    if (patient.status === 'in_progress') {
      const mine = isLockedToMe(patient);
      return (
        <span className={c.badgeProgress}>
          In progress
          {mine ? (
            <span className={c.lockTag}>
              <LockIcon /> You
            </span>
          ) : patient.assignedToName ? (
            <span className={c.lockTag}>
              <LockIcon /> {patient.assignedToName}
            </span>
          ) : null}
        </span>
      );
    }
    return <span className={c.badgePending}>Pending</span>;
  }

  const workspaceActive =
    activePatient &&
    activePatient.status === 'in_progress' &&
    activePatient.assignedToId === userId;

  return (
    <div className={c.page}>
      <DoctorTopbar doctorLabel={doctorLabel} initials={initials} live={live} />

      {toast ? (
        <div className={c.toast} role="status">
          {toast}
        </div>
      ) : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="Today's patient queue">
          <h2 className={c.queueTitle}>Today&apos;s Patient Queue</h2>
          {workspaceActive ? (
            <p className={c.queueSub}>You have an active consultation</p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{totalCount}</span> patient{totalCount === 1 ? '' : 's'}{' '}
              in queue
            </p>
          )}

          {workspaceActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="In progress"
              title="Active consultation"
              message="Finish diagnosis and disposition to see waiting patients again."
              patientName={activePatient.name}
              patientMeta={activePatient.sexAge}
              patientIdLabel={activePatient.patientIdLabel}
            />
          ) : (
            <>
              <div className={c.searchWrap}>
                <label htmlFor="doc-queue-search" className="sr-only">
                  Search queue
                </label>
                <input
                  id="doc-queue-search"
                  type="search"
                  className={c.searchInput}
                  placeholder="Search by name or patient ID?"
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
                  <p className={c.hint}>Loading queue?</p>
                ) : filteredQueue.length === 0 ? (
                  <p className={c.hint}>
                    {queueSearch.trim()
                      ? 'No patients match your search.'
                      : 'No patients waiting for consultation.'}
                  </p>
                ) : (
                  filteredQueue.map((p) => (
                    <QueueEntryCard
                      key={p.entryId}
                      classes={c}
                      name={p.name}
                      meta={p.sexAge}
                      idLabel={p.patientIdLabel}
                      badge={renderBadge(p)}
                      active={p.entryId === activeEntryId}
                      locked={isLockedToOther(p)}
                      emergency={p.isEmergency && p.status !== 'completed'}
                      completed={p.status === 'completed'}
                      disabled={actionLoading}
                      onClick={() => handleStartConsultation(p)}
                      openLabel="Start consultation"
                      activeLabel="Consultation open"
                    />
                  ))
                )}
              </div>
            </>
          )}
        </aside>

        <div className={c.main}>
          {!workspaceActive ? (
            <div className={c.idle} role="region" aria-label="Consultation workspace">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No patient selected</h3>
              <p className={c.idleText}>
                Select a patient from the queue — click their card to start or resume a consultation.
              </p>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className={`${c.banner} shrink-0`}>
                <div>
                  <span className={c.bannerLabel}>Active patient</span>
                  <strong className={c.bannerValue}>{activePatient.name}</strong>
                </div>
                <div>
                  <span className={c.bannerLabel}>Demographics</span>
                  <strong className={c.bannerValue}>{activePatient.sexAge}</strong>
                </div>
                <div>
                  <span className={c.bannerLabel}>Patient ID</span>
                  <strong className={c.bannerValue}>
                    {activePatient.patientIdLabel.replace('ID: ', '')}
                  </strong>
                </div>
              </div>

              <div className={c.formScroll}>
                <DoctorWorkspace
                  patient={activePatient}
                  actionLoading={actionLoading}
                  setActionLoading={setActionLoading}
                  onToast={setToast}
                  onActionError={setWorkspaceError}
                  onDone={handleConsultationDone}
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
        | Doctor module
      </footer>
    </div>
  );
}
