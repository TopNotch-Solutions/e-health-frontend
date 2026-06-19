import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { confirmAction, confirmReturnToQueue, confirmStartPatientSession } from '../../utils/confirmAction';
import { startQueueEntry, releaseQueueEntry } from '../../api/queue';
import { getClinicalTimeline } from '../../api/vitals';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import QueueEntryCard from '../../components/queue/QueueEntryCard';
import { sortQueueEmergencyFirst } from '../../utils/queueDisplay';
import { nurse as c } from '../nurse/styles/nurseClasses';
import EmergencyUnitNurseTopbar from './components/EmergencyUnitNurseTopbar';
import EmergencyUnitNurseWorkspace from './components/EmergencyUnitNurseWorkspace';
import {
  useEmergencyUnitNurseQueue,
  useEmergencyUnitNurseSession,
  pickAutoResumeEntry,
} from './hooks/useEmergencyUnitNurseQueue';

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

export default function EmergencyUnitNursePage() {
  const { nurseLabel, initials, userId } = useEmergencyUnitNurseSession();
  const [queueSearch, setQueueSearch] = useState('');
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [queueActionError, setQueueActionError] = useState('');
  const [workspaceError, setWorkspaceError] = useState('');
  const skipAutoResumeRef = useRef(false);

  const onQueueSynced = useCallback((mapped) => {
    if (skipAutoResumeRef.current) { skipAutoResumeRef.current = false; return; }
    const mine = pickAutoResumeEntry(mapped, userId);
    if (mine) setActiveEntryId((prev) => prev || mine.entryId);
  }, [userId]);

  const { queue, setQueue, loading, error: queueLoadError, live, refresh } = useEmergencyUnitNurseQueue({ onQueueSynced });

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!activeEntryId || !userId) return;
    const still = queue.find((p) => p.entryId === activeEntryId && p.status === 'in_progress' && p.assignedToId === userId);
    if (!still) setActiveEntryId(null);
  }, [queue, activeEntryId, userId]);

  const activePatient = useMemo(() => queue.find((p) => p.entryId === activeEntryId) || null, [queue, activeEntryId]);

  useEffect(() => {
    if (!activePatient?.visitId) { setTimeline(null); return undefined; }
    let cancelled = false;
    setTimelineLoading(true);
    getClinicalTimeline(activePatient.visitId)
      .then((data) => { if (!cancelled) setTimeline(data); })
      .catch(() => { if (!cancelled) setTimeline(null); })
      .finally(() => { if (!cancelled) setTimelineLoading(false); });
    return () => { cancelled = true; };
  }, [activePatient?.visitId]);

  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    const list = q ? queue.filter((p) => p.name.toLowerCase().includes(q) || p.patientIdLabel.toLowerCase().includes(q)) : queue;
    return sortQueueEmergencyFirst(list);
  }, [queue, queueSearch]);

  const workspaceActive = activePatient && activePatient.status === 'in_progress' && activePatient.assignedToId === userId;

  function isLockedToOther(patient) {
    return patient.status === 'in_progress' && patient.assignedToId && patient.assignedToId !== userId;
  }

  async function handleSelectPatient(patient) {
    if (isLockedToOther(patient) || actionLoading) return;
    if (workspaceActive && patient.entryId !== activeEntryId) return;
    const starting = patient.status === 'pending';
    if (!(await confirmStartPatientSession(patient.name, starting))) return;
    setActionLoading(true);
    setQueueActionError('');
    try {
      if (patient.status === 'pending') {
        await startQueueEntry(patient.entryId);
        await refresh();
      }
      setActiveEntryId(patient.entryId);
    } catch (err) {
      setQueueActionError(err.message || 'Could not open patient');
    } finally {
      setActionLoading(false);
    }
  }

  function handleDone() {
    const id = activePatient?.entryId;
    skipAutoResumeRef.current = true;
    setActiveEntryId(null);
    setTimeline(null);
    if (id) setQueue((prev) => prev.filter((p) => p.entryId !== id));
    refresh();
  }

  function renderBadge(patient) {
    if (patient.isEmergency) return <span className={c.badgeEmergency}>Emergency</span>;
    if (patient.status === 'in_progress') {
      return (
        <span className={c.badgeProgress}>
          In progress
          {patient.assignedToId === userId ? <span className={c.lockTag}><LockIcon /> You</span> : null}
        </span>
      );
    }
    return <span className={c.badgePending}>Waiting</span>;
  }

  return (
    <div className={c.page}>
      <EmergencyUnitNurseTopbar nurseLabel={nurseLabel} initials={initials} live={live} />
      {toast ? <div className={c.toast} role="status">{toast}</div> : null}
      <div className={c.body}>
        <aside className={c.queueAside} aria-label="Emergency queue">
          <h2 className={c.queueTitle}>Emergency Unit</h2>
          {workspaceActive ? (
            <p className={c.queueSub}>Active triage session</p>
          ) : (
            <p className={c.queueSub}><span className={c.queueCount}>{queue.length}</span> patient{queue.length === 1 ? '' : 's'} waiting</p>
          )}
          {workspaceActive ? (
            <ActiveSessionQueueAside classes={c} badge="In progress" title="Active emergency session" message="Record vitals, screening assessment, interventions, then route." />
          ) : (
            <>
              <div className={c.searchWrap}>
                <input type="search" className={c.searchInput} placeholder="Search…" value={queueSearch} onChange={(e) => setQueueSearch(e.target.value)} />
              </div>
              {queueLoadError ? <p className={`${c.hint} text-red-600`} role="alert">{queueLoadError}</p> : null}
              {queueActionError ? <p className={`${c.hint} text-red-600`} role="alert">{queueActionError}</p> : null}
              <div className={c.queueList}>
                {loading ? <p className={c.hint}>Loading…</p> : filteredQueue.length === 0 ? (
                  <p className={c.hint}>No patients in the emergency queue.</p>
                ) : filteredQueue.map((p) => (
                  <QueueEntryCard
                    key={p.entryId}
                    classes={c}
                    name={p.name}
                    meta={p.sexAge}
                    idLabel={p.patientIdLabel}
                    badge={renderBadge(p)}
                    active={p.entryId === activeEntryId}
                    emergency={p.isEmergency}
                    onClick={() => handleSelectPatient(p)}
                  />
                ))}
              </div>
            </>
          )}
        </aside>
        <div className={c.main}>
          {!workspaceActive ? (
            <div className={c.idle}><QueueEmptyIcon /><h3 className={c.idleTitle}>No patient selected</h3><p className={c.idleText}>Combines parameter nurse, screening nurse, and emergency triage. Patients arrive from Front Office or other clinic routes.</p></div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className={`${c.banner} shrink-0`}>
                <div><span className={c.bannerLabel}>Active patient</span><strong className={c.bannerValue}>{activePatient.name}</strong></div>
                <div><span className={c.bannerLabel}>Demographics</span><strong className={c.bannerValue}>{activePatient.sexAge}</strong></div>
                <div><span className={c.bannerLabel}>Patient ID</span><strong className={c.bannerValue}>{activePatient.patientIdLabel.replace('ID: ', '')}</strong></div>
              </div>
              <div className={c.formScroll}>
                <EmergencyUnitNurseWorkspace patient={activePatient} timeline={timeline} timelineLoading={timelineLoading} actionLoading={actionLoading} setActionLoading={setActionLoading} onToast={setToast} onActionError={setWorkspaceError} onDone={handleDone} />
                {workspaceError ? <p className={c.submitError} role="alert">{workspaceError}</p> : null}
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <button type="button" className={c.btnSecondary} disabled={actionLoading} onClick={async () => {
                    if (!(await confirmReturnToQueue(activePatient.name, 'Unsaved work will be discarded.'))) return;
                    await releaseQueueEntry(activePatient.entryId);
                    handleDone();
                  }}>Return to queue</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <footer className={c.footer}>Health Management System | <a href={KOPANO} className={c.footerLink} target="_blank" rel="noreferrer">Kopano-Vertex</a> | Emergency Unit</footer>
    </div>
  );
}
