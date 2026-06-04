import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { startQueueEntry, releaseQueueEntry } from '../../api/queue';
import { getFamilyPlanningHandover } from '../../api/familyPlanningSuite';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import { confirmReturnToQueue, confirmStartPatientSession } from '../../utils/confirmAction';
import { sortQueueEmergencyFirst } from '../../utils/queueDisplay';
import { nurse as c } from '../nurse/styles/nurseClasses';
import FamilyPlanningTopbar from './components/FamilyPlanningTopbar';
import FamilyPlanningHandoverPanel from './components/FamilyPlanningHandoverPanel';
import FamilyPlanningWorkspace from './components/FamilyPlanningWorkspace';
import { emptyPlanningForm, emptyOralLogEntry } from './familyPlanningSuiteForm';
import {
  useFamilyPlanningQueue,
  useFamilyPlanningSession,
  pickAutoResumeEntry,
} from './hooks/useFamilyPlanningQueue';

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

export default function FamilyPlanningSuitePage() {
  const { label, initials, userId } = useFamilyPlanningSession();
  const [queueSearch, setQueueSearch] = useState('');
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [form, setForm] = useState(emptyPlanningForm());
  const [fieldErrors, setFieldErrors] = useState({});
  const [handover, setHandover] = useState(null);
  const [handoverLoading, setHandoverLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [queueActionError, setQueueActionError] = useState('');
  const skipAutoResumeRef = useRef(false);

  const onQueueSynced = useCallback(
    (mapped) => {
      if (skipAutoResumeRef.current) {
        skipAutoResumeRef.current = false;
        return;
      }
      const mine = pickAutoResumeEntry(mapped, userId);
      if (mine) setActiveEntryId((prev) => prev || mine.entryId);
    },
    [userId]
  );

  const { queue, setQueue, loading, error: queueLoadError, live, refresh } = useFamilyPlanningQueue({
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
        p.entryId === activeEntryId
        && p.status === 'in_progress'
        && p.assignedToId === userId
    );
    if (!still) setActiveEntryId(null);
  }, [queue, activeEntryId, userId]);

  const activePatient = useMemo(
    () => queue.find((p) => p.entryId === activeEntryId) || null,
    [queue, activeEntryId]
  );

  useEffect(() => {
    if (!activePatient?.visitId) {
      setHandover(null);
      setForm(emptyPlanningForm());
      return undefined;
    }
    let cancelled = false;
    setHandoverLoading(true);
    getFamilyPlanningHandover(activePatient.visitId)
      .then((data) => {
        if (cancelled) return;
        setHandover(data);
        setForm(emptyPlanningForm(data?.record));
      })
      .catch(() => { if (!cancelled) setHandover(null); })
      .finally(() => { if (!cancelled) setHandoverLoading(false); });
    return () => { cancelled = true; };
  }, [activePatient?.visitId]);

  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    const list = q
      ? queue.filter(
        (p) =>
          p.name.toLowerCase().includes(q)
          || p.patientIdLabel.toLowerCase().includes(q)
      )
      : queue;
    return sortQueueEmergencyFirst(list);
  }, [queue, queueSearch]);

  const workspaceActive =
    activePatient
    && activePatient.status === 'in_progress'
    && activePatient.assignedToId === userId;

  function isLockedToOther(patient) {
    return (
      patient.status === 'in_progress'
      && patient.assignedToId
      && patient.assignedToId !== userId
    );
  }

  async function handleSelectPatient(patient) {
    if (isLockedToOther(patient) || actionLoading) return;
    if (workspaceActive && patient.entryId !== activeEntryId) return;

    const starting = patient.status === 'pending';
    if (!(await confirmStartPatientSession(patient.name, starting))) return;

    setActionLoading(true);
    setQueueActionError('');
    setSubmitError('');
    try {
      if (patient.status === 'pending') {
        await startQueueEntry(patient.entryId);
        await refresh();
      }
      setActiveEntryId(patient.entryId);
      setFieldErrors({});
    } catch (err) {
      setQueueActionError(err.message || 'Could not open patient');
    } finally {
      setActionLoading(false);
    }
  }

  function handleSessionDone() {
    skipAutoResumeRef.current = true;
    if (activePatient) {
      setQueue((prev) => prev.filter((p) => p.entryId !== activePatient.entryId));
    }
    setActiveEntryId(null);
    setHandover(null);
    setForm(emptyPlanningForm());
    setSubmitError('');
    refresh();
  }

  async function handleReturnToQueue() {
    if (!activePatient || actionLoading) return;
    if (!(await confirmReturnToQueue(activePatient.name))) return;

    setActionLoading(true);
    try {
      skipAutoResumeRef.current = true;
      await releaseQueueEntry(activePatient.entryId);
      setActiveEntryId(null);
      setHandover(null);
      setForm(emptyPlanningForm());
      setToast(`${activePatient.name} returned to queue`);
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Could not return patient to queue');
    } finally {
      setActionLoading(false);
    }
  }

  function renderBadge(patient) {
    if (patient.isEmergency) return <span className={c.badgeEmergency}>Emergency</span>;
    if (patient.status === 'in_progress') {
      return (
        <span className={c.badgeProgress}>
          In progress
          {patient.assignedToId === userId ? (
            <span className={c.lockTag}><LockIcon /> You</span>
          ) : patient.assignedToName ? (
            <span className={c.lockTag}><LockIcon /> {patient.assignedToName}</span>
          ) : null}
        </span>
      );
    }
    return <span className={c.badgePending}>Waiting</span>;
  }

  return (
    <div className={c.page}>
      <FamilyPlanningTopbar label={label} initials={initials} live={live} />
      {toast ? <div className={c.toast} role="status">{toast}</div> : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="Family Planning suite queue">
          <h2 className={c.queueTitle}>Family Planning Suite</h2>
          {workspaceActive ? (
            <p className={c.queueSub}>One patient at a time — log procedures and route supplies</p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{queue.length}</span> patient{queue.length === 1 ? '' : 's'} waiting
            </p>
          )}

          {workspaceActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="In progress"
              title="Active planning session"
              message="Complete documentation and save once."
            />
          ) : (
            <>
              <div className={c.searchWrap}>
                <input
                  type="search"
                  className={c.searchInput}
                  placeholder="Search by name or patient ID…"
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                />
              </div>
              {queueLoadError ? <p className={`${c.hint} text-red-600`} role="alert">{queueLoadError}</p> : null}
              {queueActionError ? <p className={`${c.hint} text-red-600`} role="alert">{queueActionError}</p> : null}
              <div className={c.queueList}>
                {loading ? (
                  <p className={c.hint}>Loading queue…</p>
                ) : filteredQueue.length === 0 ? (
                  <p className={c.hint}>No patients in the Family Planning suite queue.</p>
                ) : (
                  filteredQueue.map((p) => (
                    <article
                      key={p.entryId}
                      role="button"
                      tabIndex={isLockedToOther(p) ? -1 : 0}
                      className={`${c.queueCard} cursor-pointer ${
                        p.entryId === activeEntryId ? c.queueCardActive : ''
                      } ${isLockedToOther(p) ? `${c.queueCardLocked} cursor-not-allowed` : ''}`}
                      onClick={() => handleSelectPatient(p)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectPatient(p);
                        }
                      }}
                    >
                      <div>{renderBadge(p)}</div>
                      <p className={c.queueName}>{p.name}</p>
                      <p className={c.queueMeta}>{p.sexAge}</p>
                      <p className={c.queueId}>{p.patientIdLabel}</p>
                    </article>
                  ))
                )}
              </div>
            </>
          )}
        </aside>

        <div className={c.main}>
          {!workspaceActive ? (
            <div className={c.idle} role="region">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No patient selected</h3>
              <p className={c.idleText}>
                Patients routed from Front Office appear here. Select one intervention type,
                document the procedure, optionally add medications, then save once.
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
                  <strong className={c.bannerValue}>{activePatient.patientIdLabel.replace('ID: ', '')}</strong>
                </div>
              </div>

              <div className={c.formScroll}>
                <FamilyPlanningHandoverPanel handover={handover} loading={handoverLoading} />
                <FamilyPlanningWorkspace
                  patient={activePatient}
                  form={form}
                  onInterventionTypeChange={(type) => {
                    const next = { ...emptyPlanningForm(), intervention_type: type };
                    if (type === 'oral') {
                      next.oral_contraceptive_log = [emptyOralLogEntry()];
                    }
                    setForm(next);
                    setFieldErrors({});
                  }}
                  onFormChange={(key, value) => {
                    setForm((prev) => ({ ...prev, [key]: value }));
                    setFieldErrors((prev) => {
                      if (!prev._form && !prev[key]) return prev;
                      const next = { ...prev };
                      delete next._form;
                      delete next.intervention_type;
                      delete next[key];
                      return next;
                    });
                  }}
                  fieldErrors={fieldErrors}
                  record={handover?.record}
                  actionLoading={actionLoading}
                  setActionLoading={setActionLoading}
                  onToast={setToast}
                  onError={setSubmitError}
                  onDone={handleSessionDone}
                />
                {submitError ? (
                  <p className={c.submitError} role="alert">{submitError}</p>
                ) : null}
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    className={c.btnSecondary}
                    disabled={actionLoading}
                    onClick={handleReturnToQueue}
                  >
                    Return to queue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className={c.footer}>
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className={c.footerLink}>Kopano-Vertex</a>
        {' '}| Family Planning Suite
      </footer>
    </div>
  );
}
