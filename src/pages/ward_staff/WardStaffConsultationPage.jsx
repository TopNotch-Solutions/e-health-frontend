import { useEffect, useMemo, useState } from 'react';
import { confirmAction } from '../../utils/confirmAction';
import { getWardAdmission } from '../../api/ward';
import ActiveSessionQueueAside from '../../components/queue/ActiveSessionQueueAside';
import QueueEntryCard from '../../components/queue/QueueEntryCard';
import ConsultationMedicalHistoryPanel from '../../components/patient/ConsultationMedicalHistoryPanel';
import { layout as c } from '../doctor/styles/doctorLayoutClasses';
import WardStaffTopbar from './components/WardStaffTopbar';
import WardStaffWorkspace from './components/WardStaffWorkspace';
import IcuArrivalWorkspace from './components/IcuArrivalWorkspace';
import IcuPatientWorkspace from './components/IcuPatientWorkspace';
import SurgicalComplexArrivalWorkspace from './components/SurgicalComplexArrivalWorkspace';
import SurgicalComplexPatientWorkspace from './components/SurgicalComplexPatientWorkspace';
import SpecializedInpatientArrivalWorkspace from './components/SpecializedInpatientArrivalWorkspace';
import SpecializedInpatientPatientWorkspace from './components/SpecializedInpatientPatientWorkspace';
import AdultOutpatientArrivalWorkspace from './components/AdultOutpatientArrivalWorkspace';
import AdultOutpatientPatientWorkspace from './components/AdultOutpatientPatientWorkspace';
import { useWardStaffQueue } from './hooks/useWardStaffQueue';
import { useTypedWardDailyQueue } from './hooks/useTypedWardDailyQueue';
import { useWardStaffSession } from './hooks/useWardStaffSession';

const KOPANO = 'https://kopanovertex.com/';

const TYPED_WARD_UI = {
  icu_ward_nurse: {
    inWardTab: 'In ICU',
    dailyQueueTitle: 'Daily ICU queue',
    dailyCountLabel: "patient(s) needing today's daily record",
    dailyEmpty: "All ICU patients have today's daily record saved.",
    dailyBadge: 'Daily due',
    openInWardLabel: 'Open ICU patient',
    wardShort: 'ICU',
  },
  surgical_complex_nurse: {
    inWardTab: 'In surgical complex',
    dailyQueueTitle: 'Daily surgical complex queue',
    dailyCountLabel: "patient(s) needing today's daily record",
    dailyEmpty: "All surgical complex patients have today's daily record saved.",
    dailyBadge: 'Daily due',
    openInWardLabel: 'Open surgical complex patient',
    wardShort: 'surgical complex',
  },
  specialized_inpatient_nurse: {
    inWardTab: 'In specialized inpatient',
    dailyQueueTitle: 'Daily specialized inpatient queue',
    dailyCountLabel: "patient(s) needing today's daily record",
    dailyEmpty: "All specialized inpatient patients have today's daily record saved.",
    dailyBadge: 'Daily due',
    openInWardLabel: 'Open specialized inpatient patient',
    wardShort: 'specialized inpatient',
  },
  adult_outpatient_nurse: {
    inWardTab: 'In adult outpatient',
    dailyQueueTitle: 'Daily adult outpatient queue',
    dailyCountLabel: "patient(s) needing today's daily record",
    dailyEmpty: "All adult outpatient patients have today's daily record saved.",
    dailyBadge: 'Daily due',
    openInWardLabel: 'Open adult outpatient patient',
    wardShort: 'adult outpatient',
  },
};

function QueueEmptyIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden className="text-slate-300">
      <path
        d="M4 20V6a2 2 0 012-2h12a2 2 0 012 2v14M8 20v-6h2v6M14 20v-4h2v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M4 10h16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function priorityBadge(priority) {
  if (priority === 'emergency') {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[0.58rem] font-bold uppercase text-red-800">
        Emergency
      </span>
    );
  }
  if (priority === 'urgent') {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.58rem] font-bold uppercase text-amber-900">
        Urgent
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.58rem] font-bold uppercase text-slate-600">
      Normal
    </span>
  );
}

