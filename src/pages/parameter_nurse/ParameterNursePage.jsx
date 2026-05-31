import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { startQueueEntry, releaseQueueEntry } from '../../api/queue';
import { recordParameterNurseVitalsAndPush } from '../../api/vitals';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import { sortQueueEmergencyFirst } from '../../utils/queueDisplay';
import { nurse as c } from '../nurse/styles/nurseClasses';
import ParameterNurseTopbar from './components/ParameterNurseTopbar';
import ParameterNurseVitalsForm from './components/ParameterNurseVitalsForm';
import {
  useParameterNurseQueue,
  useParameterNurseSession,
  pickAutoResumeEntry,
} from './hooks/useParameterNurseQueue';
import {
  emptyParameterForm,
  validateParameterForm,
  buildParameterPayload,
  routingButtonLabel,
  isParameterFormComplete,
  PARAMETER_NURSE_CLASSIFICATIONS,
} from './parameterNurseForm';

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

export default function ParameterNursePage() {
  const { nurseLabel, initials, userId } = useParameterNurseSession();
  const [queueSearch, setQueueSearch] = useState('');
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [form, setForm] = useState(emptyParameterForm);
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
      if (mine) setActiveEntryId((prev) => prev || mine.entryId);
    },
    [userId]
  );

  const { queue, setQueue, loading, error: queueLoadError, live, refresh } = useParameterNurseQueue({
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

  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    const list = q
      ? queue.filter(
        (p) =>
          p.name.toLowerCase().includes(q)
          || p.patientIdLabel.toLowerCase().includes(q)
          || p.patient?.patient_number?.toLowerCase().includes(q)
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

    setActionLoading(true);
    setQueueActionError('');
    try {
      if (patient.status === 'pending') {
        await startQueueEntry(patient.entryId);
        await refresh();
        setForm(emptyParameterForm());
        setFieldErrors({});
        setSubmitError('');
      }
      setActiveEntryId(patient.entryId);
    } catch (err) {
      setQueueActionError(err.message || 'Could not open patient');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSubmit() {
    if (!activePatient || actionLoading) return;

    const validation = validateParameterForm(form);
    if (Object.keys(validation).length > 0) {
      setFieldErrors(validation);
      setSubmitError('');
      return;
    }

    setActionLoading(true);
    setSubmitError('');
    setFieldErrors({});
    try {
      const body = buildParameterPayload(form, {
        visitId: activePatient.visitId,
        queueEntryId: activePatient.entryId,
      });
      const destLabel = PARAMETER_NURSE_CLASSIFICATIONS[form.visit_classification].destinations
        .find((d) => d.value === form.routing_destination)?.label;

      const completedEntryId = activePatient.entryId;
      skipAutoResumeRef.current = true;
      setActiveEntryId(null);
      setForm(emptyParameterForm());

      await recordParameterNurseVitalsAndPush(body);

      setQueue((prev) => prev.filter((p) => p.entryId !== completedEntryId));
      setToast(`${activePatient.name} routed to ${destLabel || form.routing_destination}`);
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit vitals');
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

  function handleClassificationChange(value) {
    setForm({
      ...emptyParameterForm(),
      visit_classification: value,
    });
    setFieldErrors({});
    setSubmitError('');
  }

  async function handleReturnToQueue() {
    if (!activePatient || actionLoading) return;
    if (!window.confirm(`Return ${activePatient.name} to the waiting queue? Unsaved vitals will be discarded.`)) {
      return;
    }

    setActionLoading(true);
    setSubmitError('');
    try {
      skipAutoResumeRef.current = true;
      await releaseQueueEntry(activePatient.entryId);
      setActiveEntryId(null);
      setForm(emptyParameterForm());
      setFieldErrors({});
      setToast(`${activePatient.name} returned to queue`);
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Could not return patient to queue');
    } finally {
      setActionLoading(false);
    }
  }

  function renderBadge(patient) {
    if (patient.isEmergency) {
      return <span className={c.badgeEmergency}>Emergency</span>;
    }
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

  const submitLabel = routingButtonLabel(form, actionLoading);
  const canSubmit = isParameterFormComplete(form);

  return (
    <div className={c.page}>
      <ParameterNurseTopbar nurseLabel={nurseLabel} initials={initials} live={live} />

      {toast ? (
        <div className={c.toast} role="status">{toast}</div>
      ) : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="Parameter nurse triage queue">
          <h2 className={c.queueTitle}>Triage queue</h2>
          {workspaceActive ? (
            <p className={c.queueSub}>One patient at a time — finish current session first</p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{queue.length}</span> patient{queue.length === 1 ? '' : 's'} waiting
            </p>
          )}

          {workspaceActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="In progress"
              title="Active triage session"
              message="Complete vitals and route, or return the patient to the waiting queue."
            />
          ) : (
            <>
              <div className={c.searchWrap}>
                <label htmlFor="pn-queue-search" className="sr-only">Search queue</label>
                <input
                  id="pn-queue-search"
                  type="search"
                  className={c.searchInput}
                  placeholder="Search by name or patient ID…"
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  autoComplete="off"
                />
              </div>
              {queueLoadError ? (
                <p className={`${c.hint} text-red-600`} role="alert">{queueLoadError}</p>
              ) : null}
              {queueActionError ? (
                <p className={`${c.hint} mt-1 text-red-600`} role="alert">{queueActionError}</p>
              ) : null}
              <div className={c.queueList}>
                {loading ? (
                  <p className={c.hint}>Loading queue…</p>
                ) : filteredQueue.length === 0 ? (
                  <p className={c.hint}>
                    {queueSearch.trim() ? 'No patients match your search.' : 'No patients in the triage queue.'}
                  </p>
                ) : (
                  filteredQueue.map((p) => (
                    <article
                      key={p.entryId}
                      role="button"
                      tabIndex={isLockedToOther(p) ? -1 : 0}
                      className={`${c.queueCard} cursor-pointer ${
                        p.entryId === activeEntryId ? c.queueCardActive : ''
                      } ${isLockedToOther(p) ? `${c.queueCardLocked} cursor-not-allowed` : ''} ${
                        p.isEmergency ? c.queueCardEmergency : ''
                      }`}
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
                      {isLockedToOther(p) ? (
                        <p className="mt-2 text-xs font-semibold text-slate-500">Locked by another nurse</p>
                      ) : (
                        <p className="mt-2 text-xs font-semibold text-teal-700">
                          {p.entryId === activeEntryId ? 'Selected — detail view open' : 'Click to open'}
                        </p>
                      )}
                    </article>
                  ))
                )}
              </div>
            </>
          )}
        </aside>

        <div className={c.main}>
          {!workspaceActive ? (
            <div className={c.idle} role="region" aria-label="Triage workspace">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No patient selected</h3>
              <p className={c.idleText}>
                Select a patient from the triage queue on the left. Only one patient can be processed at a time.
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
                <ParameterNurseVitalsForm
                  form={form}
                  fieldErrors={fieldErrors}
                  onFieldChange={handleFieldChange}
                  onClassificationChange={handleClassificationChange}
                />

                <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:flex-wrap sm:items-center">
                  <button
                    type="button"
                    className={c.btnSecondary}
                    disabled={actionLoading}
                    onClick={handleReturnToQueue}
                  >
                    {actionLoading ? 'Working…' : 'Return to queue'}
                  </button>
                  {canSubmit ? (
                    <button
                      type="button"
                      className={`${c.btnComplete} sm:mt-0 sm:min-w-[260px]`}
                      disabled={actionLoading}
                      onClick={handleSubmit}
                    >
                      {submitLabel}
                    </button>
                  ) : (
                    <p className={`${c.hint} sm:ml-2`}>
                      Complete all required fields above to submit and route.
                    </p>
                  )}
                </div>
                {submitError ? (
                  <p className={c.submitError} role="alert">{submitError}</p>
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
        | Parameter Nurse module
      </footer>
    </div>
  );
}
