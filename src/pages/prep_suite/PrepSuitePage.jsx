import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { confirmAction, confirmReturnToQueue, confirmStartPatientSession } from '../../utils/confirmAction';
import { startQueueEntry, releaseQueueEntry } from '../../api/queue';
import {
  getPrepSuiteHandover,
  recordPrepInjection,
  completePrepSession,
} from '../../api/prepSuite';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import { sortQueueEmergencyFirst } from '../../utils/queueDisplay';
import { nurse as c } from '../nurse/styles/nurseClasses';
import PrepHandoverPanel from './components/PrepHandoverPanel';
import PrepInjectionForm from './components/PrepInjectionForm';
import PrepSuiteTopbar from './components/PrepSuiteTopbar';
import { DEFAULT_MEDICATION } from './prepSuiteForm';
import {
  usePrepSuiteQueue,
  usePrepSuiteSession,
  pickAutoResumeEntry,
} from './hooks/usePrepSuiteQueue';

const KOPANO = 'https://kopanovertex.com/';

const emptyForm = {
  medication: DEFAULT_MEDICATION,
  injection_site: 'gluteal',
  lot_number: '',
  notes: '',
  counseling_notes: '',
  confirmInjection: false,
};

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

export default function PrepSuitePage() {
  const { nurseLabel, initials, userId } = usePrepSuiteSession();
  const [queueSearch, setQueueSearch] = useState('');
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [handover, setHandover] = useState(null);
  const [injectionRecorded, setInjectionRecorded] = useState(false);
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

  const { queue, setQueue, loading, error: queueLoadError, live, refresh } = usePrepSuiteQueue({
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
      setInjectionRecorded(false);
      return undefined;
    }
    let cancelled = false;
    setHandoverLoading(true);
    getPrepSuiteHandover(activePatient.visitId)
      .then((data) => {
        if (cancelled) return;
        setHandover(data);
        const recorded = !!data?.episode?.injection_administered;
        setInjectionRecorded(recorded);
        if (recorded && data?.episode?.session_data?.injection) {
          const inj = data.episode.session_data.injection;
          setForm((prev) => ({
            ...prev,
            medication: inj.medication || prev.medication,
            injection_site: inj.injection_site || prev.injection_site,
            lot_number: inj.lot_number || '',
            notes: inj.notes || '',
            counseling_notes: data.episode.session_data.counseling_notes || '',
            confirmInjection: true,
          }));
        } else {
          setForm(emptyForm);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHandover(null);
          setInjectionRecorded(false);
        }
      })
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
        setInjectionRecorded(false);
        setSubmitError('');
      }
      setActiveEntryId(patient.entryId);
    } catch (err) {
      setQueueActionError(err.message || 'Could not open patient');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRecordInjection() {
    if (!activePatient || !form.confirmInjection || actionLoading || injectionRecorded) return;
    if (!(await confirmAction({
      title: 'Confirm injection?',
      text: `Confirm PrEP injection for ${activePatient.name}? This will be logged in the patient record.`,
      icon: 'question',
      confirmButtonText: 'Confirm injection',
    }))) return;

    setActionLoading(true);
    setSubmitError('');
    try {
      await recordPrepInjection({
        visit_id: activePatient.visitId,
        queue_entry_id: activePatient.entryId,
        medication: form.medication,
        injection_site: form.injection_site,
        lot_number: form.lot_number,
        notes: form.notes,
        counseling_notes: form.counseling_notes,
      });
      setInjectionRecorded(true);
      setToast(`PrEP injection logged for ${activePatient.name}`);
      const data = await getPrepSuiteHandover(activePatient.visitId);
      setHandover(data);
    } catch (err) {
      setSubmitError(err.message || 'Failed to record injection');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFinalize() {
    if (!activePatient || !injectionRecorded || actionLoading) return;
    if (!(await confirmAction({
      title: 'Finalize session?',
      text: `Finalize PrEP session for ${activePatient.name}? This saves the clinical session and ends the active consultation.`,
      icon: 'question',
      confirmButtonText: 'Finalize session',
    }))) return;

    setActionLoading(true);
    setSubmitError('');
    try {
      const completedEntryId = activePatient.entryId;
      skipAutoResumeRef.current = true;
      setActiveEntryId(null);
      setForm(emptyForm);
      setHandover(null);
      setInjectionRecorded(false);

      await completePrepSession({
        visit_id: activePatient.visitId,
        queue_entry_id: activePatient.entryId,
      });

      setQueue((prev) => prev.filter((p) => p.entryId !== completedEntryId));
      setToast(`${activePatient.name} — PrEP session finalized · consultation ended`);
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Failed to finalize session');
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
      setInjectionRecorded(false);
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
      <PrepSuiteTopbar nurseLabel={nurseLabel} initials={initials} live={live} />
      {toast ? <div className={c.toast} role="status">{toast}</div> : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="PrEP suite queue">
          <h2 className={c.queueTitle}>PrEP Suite</h2>
          {workspaceActive ? (
            <p className={c.queueSub}>One patient at a time — administer PrEP then finalize</p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{queue.length}</span> patient{queue.length === 1 ? '' : 's'} waiting
            </p>
          )}

          {workspaceActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="In progress"
              title="Active PrEP session"
              message="Record the injection, then finalize to end the consultation."
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
                  <p className={c.hint}>No patients in the PrEP suite queue.</p>
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
                Patients with a confirmed HIV negative result are routed here from the HIV Testing Room.
                Select a patient to review handover, administer PrEP, and finalize the session.
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
                <PrepHandoverPanel handover={handover} loading={handoverLoading} />
                <PrepInjectionForm
                  form={form}
                  onFieldChange={(k, v) => setForm((prev) => ({ ...prev, [k]: v }))}
                  onRecordInjection={handleRecordInjection}
                  onFinalize={handleFinalize}
                  injectionRecorded={injectionRecorded}
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
        {' '}| PrEP Suite
      </footer>
    </div>
  );
}
