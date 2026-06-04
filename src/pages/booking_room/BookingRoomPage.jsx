import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { confirmAction, confirmReturnToQueue, confirmStartPatientSession } from '../../utils/confirmAction';
import { startQueueEntry, releaseQueueEntry } from '../../api/queue';
import {
  getBookingRoomHandover,
  completeBookingRoomDisposition,
  getStateHospitalFacilities,
} from '../../api/bookingRoom';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import { sortQueueEmergencyFirst } from '../../utils/queueDisplay';
import { nurse as c } from '../nurse/styles/nurseClasses';
import BookingRoomTopbar from './components/BookingRoomTopbar';
import BookingRoomWorkspace from './components/BookingRoomWorkspace';
import { emptyBookingForm } from './bookingRoomForm';
import {
  useBookingRoomQueue,
  useBookingRoomSession,
  pickAutoResumeEntry,
} from './hooks/useBookingRoomQueue';

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

export default function BookingRoomPage() {
  const { operatorLabel, initials, userId } = useBookingRoomSession();
  const [queueSearch, setQueueSearch] = useState('');
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [handover, setHandover] = useState(null);
  const [form, setForm] = useState(emptyBookingForm);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [queueActionError, setQueueActionError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [stateHospitals, setStateHospitals] = useState([]);
  const [stateHospitalsLoading, setStateHospitalsLoading] = useState(true);
  const [stateHospitalsError, setStateHospitalsError] = useState('');
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

  const { queue, setQueue, loading, error: queueLoadError, live, refresh } = useBookingRoomQueue({
    onQueueSynced,
  });

  useEffect(() => {
    let cancelled = false;
    setStateHospitalsLoading(true);
    getStateHospitalFacilities()
      .then((rows) => {
        if (!cancelled) setStateHospitals(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setStateHospitals([]);
          setStateHospitalsError(err.message || 'Could not load state hospitals');
        }
      })
      .finally(() => {
        if (!cancelled) setStateHospitalsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

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
    getBookingRoomHandover(activePatient.visitId)
      .then((data) => {
        if (cancelled) return;
        setHandover(data);
        if (data?.pathwayRestricted) {
          setForm((prev) => (
            prev.disposition === 'mortuary' ? emptyBookingForm() : prev
          ));
        }
      })
      .catch(() => { if (!cancelled) setHandover(null); });
    setForm(emptyBookingForm());
    setSubmitError('');
    return () => { cancelled = true; };
  }, [activePatient?.visitId]);

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
    } catch (err) {
      setQueueActionError(err.message || 'Could not open patient');
    } finally {
      setActionLoading(false);
    }
  }

  function handleFormChange(updates) {
    setForm((prev) => ({ ...prev, ...updates }));
    setSubmitError('');
  }

  async function handleDisposition() {
    if (!activePatient || !form.disposition || actionLoading) return;
    const confirmMsg = form.disposition === 'mortuary'
      ? `Process ${activePatient.name} to the mortuary?`
      : `Transfer ${activePatient.name} to the selected state hospital?`;
    const confirmed = await confirmAction({
      title: form.disposition === 'mortuary' ? 'Process to mortuary?' : 'Transfer to state hospital?',
      text: confirmMsg,
      icon: 'warning',
      confirmButtonText: form.disposition === 'mortuary' ? 'Process' : 'Transfer',
    });
    if (!confirmed) return;

    setActionLoading(true);
    setSubmitError('');
    try {
      await completeBookingRoomDisposition({
        visit_id: activePatient.visitId,
        queue_entry_id: activePatient.entryId,
        disposition: form.disposition,
        destination_facility_id: form.destination_facility_id,
        reason: form.reason,
        notes: form.notes,
        cause_of_death: form.cause_of_death,
        date_of_death: form.date_of_death,
      });

      skipAutoResumeRef.current = true;
      const completedEntryId = activePatient.entryId;
      setActiveEntryId(null);
      setHandover(null);
      setForm(emptyBookingForm());
      setQueue((prev) => prev.filter((p) => p.entryId !== completedEntryId));
      setToast(
        form.disposition === 'mortuary'
          ? `${activePatient.name} processed to Mortuary`
          : `${activePatient.name} referred to state hospital`
      );
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Failed to complete disposition');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReturnToQueue() {
    if (!activePatient || actionLoading) return;
    if (!(await confirmReturnToQueue(activePatient.name, 'Unsaved work will be discarded.'))) {
      return;
    }

    setActionLoading(true);
    setSubmitError('');
    try {
      skipAutoResumeRef.current = true;
      await releaseQueueEntry(activePatient.entryId);
      setActiveEntryId(null);
      setHandover(null);
      setForm(emptyBookingForm());
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

  return (
    <div className={c.page}>
      <BookingRoomTopbar operatorLabel={operatorLabel} initials={initials} live={live} />

      {toast ? (
        <div className={c.toast} role="status">{toast}</div>
      ) : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label="Booking room queue">
          <h2 className={c.queueTitle}>Booking Room queue</h2>
          {workspaceActive ? (
            <p className={c.queueSub}>One patient at a time — complete final disposition</p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{queue.length}</span> patient{queue.length === 1 ? '' : 's'} waiting
            </p>
          )}

          {workspaceActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="In progress"
              title="Active disposition session"
              message="Transfer to a state hospital or process to the mortuary."
              patientName={activePatient.name}
              patientMeta={activePatient.sexAge}
              patientIdLabel={activePatient.patientIdLabel}
            />
          ) : (
            <>
              <div className={c.searchWrap}>
                <label htmlFor="br-queue-search" className="sr-only">Search queue</label>
                <input
                  id="br-queue-search"
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
                    {queueSearch.trim() ? 'No patients match your search.' : 'No patients in the booking room queue.'}
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
                        <p className="mt-2 text-xs font-semibold text-slate-500">Locked by another operator</p>
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
            <div className={c.idle} role="region" aria-label="Booking room workspace">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No patient selected</h3>
              <p className={c.idleText}>
                Select a patient from the booking room queue to complete administrative disposition — state hospital transfer or mortuary processing.
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
                <BookingRoomWorkspace
                  handover={handover}
                  form={form}
                  onFormChange={handleFormChange}
                  stateHospitals={stateHospitals}
                  stateHospitalsLoading={stateHospitalsLoading}
                  stateHospitalsError={stateHospitalsError}
                  actionLoading={actionLoading}
                  onSubmit={handleDisposition}
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
        | Booking Room module
      </footer>
    </div>
  );
}
