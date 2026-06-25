import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { confirmAction, confirmReturnToQueue, confirmStartPatientSession } from '../../utils/confirmAction';
import { startQueueEntry, releaseQueueEntry, completeQueueEntry } from '../../api/queue';
import {
  getBookingRoomHandover,
  completeBookingRoomDisposition,
  getStateHospitalFacilities,
} from '../../api/bookingRoom';
import {
  confirmClinicDeparture,
  initiateClinicHospitalTransport,
} from '../../api/clinicHospitalTransfer';
import QueueEntryCard from '../../components/queue/QueueEntryCard';
import { getSocket, requestDepartmentQueueRefresh } from '../../api/socket';
import { sortQueueEmergencyFirst } from '../../utils/queueDisplay';
import { nurse as c } from '../nurse/styles/nurseClasses';
import BookingRoomTopbar from './components/BookingRoomTopbar';
import BookingRoomWorkspace from './components/BookingRoomWorkspace';
import { emptyBookingForm, getBookingSubmitMode, resolveBookingTransferReason } from './bookingRoomForm';
import {
  useBookingRoomQueue,
  useBookingRoomSession,
  pickAutoResumeEntry,
  pickBookingRoomActiveEntries,
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

function BookingRoomActiveTabs({ patients, activeEntryId, onSelect, userId }) {
  if (!patients.length) return null;
  return (
    <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50/50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-teal-800">
        Active transports ({patients.length})
      </p>
      <p className="mt-0.5 text-xs text-teal-900/80">
        Shared queue — any operator can continue the next step.
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5" role="tablist" aria-label="Active transports">
        {patients.map((p) => {
          const active = p.entryId === activeEntryId;
          return (
            <button
              key={p.entryId}
              type="button"
              role="tab"
              aria-selected={active}
              className={`max-w-full truncate rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                active
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'border border-teal-300 bg-white text-teal-900 hover:bg-teal-100'
              }`}
              onClick={() => onSelect(p)}
            >
              {p.name}
              {p.assignedToId && p.assignedToId !== userId && p.assignedToName ? (
                <span className="ml-1 font-normal opacity-80">· {p.assignedToName}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
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
  const draftsRef = useRef({});
  const activeEntryIdRef = useRef(activeEntryId);
  activeEntryIdRef.current = activeEntryId;

  const persistCurrentDraft = useCallback(() => {
    const entryId = activeEntryIdRef.current;
    if (!entryId) return;
    draftsRef.current[entryId] = { form, submitError };
  }, [form, submitError]);

  const restoreDraft = useCallback((entryId) => {
    const saved = draftsRef.current[entryId];
    setForm(saved?.form ?? emptyBookingForm());
    setSubmitError(saved?.submitError || '');
    setHandover(null);
    return Boolean(saved);
  }, []);

  const switchToEntry = useCallback((entryId) => {
    if (entryId === activeEntryIdRef.current) return;
    persistCurrentDraft();
    setActiveEntryId(entryId);
    restoreDraft(entryId);
  }, [persistCurrentDraft, restoreDraft]);

  const onQueueSynced = useCallback(
    (mapped) => {
      if (skipAutoResumeRef.current) {
        skipAutoResumeRef.current = false;
        return;
      }
      const current = activeEntryIdRef.current;
      if (current && mapped.some((p) => p.entryId === current)) return;
      const next = pickAutoResumeEntry(mapped);
      if (next) setActiveEntryId(next.entryId);
    },
    []
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
    if (!activeEntryId) return;
    const still = queue.find(
      (p) => p.entryId === activeEntryId && p.status === 'in_progress'
    );
    if (!still) {
      delete draftsRef.current[activeEntryId];
      const active = pickBookingRoomActiveEntries(queue);
      if (active.length) {
        switchToEntry(active[0].entryId);
      } else {
        setActiveEntryId(null);
        setHandover(null);
        setForm(emptyBookingForm());
        setSubmitError('');
      }
    }
  }, [queue, activeEntryId, switchToEntry]);

  const activePatient = useMemo(
    () => queue.find((p) => p.entryId === activeEntryId) || null,
    [queue, activeEntryId]
  );

  const activeTransports = useMemo(
    () => pickBookingRoomActiveEntries(queue),
    [queue]
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

    return () => { cancelled = true; };
  }, [activePatient?.entryId, activePatient?.visitId]);

  const reloadHandover = useCallback(async () => {
    if (!activePatient?.visitId) return;
    const data = await getBookingRoomHandover(activePatient.visitId);
    setHandover(data);
  }, [activePatient?.visitId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activePatient?.visitId) return undefined;

    const handleTransferUpdated = (payload) => {
      if (payload?.visitId && payload.visitId !== activePatient.visitId) return;
      reloadHandover();
      requestDepartmentQueueRefresh('booking_room');
    };

    socket.on('transfer:updated', handleTransferUpdated);
    return () => socket.off('transfer:updated', handleTransferUpdated);
  }, [activePatient?.entryId, activePatient?.visitId, reloadHandover]);

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

  const workspaceActive = activePatient?.status === 'in_progress';

  async function handleSelectPatient(patient) {
    if (actionLoading) return;

    if (patient.status === 'in_progress') {
      switchToEntry(patient.entryId);
      return;
    }

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
      switchToEntry(patient.entryId);
    } catch (err) {
      setQueueActionError(err.message || 'Could not open patient');
    } finally {
      setActionLoading(false);
    }
  }

  function handleFormChange(updates) {
    setForm((prev) => {
      const next = { ...prev, ...updates };
      if (activeEntryId) {
        draftsRef.current[activeEntryId] = {
          ...draftsRef.current[activeEntryId],
          form: next,
          submitError,
        };
      }
      return next;
    });
    setSubmitError('');
  }

  async function closeCompletedSession(message, completedEntryId) {
    skipAutoResumeRef.current = true;
    delete draftsRef.current[completedEntryId];
    setToast(message);
    const mapped = await refresh();
    const active = pickBookingRoomActiveEntries(mapped);
    if (active.length) {
      switchToEntry(active[0].entryId);
    } else {
      setActiveEntryId(null);
      setHandover(null);
      setForm(emptyBookingForm());
      setSubmitError('');
    }
  }

  async function handleSubmit() {
    if (!activePatient || actionLoading) return;

    const mode = getBookingSubmitMode(handover, form);
    if (!mode) return;

    const transferPlan = handover?.transferPlan;
    let confirmTitle = 'Submit booking room action?';
    let confirmText = `Continue for ${activePatient.name}?`;
    let confirmButtonText = 'Submit';

    if (mode === 'initiate_transport') {
      confirmTitle = 'Initiate transport?';
      confirmText = `Dispatch porters to transfer ${activePatient.name} to the selected state hospital?`;
      confirmButtonText = 'Initiate transport';
    } else if (mode === 'confirm_departure') {
      confirmTitle = 'Confirm departure?';
      confirmText = `Confirm that ${activePatient.name} has left the clinic with the external porter?`;
      confirmButtonText = 'Confirm departure';
    } else if (mode === 'complete_session') {
      confirmTitle = 'Complete booking session?';
      confirmText = `Mark booking room processing complete for ${activePatient.name}?`;
      confirmButtonText = 'Complete';
    } else if (mode === 'mortuary') {
      confirmTitle = 'Process to mortuary?';
      confirmText = `Process ${activePatient.name} to the mortuary?`;
      confirmButtonText = 'Process';
    } else if (mode === 'legacy_hospital') {
      confirmTitle = 'Transfer to state hospital?';
      confirmText = `Transfer ${activePatient.name} to the selected state hospital?`;
      confirmButtonText = 'Transfer';
    }

    const confirmed = await confirmAction({
      title: confirmTitle,
      text: confirmText,
      icon: 'warning',
      confirmButtonText,
    });
    if (!confirmed) return;

    setActionLoading(true);
    setSubmitError('');
    try {
      if (mode === 'initiate_transport') {
        await initiateClinicHospitalTransport({
          visit_id: activePatient.visitId,
          transfer_id: transferPlan.id,
          hospital_facility_id: form.destination_facility_id,
          reason: resolveBookingTransferReason(handover) || transferPlan.transfer_reason,
        });
        setToast(`Transport initiated for ${activePatient.name}`);
        await reloadHandover();
        return;
      }

      const completedEntryId = activePatient.entryId;

      if (mode === 'confirm_departure') {
        await confirmClinicDeparture({ transfer_id: transferPlan.id });
        await completeQueueEntry(completedEntryId, {
          notes: 'Booking room — patient departed clinic for state hospital',
        });
        await closeCompletedSession(`${activePatient.name} departed clinic — porters notified`, completedEntryId);
        return;
      }

      if (mode === 'complete_session') {
        await completeQueueEntry(completedEntryId, {
          notes: 'Booking room — hospital transfer in progress',
        });
        await closeCompletedSession(`${activePatient.name} — booking session complete`, completedEntryId);
        return;
      }

      await completeBookingRoomDisposition({
        visit_id: activePatient.visitId,
        queue_entry_id: completedEntryId,
        disposition: form.disposition,
        destination_facility_id: form.destination_facility_id,
        reason: resolveBookingTransferReason(handover) || undefined,
        notes: form.notes,
        cause_of_death: form.cause_of_death,
        date_of_death: form.date_of_death,
      });

      await closeCompletedSession(
        form.disposition === 'mortuary'
          ? `${activePatient.name} processed to Mortuary`
          : `${activePatient.name} referred to state hospital`,
        completedEntryId
      );
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit');
      if (activeEntryId) {
        draftsRef.current[activeEntryId] = { form, submitError: err.message || 'Failed to submit' };
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReturnToQueue() {
    if (!activePatient || actionLoading) return;
    if (!(await confirmReturnToQueue(activePatient.name, 'This patient will return to the waiting queue. You can pick up another active patient from the list.'))) {
      return;
    }

    setActionLoading(true);
    setSubmitError('');
    try {
      skipAutoResumeRef.current = true;
      const releasedId = activePatient.entryId;
      await releaseQueueEntry(releasedId);
      delete draftsRef.current[releasedId];
      setToast(`${activePatient.name} returned to queue`);

      const mapped = await refresh();
      const active = pickBookingRoomActiveEntries(mapped);
      if (active.length) {
        switchToEntry(active[0].entryId);
      } else {
        setActiveEntryId(null);
        setHandover(null);
        setForm(emptyBookingForm());
      }
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
      const starter = patient.assignedToId === userId
        ? 'you'
        : patient.assignedToName || 'team';
      return (
        <span className={c.badgeProgress}>
          In progress
          <span className={c.lockTag}> · {starter}</span>
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
          <p className={c.queueSub}>
            {activeTransports.length > 0 ? (
              <>
                <span className={c.queueCount}>{activeTransports.length}</span>
                {' '}in progress · <span className={c.queueCount}>{queue.length}</span> in queue
              </>
            ) : (
              <>
                <span className={c.queueCount}>{queue.length}</span>
                {' '}patient{queue.length === 1 ? '' : 's'} — shared booking room queue
              </>
            )}
          </p>

          <BookingRoomActiveTabs
            patients={activeTransports}
            activeEntryId={activeEntryId}
            onSelect={handleSelectPatient}
            userId={userId}
          />

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
              ))
            )}
          </div>
        </aside>

        <div className={c.main}>
          {!workspaceActive ? (
            <div className={c.idle} role="region" aria-label="Booking room workspace">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No patient selected</h3>
              <p className={c.idleText}>
                Select a patient from the queue. Any booking room operator can initiate transport
                or confirm departure — each step is tracked on the transfer record.
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

              {activeTransports.length > 1 ? (
                <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-2 sm:px-6">
                  <BookingRoomActiveTabs
                    patients={activeTransports}
                    activeEntryId={activeEntryId}
                    onSelect={handleSelectPatient}
                    userId={userId}
                  />
                </div>
              ) : null}

              <div className={c.formScroll}>
                <BookingRoomWorkspace
                  handover={handover}
                  form={form}
                  onFormChange={handleFormChange}
                  stateHospitals={stateHospitals}
                  stateHospitalsLoading={stateHospitalsLoading}
                  stateHospitalsError={stateHospitalsError}
                  actionLoading={actionLoading}
                  onSubmit={handleSubmit}
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
