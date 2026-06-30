import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { confirmAction, confirmReturnToQueue } from '../../utils/confirmAction';
import { startQueueEntry, releaseQueueEntry } from '../../api/queue';
import { recordVitalsAndPushToDoctor } from '../../api/vitals';
import NurseTopbar from './components/NurseTopbar';
import { useNurseQueue, useNurseSession, pickAutoResumeEntry } from './hooks/useNurseQueue';
import NurseIntakeForm from './components/NurseIntakeForm';
import { emptyIntakeForm, buildIntakePayload, validateIntakeForm } from './nurseIntakeForm';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import QueueEntryCard from '../../components/queue/QueueEntryCard';
import { sortQueueEmergencyFirst } from '../../utils/queueDisplay';
import { nurse as c } from './styles/nurseClasses';

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

export default function NurseIntakePage() {
  const { nurseLabel, initials, userId } = useNurseSession();
  const [queueSearch, setQueueSearch] = useState('');
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [form, setForm] = useState(emptyIntakeForm);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
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
      if (mine) {
        setActiveEntryId((prev) => prev || mine.entryId);
      }
    },
    [userId]
  );

  const { queue, setQueue, loading, error: queueLoadError, live, refresh } = useNurseQueue({
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

  async function handleStartVitals(patient) {
    if (isLockedToOther(patient) || actionLoading) return;

    setActionLoading(true);
    setQueueActionError('');
    try {
      if (patient.status === 'pending') {
        await startQueueEntry(patient.entryId);
        await refresh();
        setForm(emptyIntakeForm());
        setFieldErrors({});
        setSubmitError('');
      }
      setActiveEntryId(patient.entryId);
    } catch (err) {
      setQueueActionError(err.message || 'Could not start vitals');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleComplete() {
    if (!activePatient || actionLoading) return;

    const validation = validateIntakeForm(form);
    if (Object.keys(validation).length > 0) {
      setFieldErrors(validation);
      setSubmitError('');
      const fieldToId = {
        blood_pressure_systolic: 'nr-bp-sys',
        blood_pressure_diastolic: 'nr-bp-dia',
        pulse_rate: 'nr-hr',
        temperature: 'nr-temp',
        weight: 'nr-weight',
        respiratory_rate: 'nr-rr',
        chief_complaint: 'nr-chief',
        onset_date: 'nr-onset-date',
        onset_time: 'nr-onset-time',
        aggravating_factors: 'nr-aggravating',
        alleviating_factors: 'nr-alleviating',
        current_medications: 'nr-meds',
        immunization_status: 'nr-imm',
        social_history: 'nr-social',
        physical_examination: 'nr-pe',
      };
      const firstKey = Object.keys(validation)[0];
      const el = document.getElementById(fieldToId[firstKey]);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
      return;
    }

    if (!(await confirmAction({
      title: 'Complete intake?',
      text: `Save vitals and send ${activePatient.name} to the doctor queue?`,
      icon: 'question',
      confirmButtonText: 'Complete & send',
    }))) return;

    setActionLoading(true);
    setSubmitError('');
    setFieldErrors({});
    try {
      const body = buildIntakePayload(form, {
        visitId: activePatient.visitId,
        queueEntryId: activePatient.entryId,
      });

      const completedEntryId = activePatient.entryId;
      skipAutoResumeRef.current = true;
      setActiveEntryId(null);
      setForm(emptyIntakeForm());

      await recordVitalsAndPushToDoctor(body);

      setQueue((prev) => prev.filter((p) => p.entryId !== completedEntryId));
      setToast(`${activePatient.name} sent to doctor queue`);
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Failed to complete vitals');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReturnToQueue() {
    if (!activePatient || actionLoading) return;
    if (!(await confirmReturnToQueue(activePatient.name, 'Unsaved vitals will be discarded.'))) {
      return;
    }

    setActionLoading(true);
    setSubmitError('');
    setQueueActionError('');
    try {
      skipAutoResumeRef.current = true;
      await releaseQueueEntry(activePatient.entryId);
      setActiveEntryId(null);
      setForm(emptyIntakeForm());
      setFieldErrors({});
      setToast(`${activePatient.name} returned to queue`);
      await refresh();
    } catch (err) {
      setQueueActionError(err.message || 'Could not return patient to queue');
    } finally {
      setActionLoading(false);
    }
  }

  function handleFieldChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setSubmitError('');
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
      <NurseTopbar nurseLabel={nurseLabel} initials={initials} live={live} />

      {toast ? (
        <div className={c.toast} role="status">
          {toast}
        </div>
      ) : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="Today's patient queue">
          <h2 className={c.queueTitle}>Today&apos;s Patient Queue</h2>
          {workspaceActive ? (
            <p className={c.queueSub}>You have an active vitals session</p>
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
              title="Active vitals session"
              message="Finish and send to the doctor queue, or return to queue to choose another patient."
              // patientName={activePatient.name}
              // patientMeta={activePatient.sexAge}
              // patientIdLabel={activePatient.patientIdLabel}
            />
          ) : (
            <>
          <div className={c.searchWrap}>
            <label htmlFor="nr-queue-search" className="sr-only">
              Search queue
            </label>
            <input
              id="nr-queue-search"
              type="search"
              className={c.searchInput}
              placeholder="Search by name or patient ID…"
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
                  : 'No patients waiting for vitals.'}
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
                  onClick={() => handleStartVitals(p)}
                  openLabel="Start vitals"
                />
              ))
            )}
          </div>
            </>
          )}
        </aside>

        <div className={c.main}>
          {!workspaceActive ? (
            <div className={c.idle} role="region" aria-label="Vitals workspace">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No patient selected</h3>
              <p className={c.idleText}>
                Please select a patient from the queue on the left and click &lsquo;Start Vitals&rsquo;
                to begin capturing data.
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
                <div>
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

              <div className={c.formScroll}>
                <NurseIntakeForm
                  form={form}
                  fieldErrors={fieldErrors}
                  onFieldChange={handleFieldChange}
                />

                <button
                  type="button"
                  className={c.btnComplete}
                  disabled={actionLoading}
                  onClick={handleComplete}
                >
                  {actionLoading ? 'Saving…' : "Complete & Send to Doctor's Queue"}
                </button>
                {submitError ? (
                  <p className={c.submitError} role="alert">
                    {submitError}
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
        | Nurse module
      </footer>
    </div>
  );
}