export default function WardStaffConsultationPage() {
  const { staffLabel, initials, moduleLabel, roleName } = useWardStaffSession();
  const typedWardUi = TYPED_WARD_UI[roleName] || null;
  const isTypedWardNurse = Boolean(typedWardUi);
  const [wardTab, setWardTab] = useState('arrivals');
  const [queueSearch, setQueueSearch] = useState('');
  const [activeAdmissionId, setActiveAdmissionId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [queueActionError, setQueueActionError] = useState('');
  const [workspaceError, setWorkspaceError] = useState('');

  const { queue, loading, error: queueLoadError, live, refresh } = useWardStaffQueue();
  const {
    queue: inWardQueue,
    loading: inWardLoading,
    error: inWardQueueError,
    live: inWardLive,
    refresh: refreshInWard,
  } = useTypedWardDailyQueue(roleName);

  const onInWardTab = isTypedWardNurse && wardTab === 'in_ward';
  const activeQueue = onInWardTab ? inWardQueue : queue;
  const activeLoading = onInWardTab ? inWardLoading : loading;
  const activeQueueError = onInWardTab ? inWardQueueError : queueLoadError;
  const activeLive = onInWardTab ? inWardLive : live;
  const refreshActiveQueue = onInWardTab ? refreshInWard : refresh;

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!activeAdmissionId) {
      setDetail(null);
      setDetailError('');
      return undefined;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError('');
    getWardAdmission(activeAdmissionId)
      .then((row) => {
        if (!cancelled) setDetail(row);
      })
      .catch((err) => {
        if (!cancelled) {
          setDetailError(err.message || 'Failed to load patient');
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeAdmissionId]);

  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    if (!q) return activeQueue;
    return activeQueue.filter((row) => {
      return (
        row.patientName.toLowerCase().includes(q) ||
        String(row.patientNumber).toLowerCase().includes(q) ||
        (row.wardName || '').toLowerCase().includes(q) ||
        (row.wardNumber || '').toLowerCase().includes(q) ||
        String(row.roomNumber).toLowerCase().includes(q)
      );
    });
  }, [activeQueue, queueSearch]);

  const totalCount = activeQueue.length;
  const sessionActive = Boolean(activeAdmissionId);
  const showWorkspace = sessionActive && detail && !detailLoading && !detailError;

  async function handleOpen(row) {
    setQueueActionError('');
    setWorkspaceError('');
    if (activeAdmissionId && activeAdmissionId !== row.id) {
      setQueueActionError('Finish or return from the current patient before opening another.');
      return;
    }
    const name = row.patientName || 'this patient';
    const openLabel = onInWardTab ? typedWardUi.openInWardLabel : 'Open patient';
    if (!(await confirmAction({
      title: 'Open patient?',
      text: `Open ${openLabel.toLowerCase()} details for ${name}?`,
      icon: 'question',
      confirmButtonText: openLabel,
    }))) return;
    setActiveAdmissionId(row.id);
  }

  async function handleReturnToQueue() {
    const name = bannerPatient?.name || 'this patient';
    if (!(await confirmAction({
      title: 'Return to queue?',
      text: `Return ${name} to the waiting queue?`,
      icon: 'question',
      confirmButtonText: 'Return to queue',
    }))) return;
    setActiveAdmissionId(null);
    setDetail(null);
    setWorkspaceError('');
    setDetailError('');
    refreshActiveQueue();
  }

  async function handleDone() {
    const name = bannerPatient?.name || 'this patient';
    if (!(await confirmAction({
      title: 'Close session?',
      text: `Close the session for ${name} and return to the queue?`,
      icon: 'question',
      confirmButtonText: 'Close session',
    }))) return;
    setActiveAdmissionId(null);
    setDetail(null);
    setWorkspaceError('');
    refreshActiveQueue();
  }

  const activeSnapshot = useMemo(() => {
    if (!activeAdmissionId) return null;
    return activeQueue.find((r) => r.id === activeAdmissionId) || null;
  }, [activeQueue, activeAdmissionId]);

  const bannerPatient = useMemo(() => {
    if (activeSnapshot) {
      return {
        name: activeSnapshot.patientName,
        id: activeSnapshot.patientNumber,
      };
    }
    const p = detail?.patient;
    if (!p) return { name: 'Patient', id: '' };
    const name = [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Patient';
    return { name, id: p.patient_number || '' };
  }, [activeSnapshot, detail]);

  return (
    <div className={c.page}>
      <WardStaffTopbar staffLabel={staffLabel} initials={initials} live={activeLive} moduleLabel={moduleLabel} />

      {toast ? (
        <div className={c.toast} role="status">
          {toast}
        </div>
      ) : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label={onInWardTab ? `${typedWardUi.wardShort} patients` : 'Arrival queue'}>
          <h2 className={c.queueTitle}>
            {onInWardTab ? typedWardUi.dailyQueueTitle : 'Arrival queue'}
          </h2>
          {isTypedWardNurse ? (
            <div className="mt-3 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition ${
                  wardTab === 'arrivals'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => {
                  setWardTab('arrivals');
                  setActiveAdmissionId(null);
                  setDetail(null);
                }}
              >
                Arrivals
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition ${
                  wardTab === 'in_ward'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => {
                  setWardTab('in_ward');
                  setActiveAdmissionId(null);
                  setDetail(null);
                }}
              >
                {typedWardUi.inWardTab}
              </button>
            </div>
          ) : null}
          {sessionActive ? (
            <p className={c.queueSub}>
              {onInWardTab
                ? `Daily care for selected ${typedWardUi.wardShort} patient`
                : 'Confirming arrival for selected patient'}
            </p>
          ) : (
            <p className={c.queueSub}>
              <span className={c.queueCount}>{totalCount}</span>{' '}
              {onInWardTab
                ? typedWardUi.dailyCountLabel.replace('patient(s)', `patient${totalCount === 1 ? '' : 's'}`)
                : `patient${totalCount === 1 ? '' : 's'} awaiting ward arrival`}
            </p>
          )}

          {sessionActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="Active"
              title="Current patient"
              message={
                onInWardTab
                  ? "Save today's daily record, then request transfer if needed. The patient leaves this queue after save but stays open until you close the session."
                  : isTypedWardNurse && wardTab === 'arrivals'
                    ? 'Fill in arrival monitoring values, then confirm arrival to save everything at once.'
                    : 'Confirm the arrival date when the patient reaches the ward. Use Return to queue to choose another.'
              }
            />
          ) : (
            <>
              <div className={c.searchWrap}>
                <label htmlFor="ward-staff-queue-search" className="sr-only">
                  Search queue
                </label>
                <input
                  id="ward-staff-queue-search"
                  type="search"
                  className={c.searchInput}
                  placeholder="Search by name, ID, or ward"
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {activeQueueError ? (
                <p className={`${c.hint} text-red-600`} role="alert">
                  {activeQueueError}
                </p>
              ) : null}
              {queueActionError ? (
                <p className={`${c.hint} mt-1 text-red-600`} role="alert">
                  {queueActionError}
                </p>
              ) : null}

              <div className={c.queueList}>
                {activeLoading ? (
                  <p className={c.hint}>Loading queue…</p>
                ) : filteredQueue.length === 0 ? (
                  <p className={c.hint}>
                    {queueSearch.trim()
                      ? 'No patients match your search.'
                      : onInWardTab
                        ? typedWardUi.dailyEmpty
                        : 'No patients awaiting arrival confirmation.'}
                  </p>
                ) : (
                  filteredQueue.map((row) => (
                    <QueueEntryCard
                      key={row.id}
                      classes={c}
                      name={row.patientName}
                      idLabel={row.patientNumber ? `ID: ${row.patientNumber}` : undefined}
                      subtitle={`${row.wardName} (${row.wardNumber}) · Room ${row.roomNumber} · Bed ${row.bedNumber}`}
                      badge={(
                        <div className="flex flex-wrap items-center gap-1">
                          {onInWardTab ? (
                            <span className={c.badgePending}>{typedWardUi.dailyBadge}</span>
                          ) : (
                            <span className={c.badgePending}>Awaiting arrival</span>
                          )}
                          {row.isEmergency ? (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[0.58rem] font-bold uppercase text-red-800">
                              Emergency
                            </span>
                          ) : (
                            !onInWardTab ? priorityBadge(row.transportPriority) : null
                          )}
                        </div>
                      )}
                      active={row.id === activeAdmissionId}
                      emergency={row.isEmergency}
                      disabled={actionLoading}
                      onClick={() => handleOpen(row)}
                      openLabel="Open patient"
                    />
                  ))
                )}
              </div>
            </>
          )}
        </aside>

        <div className={c.main}>
          {!sessionActive ? (
            <div className={c.idle} role="region" aria-label="Ward staff workspace">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No patient selected</h3>
              <p className={c.idleText}>
                {onInWardTab
                  ? `Select a patient who needs today's ${typedWardUi.wardShort} daily record. After saving, they leave the queue — you can still request transfer from the open session.`
                  : isTypedWardNurse && wardTab === 'arrivals'
                    ? `Select a patient awaiting ${typedWardUi.wardShort} arrival. Capture monitoring values and confirm arrival in one step.`
                    : 'When a doctor admits a patient, they appear here for ward staff and in the porter transport queue. Select a patient to review ward, room, and bed details and confirm their arrival date.'}
              </p>
            </div>
          ) : detailLoading ? (
            <div className={c.idle} role="region" aria-label="Ward staff workspace">
              <p className={c.hint}>Loading patient…</p>
            </div>
          ) : detailError ? (
            <div className={c.idle} role="region" aria-label="Ward staff workspace">
              <p className={`${c.hint} text-red-600`} role="alert">
                {detailError}
              </p>
              <button type="button" className={`${c.btnSecondary} mt-4`} onClick={handleReturnToQueue}>
                Back to queue
              </button>
            </div>
          ) : showWorkspace ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className={`${c.banner} shrink-0`}>
                <div>
                  <span className={c.bannerLabel}>Patient</span>
                  <strong className={c.bannerValue}>{bannerPatient.name}</strong>
                </div>
                <div>
                  <span className={c.bannerLabel}>Patient ID</span>
                  <strong className={c.bannerValue}>{bannerPatient.id || '—'}</strong>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <button type="button" className={c.btnSecondary} onClick={handleReturnToQueue}>
                    Return to queue
                  </button>
                </div>
              </div>

              <div className={c.formScroll}>
                {(isTypedWardNurse && detail?.patient?.id) ? (
                  <div className="mb-4">
                    <ConsultationMedicalHistoryPanel patientId={detail.patient.id} />
                  </div>
                ) : null}
                {roleName === 'icu_ward_nurse' && onInWardTab ? (
                  <IcuPatientWorkspace
                    admission={detail}
                    actionLoading={actionLoading}
                    setActionLoading={setActionLoading}
                    onToast={setToast}
                    onActionError={setWorkspaceError}
                    onRefreshQueue={refreshActiveQueue}
                    onDone={handleDone}
                  />
                ) : roleName === 'icu_ward_nurse' && wardTab === 'arrivals' ? (
                  <IcuArrivalWorkspace
                    admission={detail}
                    actionLoading={actionLoading}
                    setActionLoading={setActionLoading}
                    onToast={setToast}
                    onActionError={setWorkspaceError}
                    onRefreshQueue={refresh}
                    onRefreshIcuQueue={refreshInWard}
                    onDone={handleDone}
                  />
                ) : roleName === 'surgical_complex_nurse' && onInWardTab ? (
                  <SurgicalComplexPatientWorkspace
                    admission={detail}
                    actionLoading={actionLoading}
                    setActionLoading={setActionLoading}
                    onToast={setToast}
                    onActionError={setWorkspaceError}
                    onRefreshQueue={refreshActiveQueue}
                    onDone={handleDone}
                  />
                ) : roleName === 'surgical_complex_nurse' && wardTab === 'arrivals' ? (
                  <SurgicalComplexArrivalWorkspace
                    admission={detail}
                    actionLoading={actionLoading}
                    setActionLoading={setActionLoading}
                    onToast={setToast}
                    onActionError={setWorkspaceError}
                    onRefreshQueue={refresh}
                    onRefreshInWardQueue={refreshInWard}
                    onDone={handleDone}
                  />
                ) : roleName === 'specialized_inpatient_nurse' && onInWardTab ? (
                  <SpecializedInpatientPatientWorkspace
                    admission={detail}
                    actionLoading={actionLoading}
                    setActionLoading={setActionLoading}
                    onToast={setToast}
                    onActionError={setWorkspaceError}
                    onRefreshQueue={refreshActiveQueue}
                    onDone={handleDone}
                  />
                ) : roleName === 'specialized_inpatient_nurse' && wardTab === 'arrivals' ? (
                  <SpecializedInpatientArrivalWorkspace
                    admission={detail}
                    actionLoading={actionLoading}
                    setActionLoading={setActionLoading}
                    onToast={setToast}
                    onActionError={setWorkspaceError}
                    onRefreshQueue={refresh}
                    onRefreshInWardQueue={refreshInWard}
                    onDone={handleDone}
                  />
                ) : roleName === 'adult_outpatient_nurse' && onInWardTab ? (
                  <AdultOutpatientPatientWorkspace
                    admission={detail}
                    actionLoading={actionLoading}
                    setActionLoading={setActionLoading}
                    onToast={setToast}
                    onActionError={setWorkspaceError}
                    onRefreshQueue={refreshActiveQueue}
                    onDone={handleDone}
                  />
                ) : roleName === 'adult_outpatient_nurse' && wardTab === 'arrivals' ? (
                  <AdultOutpatientArrivalWorkspace
                    admission={detail}
                    actionLoading={actionLoading}
                    setActionLoading={setActionLoading}
                    onToast={setToast}
                    onActionError={setWorkspaceError}
                    onRefreshQueue={refresh}
                    onRefreshInWardQueue={refreshInWard}
                    onDone={handleDone}
                  />
                ) : (
                  <WardStaffWorkspace
                    admission={detail}
                    actionLoading={actionLoading}
                    setActionLoading={setActionLoading}
                    onToast={setToast}
                    onActionError={setWorkspaceError}
                    onRefreshQueue={refreshActiveQueue}
                    onDone={handleDone}
                  />
                )}
                {workspaceError ? (
                  <p className={c.submitError} role="alert">
                    {workspaceError}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className={c.idle} role="region" aria-label="Ward staff workspace">
              <p className={c.hint}>Unable to display this patient.</p>
              <button type="button" className={`${c.btnSecondary} mt-4`} onClick={handleReturnToQueue}>
                Back to queue
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className={c.footer}>
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className="text-teal-700 font-semibold hover:underline">
          Kopano-Vertex
        </a>{' '}
        | {moduleLabel}
      </footer>
    </div>
  );
}
