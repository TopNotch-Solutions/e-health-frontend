import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { confirmAction, confirmReturnToQueue, confirmStartPatientSession } from '../../utils/confirmAction';
import { startQueueEntry, releaseQueueEntry } from '../../api/queue';
import {
  getSocialWorkerHandover,
  completeSocialWorkerSession,
  escalateSocialWorkerToBookingRoom,
} from '../../api/socialWorkerSuite';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import QueueEntryCard from '../../components/queue/QueueEntryCard';
import { sortQueueEmergencyFirst } from '../../utils/queueDisplay';
import { nurse as c } from '../nurse/styles/nurseClasses';
import SocialWorkerSuiteTopbar from './components/SocialWorkerSuiteTopbar';
import SocialWorkerHandoverPanel from './components/SocialWorkerHandoverPanel';
import SocialWorkerAssessmentForm from './components/SocialWorkerAssessmentForm';
import {
  emptyAssessmentForm,
  severityForApi,
  validateAssessmentForm,
} from './socialWorkerSuiteForm';
import {
  useSocialWorkerQueue,
  useSocialWorkerSession,
  pickAutoResumeEntry,
} from './hooks/useSocialWorkerQueue';

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

export default function SocialWorkerSuitePage() {
  const { label, initials, userId } = useSocialWorkerSession();
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

  const { queue, setQueue, loading, error: queueLoadError, live, refresh } = useSocialWorkerQueue({
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
      setForm(emptyAssessmentForm());
      return undefined;
    }
    let cancelled = false;
    setHandoverLoading(true);
    getSocialWorkerHandover(activePatient.visitId)
      .then((data) => {
        if (cancelled) return;
        setHandover(data);
        setForm(emptyAssessmentForm(data?.assessment));
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

  function buildPayload() {
    return {
      visit_id: activePatient.visitId,
      queue_entry_id: activePatient.entryId,
      social_assessment_details: form.social_assessment_details,
      case_history: form.case_history,
      clinical_notes: form.clinical_notes,
      severity: severityForApi(form),
    };
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
    if (!activePatient || actionLoading) return;
    const errors = validateAssessmentForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const isSevere = form.isSevere;
    const confirmMessage = isSevere
      ? `Save and escalate ${activePatient.name} to the Booking Room?`
      : `Save assessment for ${activePatient.name} and complete this visit?`;

    const confirmed = await confirmAction({
      title: isSevere ? 'Escalate to Booking Room?' : 'Complete visit?',
      text: confirmMessage,
      icon: 'question',
      confirmButtonText: isSevere ? 'Save & escalate' : 'Save & complete',
    });
    if (!confirmed) return;

    setActionLoading(true);
    setSubmitError('');
    try {
      if (isSevere) {
        await escalateSocialWorkerToBookingRoom(buildPayload());
        setToast(`${activePatient.name} escalated to Booking Room`);
      } else {
        await completeSocialWorkerSession(buildPayload());
        setToast(`${activePatient.name} — assessment saved`);
      }
      handleSessionDone();
    } catch (err) {
      setSubmitError(err.message || 'Failed to save assessment');
    } finally {
      setActionLoading(false);
    }
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
      <SocialWorkerSuiteTopbar label={label} initials={initials} live={live} />
      {toast ? <div className={c.toast} role="status">{toast}</div> : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="Social Worker suite queue">
          <h2 className={c.queueTitle}>Social Worker Suite</h2>
          {workspaceActive ? (
            <p className={c.queueSub}>One patient at a time — document and classify severity</p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{queue.length}</span> patient{queue.length === 1 ? '' : 's'} waiting
            </p>
          )}

          {workspaceActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="In progress"
              title="Active counseling session"
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
                  <p className={c.hint}>No patients in the Social Worker suite queue.</p>
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
                      onClick={() => handleSelectPatient(p)}
                    />
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
                Patients routed directly from Front Office appear here. Record psychosocial
                documentation, then save once — escalate to the Booking Room only if marked severe.
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
                <SocialWorkerHandoverPanel handover={handover} loading={handoverLoading} />
                <SocialWorkerAssessmentForm
                  form={form}
                  fieldErrors={fieldErrors}
                  isFinalized={!!handover?.assessment?.is_finalized}
                  onFieldChange={(k, v) => {
                    setForm((prev) => ({ ...prev, [k]: v }));
                    setFieldErrors((prev) => {
                      if (!prev[k]) return prev;
                      const next = { ...prev };
                      delete next[k];
                      return next;
                    });
                  }}
                  onSubmit={handleSubmit}
                  actionLoading={actionLoading}
                  submitError={submitError}
                />
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
        {' '}| Social Worker Suite
      </footer>
    </div>
  );
}
