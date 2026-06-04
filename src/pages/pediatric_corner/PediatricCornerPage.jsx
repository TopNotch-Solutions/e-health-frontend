import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { startQueueEntry, releaseQueueEntry } from '../../api/queue';
import { getPediatricHandover, routePediatricToMasterDoctor } from '../../api/pediatricCorner';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import { sortQueueEmergencyFirst } from '../../utils/queueDisplay';
import { alertAction, confirmAction, confirmReturnToQueue, confirmStartPatientSession } from '../../utils/confirmAction';
import { nurse as c } from '../nurse/styles/nurseClasses';
import PediatricCornerTopbar from './components/PediatricCornerTopbar';
import PediatricAssessmentForm from './components/PediatricAssessmentForm';
import {
  emptyAssessmentForm,
  validateAssessmentForm,
  buildPayload,
  pediatricEligibility,
} from './pediatricCornerForm';
import {
  usePediatricCornerQueue,
  usePediatricCornerSession,
  pickAutoResumeEntry,
} from './hooks/usePediatricCornerQueue';

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

export default function PediatricCornerPage() {
  const { label, initials, userId } = usePediatricCornerSession();
  const [queueSearch, setQueueSearch] = useState('');
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [form, setForm] = useState(emptyAssessmentForm());
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

  const { queue, setQueue, loading, error: queueLoadError, live, refresh } = usePediatricCornerQueue({
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

  const eligibility = useMemo(
    () => handover?.eligibility || pediatricEligibility(activePatient?.patient),
    [handover?.eligibility, activePatient?.patient]
  );

  useEffect(() => {
    if (!activePatient?.visitId) {
      setHandover(null);
      setForm(emptyAssessmentForm());
      return undefined;
    }
    let cancelled = false;
    setHandoverLoading(true);
    getPediatricHandover(activePatient.visitId)
      .then((data) => {
        if (cancelled) return;
        setHandover(data);
        if (data?.eligibility?.eligible) {
          setForm(emptyAssessmentForm(data?.assessment));
        }
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
    && activePatient.assignedToId === userId
    && eligibility?.eligible;

  function isLockedToOther(patient) {
    return (
      patient.status === 'in_progress'
      && patient.assignedToId
      && patient.assignedToId !== userId
    );
  }

  async function handleSelectPatient(patient) {
    if (isLockedToOther(patient) || actionLoading) return;
    if (!patient.pediatricEligible) {
      const elig = pediatricEligibility(patient.patient);
      await alertAction({
        title: 'Not eligible',
        text: elig.message,
        icon: 'error',
      });
      return;
    }
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
    setForm(emptyAssessmentForm());
    setSubmitError('');
    refresh();
  }

  async function handleSubmit() {
    if (!activePatient || !eligibility?.eligible || actionLoading) return;
    const errors = validateAssessmentForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    const confirmed = await confirmAction({
      title: 'Send to Master Doctor?',
      text: `Save pediatric assessment and send ${activePatient.name} to the Master Doctor queue?`,
      icon: 'warning',
      confirmButtonText: 'Save & send',
    });
    if (!confirmed) return;

    setActionLoading(true);
    setSubmitError('');
    try {
      await routePediatricToMasterDoctor(
        buildPayload(form, activePatient.visitId, activePatient.entryId)
      );
      setToast(`${activePatient.name} sent to Master Doctor`);
      handleSessionDone();
    } catch (err) {
      setSubmitError(err.message || 'Failed to save and route patient');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReturnToQueue() {
    if (!activePatient || actionLoading) return;
    const confirmed = await confirmAction({
      title: 'Return to queue?',
      text: `Return ${activePatient.name} to the waiting queue? Unsaved vitals and assessment will be discarded.`,
      icon: 'question',
      confirmButtonText: 'Return to queue',
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      skipAutoResumeRef.current = true;
      await releaseQueueEntry(activePatient.entryId);
      setActiveEntryId(null);
      setHandover(null);
      setForm(emptyAssessmentForm());
      setToast(`${activePatient.name} returned to queue`);
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Could not return patient to queue');
    } finally {
      setActionLoading(false);
    }
  }

  function renderBadge(patient) {
    if (!patient.pediatricEligible) {
      return <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">Age 12+</span>;
    }
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

  const showIneligibleWorkspace =
    activePatient
    && activePatient.status === 'in_progress'
    && activePatient.assignedToId === userId
    && !eligibility?.eligible;

  return (
    <div className={c.page}>
      <PediatricCornerTopbar label={label} initials={initials} live={live} />
      {toast ? <div className={c.toast} role="status">{toast}</div> : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="Pediatric Corner queue">
          <h2 className={c.queueTitle}>Pediatric Corner</h2>
          <p className={c.queueSub}>
            Patients must be <strong>under 12 years</strong>. Routed from Front Office only.
          </p>
          {workspaceActive ? (
            <p className={c.queueSub}>One patient at a time — pediatric triage</p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{queue.length}</span> patient{queue.length === 1 ? '' : 's'} waiting
            </p>
          )}

          {workspaceActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="In progress"
              title="Active pediatric session"
              message="Complete vitals and assessment, then save once to Master Doctor."
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
                  <p className={c.hint}>No patients in the Pediatric Corner queue.</p>
                ) : (
                  filteredQueue.map((p) => (
                    <article
                      key={p.entryId}
                      role="button"
                      tabIndex={isLockedToOther(p) || !p.pediatricEligible ? -1 : 0}
                      className={`${c.queueCard} cursor-pointer ${
                        p.entryId === activeEntryId ? c.queueCardActive : ''
                      } ${isLockedToOther(p) || !p.pediatricEligible ? `${c.queueCardLocked} cursor-not-allowed` : ''}`}
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
                      {!p.pediatricEligible ? (
                        <p className="mt-2 text-xs font-semibold text-slate-500">Not eligible (age 12+)</p>
                      ) : null}
                    </article>
                  ))
                )}
              </div>
            </>
          )}
        </aside>

        <div className={c.main}>
          {!activePatient || (!workspaceActive && !showIneligibleWorkspace) ? (
            <div className={c.idle} role="region">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No patient selected</h3>
              <p className={c.idleText}>
                Select a child under 12 years from the queue. Record temperature, weight, and a
                general assessment, then save once to route directly to the Master Doctor.
              </p>
            </div>
          ) : showIneligibleWorkspace ? (
            <div className={c.idle} role="region">
              <h3 className={c.idleTitle}>Patient not eligible</h3>
              <p className="mt-3 text-sm text-red-700" role="alert">
                {eligibility?.message || 'This patient cannot be seen in Pediatric Corner.'}
              </p>
              <button
                type="button"
                className={`${c.btnSecondary} mt-6`}
                disabled={actionLoading}
                onClick={handleReturnToQueue}
              >
                Return to queue
              </button>
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
                {handoverLoading ? (
                  <p className={c.hint}>Validating patient age…</p>
                ) : (
                  <PediatricAssessmentForm
                    form={form}
                    fieldErrors={fieldErrors}
                    patientAge={eligibility?.age}
                    isFinalized={!!handover?.assessment?.is_finalized}
                    onFieldChange={(key, value) => {
                      setForm((prev) => ({ ...prev, [key]: value }));
                      setFieldErrors((prev) => {
                        if (!prev[key]) return prev;
                        const next = { ...prev };
                        delete next[key];
                        return next;
                      });
                    }}
                    onSubmit={handleSubmit}
                    actionLoading={actionLoading}
                  />
                )}
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
        {' '}| Pediatric Corner
      </footer>
    </div>
  );
}
