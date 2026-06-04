import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { confirmAction, confirmReturnToQueue, confirmStartPatientSession } from '../../utils/confirmAction';
import { startQueueEntry, releaseQueueEntry } from '../../api/queue';
import { getHivTesterHandover, submitHivTestResult } from '../../api/hivArt';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import { sortQueueEmergencyFirst } from '../../utils/queueDisplay';
import { nurse as c } from '../nurse/styles/nurseClasses';
import ClinicalHandoverPanel from './components/ClinicalHandoverPanel';
import HivTestResultForm from './components/HivTestResultForm';
import HivTesterTopbar from './components/HivTesterTopbar';
import {
  useHivTesterQueue,
  useHivTesterSession,
  pickAutoResumeEntry,
} from './hooks/useHivTesterQueue';

const KOPANO = 'https://kopanovertex.com/';

const emptyForm = { result: '', notes: '', sendToPrepSuite: false };

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

export default function HivTesterPage() {
  const { nurseLabel, initials, userId } = useHivTesterSession();
  const [queueSearch, setQueueSearch] = useState('');
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [form, setForm] = useState(emptyForm);
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

  const { queue, setQueue, loading, error: queueLoadError, live, refresh } = useHivTesterQueue({
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
      return undefined;
    }
    let cancelled = false;
    setHandoverLoading(true);
    getHivTesterHandover(activePatient.visitId)
      .then((data) => { if (!cancelled) setHandover(data); })
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
    try {
      if (patient.status === 'pending') {
        await startQueueEntry(patient.entryId);
        await refresh();
        setForm(emptyForm);
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
    if (!activePatient || !form.result || actionLoading) return;
    const routeToPrep = form.result === 'negative' && form.sendToPrepSuite;

    const confirmMessage =
      form.result === 'positive'
        ? `Confirm POSITIVE result for ${activePatient.name}? Patient will be escalated to ART.`
        : routeToPrep
          ? `Confirm NEGATIVE result for ${activePatient.name}? Patient will be sent to the PrEP Suite.`
          : `Confirm NEGATIVE result for ${activePatient.name}?`;

    const confirmed = await confirmAction({
      title: 'Confirm test result?',
      text: confirmMessage,
      icon: 'warning',
      confirmButtonText: 'Confirm result',
    });
    if (!confirmed) return;

    setActionLoading(true);
    setSubmitError('');
    try {
      const completedEntryId = activePatient.entryId;
      skipAutoResumeRef.current = true;
      setActiveEntryId(null);
      setForm(emptyForm);
      setHandover(null);

      const res = await submitHivTestResult({
        visit_id: activePatient.visitId,
        queue_entry_id: activePatient.entryId,
        result: form.result,
        notes: form.notes,
        route_to_prep: form.result === 'negative' ? routeToPrep : undefined,
      });

      setQueue((prev) => prev.filter((p) => p.entryId !== completedEntryId));
      setToast(
        form.result === 'positive'
          ? `${activePatient.name} escalated to ART queue`
          : routeToPrep
            ? `${activePatient.name} — negative result saved · routed to PrEP Suite`
            : `${activePatient.name} — negative result saved`
      );
      await refresh();
      void res;
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit test result');
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
      setForm(emptyForm);
      setHandover(null);
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
      <HivTesterTopbar nurseLabel={nurseLabel} initials={initials} live={live} />
      {toast ? <div className={c.toast} role="status">{toast}</div> : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="HIV testing queue">
          <h2 className={c.queueTitle}>HIV Testing Room</h2>
          {workspaceActive ? (
            <p className={c.queueSub}>One patient at a time — record result or return to queue</p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{queue.length}</span> patient{queue.length === 1 ? '' : 's'} waiting
            </p>
          )}

          {workspaceActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="In progress"
              title="Active testing session"
              message="Record the HIV test result to complete this session."
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
                  <p className={c.hint}>No patients in the HIV testing queue.</p>
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
                Patients routed from Screening Nurse appear here. Select a patient to review handover and record the test result.
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
                <ClinicalHandoverPanel handover={handover} loading={handoverLoading} />
                {handover?.existingTest ? (
                  <p className={`${c.hint} mt-4 text-amber-700`} role="status">
                    Test already recorded for this visit ({handover.existingTest.result}).
                  </p>
                ) : (
                  <HivTestResultForm
                    form={form}
                    onFieldChange={(k, v) => setForm((prev) => ({ ...prev, [k]: v }))}
                    onSubmit={handleSubmit}
                    actionLoading={actionLoading}
                    submitError={submitError}
                  />
                )}
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
        {' '}| HIV Testing Room
      </footer>
    </div>
  );
}
