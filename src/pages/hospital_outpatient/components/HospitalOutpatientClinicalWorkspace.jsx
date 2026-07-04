import { useCallback, useEffect, useMemo, useState } from 'react';
import QueueEntryCard from '../../../components/queue/QueueEntryCard';
import DischargePatientSection from '../../../components/consultation/DischargePatientSection';
import ActiveSessionQueueAside from '../../../components/queue/ActiveSessionQueueAside';
import { layout as c } from '../../doctor/styles/doctorLayoutClasses';
import { nurse as nc } from '../../nurse/styles/nurseClasses';
import HospitalOutpatientTopbar from './HospitalOutpatientTopbar';
import ClinicReferralRecordPanel from './ClinicReferralRecordPanel';
import HospitalOutpatientVitalsForm from './HospitalOutpatientVitalsForm';
import WardRoutingSection from './WardRoutingSection';
import {
  useHospitalOutpatientQueue,
  useHospitalOutpatientSession,
} from '../hooks/useHospitalOutpatientQueue';
import {
  startHospitalOutpatientSession,
  saveHospitalOutpatientVitals,
  admitHospitalOutpatientPatient,
  dischargeHospitalOutpatientPatient,
} from '../../../api/hospitalOutpatient';
import { releaseQueueEntry } from '../../../api/queue';
import { confirmAction, confirmStartPatientSession } from '../../../utils/confirmAction';
import {
  getClinicalDepartmentConfig,
  getWardTypesForDepartment,
  emptyOutpatientForm,
  validateOutpatientVitals,
  buildVitalsPayload,
  buildAdmitPayload,
  buildDischargePayload,
  vitalsComplete,
} from '../hospitalOutpatientClinicalConfig';
import { validateRefusalDischargeReason } from '../../../utils/dischargeDocumentation';

function QueueEmptyIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden className="text-slate-300">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function HospitalOutpatientClinicalWorkspace() {
  const { department, label, operatorLabel, initials, userId } = useHospitalOutpatientSession();
  const deptConfig = getClinicalDepartmentConfig(department);
  const { queue, loading, error, live, refresh } = useHospitalOutpatientQueue(department);

  const [activeId, setActiveId] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [form, setForm] = useState(emptyOutpatientForm(department));
  const [fieldErrors, setFieldErrors] = useState({});
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [queueSearch, setQueueSearch] = useState('');
  const [toast, setToast] = useState('');
  const [submitError, setSubmitError] = useState('');

  const idPrefix = department === 'ent_outpatient'
    ? 'ent'
    : department === 'hospital_emergency_unit'
      ? 'eu'
      : department === 'orthopedic_outpatient'
        ? 'ortho'
        : department === 'adult_outpatient'
          ? 'adult'
          : department === 'physiotherapy_rehabilitation'
            ? 'physio'
            : department === 'big_room_specialist'
              ? 'brs'
              : department === 'urology_outpatient'
                ? 'uro'
                : department === 'mental_health_outpatient'
                  ? 'mh'
                  : 'ho';

  const wardTypes = getWardTypesForDepartment(department);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const activeEntry = useMemo(
    () => queue.find((q) => q.id === activeId) || null,
    [queue, activeId]
  );

  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    if (!q) return queue;
    return queue.filter(
      (row) =>
        row.patientName.toLowerCase().includes(q)
        || (row.patientNumber && row.patientNumber.toLowerCase().includes(q))
    );
  }, [queue, queueSearch]);

  const workspaceActive = Boolean(
    activeEntry
    && workspace?.entry?.status === 'in_progress'
    && workspace?.entry?.assigned_to === userId
  );

  const bedsByWardType = workspace?.beds_by_ward_type || {};

  const resetWorkspace = useCallback(() => {
    setActiveId(null);
    setWorkspace(null);
    setForm(emptyOutpatientForm(department));
    setFieldErrors({});
    setSubmitError('');
    setQueueSearch('');
  }, [department]);

  const vitalsReady = vitalsComplete(form, department);
  const queueEntryId = workspace?.entry?.id || activeEntry?.id;
  const visitId = workspace?.entry?.visit_id || activeEntry?.visitId;
  const vitalsRequiredMessage = deptConfig?.vitalsRequiredMessage || 'Enter required vitals';

  async function ensureVitalsSaved() {
    if (!workspaceActive || !queueEntryId || !visitId) return false;
    const errors = validateOutpatientVitals(form, department);
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }));
      return false;
    }

    const result = await saveHospitalOutpatientVitals(
      buildVitalsPayload(form, visitId, queueEntryId)
    );
    setFieldErrors((prev) => {
      const next = { ...prev };
      for (const field of deptConfig?.fields || []) {
        delete next[field.key];
      }
      return next;
    });
    setWorkspace((prev) => ({
      ...prev,
      hospital_vitals: result?.vital || prev?.hospital_vitals,
      beds_by_ward_type: result?.beds_by_ward_type || prev?.beds_by_ward_type,
    }));
    if (form.is_critical && !form.selected_ward_type) {
      setForm((prev) => ({ ...prev, selected_ward_type: 'icu' }));
    }
    return true;
  }

  async function openEntry(entry) {
    if (workspaceActive && entry.id !== activeId) return;
    if (!(await confirmStartPatientSession(entry.patientName, entry.status !== 'in_progress'))) return;

    setDetailLoading(true);
    setSubmitError('');
    try {
      const data = await startHospitalOutpatientSession(entry.id);
      setActiveId(entry.id);
      setWorkspace(data);
      setForm(emptyOutpatientForm(department, data?.hospital_vitals));
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Could not open patient session');
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleAdmit() {
    if (!workspaceActive || !activeEntry) return;
    if (!vitalsReady) {
      const errors = validateOutpatientVitals(form, department);
      setFieldErrors((prev) => ({ ...prev, ...errors }));
      setSubmitError(`${vitalsRequiredMessage} before admitting to a ward`);
      return;
    }
    if (!form.selected_ward_type) {
      setSubmitError('Select a ward type');
      return;
    }

    const wardLabel = bedsByWardType?.[form.selected_ward_type]?.label || form.selected_ward_type;
    const confirmed = await confirmAction({
      title: `Admit to ${wardLabel}?`,
      text: `Save vitals and assign ${activeEntry.patientName} to the next available ${wardLabel} bed?`,
      icon: 'warning',
      confirmButtonText: 'Admit patient',
    });
    if (!confirmed) return;

    setActionLoading(true);
    setSubmitError('');
    try {
      if (!(await ensureVitalsSaved())) return;
      await admitHospitalOutpatientPatient(
        buildAdmitPayload(form, visitId, queueEntryId)
      );
      setToast(`${activeEntry.patientName} admitted to ${wardLabel}`);
      resetWorkspace();
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Could not admit patient');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDischarge() {
    if (!workspaceActive || !activeEntry) return;
    if (!vitalsReady) {
      const errors = validateOutpatientVitals(form, department);
      setFieldErrors((prev) => ({ ...prev, ...errors }));
      setSubmitError(`${vitalsRequiredMessage} before discharging the patient`);
      return;
    }
    const reasonError = validateRefusalDischargeReason(form.discharge_reason);
    if (reasonError.discharge_reason) {
      setFieldErrors((prev) => ({ ...prev, discharge_reason: reasonError.discharge_reason }));
      return;
    }

    const confirmed = await confirmAction({
      title: 'Discharge patient?',
      text: deptConfig?.dischargeConfirmText(activeEntry.patientName)
        || `Complete the consultation and discharge ${activeEntry.patientName}?`,
      icon: 'question',
      confirmButtonText: 'Discharge patient',
    });
    if (!confirmed) return;

    setActionLoading(true);
    setSubmitError('');
    try {
      if (!(await ensureVitalsSaved())) return;
      const result = await dischargeHospitalOutpatientPatient(
        buildDischargePayload(form, visitId, queueEntryId)
      );
      const billingNote = result?.routedToBilling
        ? ' Patient sent to billing clerk for payment.'
        : '';
      setToast(`${activeEntry.patientName} discharged.${billingNote}`);
      resetWorkspace();
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Could not discharge patient');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReturnToQueue() {
    if (!activeEntry || actionLoading) return;
    const confirmed = await confirmAction({
      title: 'Return to queue?',
      text: `Return ${activeEntry.patientName} to the waiting queue? Unsaved work may be lost.`,
      icon: 'question',
      confirmButtonText: 'Return to queue',
    });
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await releaseQueueEntry(queueEntryId);
      resetWorkspace();
      setToast(`${activeEntry.patientName} returned to queue`);
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Could not return patient to queue');
    } finally {
      setActionLoading(false);
    }
  }

  function onFieldChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  if (!deptConfig) {
    return (
      <div className={c.page}>
        <p className="p-4 text-sm text-red-600">Clinical workspace is not configured for this department.</p>
      </div>
    );
  }

  return (
    <div className={c.page}>
      <HospitalOutpatientTopbar
        label={label}
        operatorLabel={operatorLabel}
        initials={initials}
        live={live}
      />
      {toast ? <div className={nc.toast} role="status">{toast}</div> : null}
      {error ? <p className="mx-4 mt-2 text-sm text-red-600" role="alert">{error}</p> : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label={`${label} queue`}>
          <h2 className={c.queueTitle}>{label} queue</h2>
          <p className={c.queueSub}>
            Inbound clinic referrals — review consultation, record vitals, then admit or discharge.
          </p>

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
              title={deptConfig.sessionTitle}
              message={deptConfig.sessionMessage}
            />
          ) : (
            <>
              <div className={c.searchWrap}>
                <label htmlFor={`${idPrefix}-queue-search`} className="sr-only">Search queue</label>
                <input
                  id={`${idPrefix}-queue-search`}
                  type="search"
                  className={c.searchInput}
                  placeholder="Search by name or patient ID…"
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className={c.queueList}>
                {loading ? (
                  <p className={nc.hint}>Loading queue…</p>
                ) : filteredQueue.length === 0 ? (
                  <p className={nc.hint}>
                    {queueSearch.trim() ? 'No patients match your search.' : 'No patients waiting.'}
                  </p>
                ) : (
                  filteredQueue.map((row) => (
                    <QueueEntryCard
                      key={row.id}
                      classes={c}
                      name={row.patientName}
                      idLabel={row.patientNumber ? `ID: ${row.patientNumber}` : undefined}
                      subtitle={row.notes || 'Clinic referral'}
                      active={row.id === activeId}
                      disabled={workspaceActive && row.id !== activeId}
                      onClick={() => openEntry(row)}
                      openLabel="Open"
                    />
                  ))
                )}
              </div>
            </>
          )}
        </aside>

        <main className={c.main}>
          {!activeEntry || !workspaceActive ? (
            <div className={c.idle} role="region">
              <QueueEmptyIcon />
              <h3 className={c.idleTitle}>No patient selected</h3>
              <p className={c.idleText}>{deptConfig.idleText}</p>
            </div>
          ) : detailLoading ? (
            <p className={nc.hint}>Loading referral record…</p>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
              <div className={`${nc.banner} shrink-0`}>
                <div>
                  <span className={nc.bannerLabel}>Active patient</span>
                  <strong className={nc.bannerValue}>{activeEntry.patientName}</strong>
                </div>
                <div>
                  <span className={nc.bannerLabel}>Patient ID</span>
                  <strong className={nc.bannerValue}>{activeEntry.patientNumber || '—'}</strong>
                </div>
                <div>
                  <span className={nc.bannerLabel}>Referring clinic</span>
                  <strong className={nc.bannerValue}>
                    {workspace?.transfer?.clinicFacility?.name || '—'}
                  </strong>
                </div>
              </div>

              <ClinicReferralRecordPanel
                transfer={workspace?.transfer}
                clinicConsultation={workspace?.clinic_consultation}
                clinicVitals={workspace?.clinic_vitals}
              />

              <HospitalOutpatientVitalsForm
                config={deptConfig}
                form={form}
                fieldErrors={fieldErrors}
                onFieldChange={onFieldChange}
                idPrefix={idPrefix}
              />

              <WardRoutingSection
                form={form}
                bedsByWardType={bedsByWardType}
                vitalsReady={vitalsReady}
                vitalsRequiredMessage={vitalsRequiredMessage}
                isCritical={form.is_critical}
                wardTypes={wardTypes}
                onFieldChange={onFieldChange}
                onAdmit={handleAdmit}
                admitting={actionLoading}
                idPrefix={idPrefix}
              />

              <DischargePatientSection
                idPrefix={idPrefix}
                dischargeReason={form.discharge_reason}
                onDischargeReasonChange={(value) => onFieldChange('discharge_reason', value)}
                error={fieldErrors.discharge_reason}
                actionLoading={actionLoading}
                onDischarge={handleDischarge}
                locked={!vitalsReady}
                lockedMessage={
                  !vitalsReady
                    ? `${vitalsRequiredMessage} before discharging the patient.`
                    : undefined
                }
              />

              {submitError ? (
                <p className={nc.submitError} role="alert">{submitError}</p>
              ) : null}

              <div className="border-t border-slate-200 pt-4">
                <button
                  type="button"
                  className={nc.btnSecondary}
                  disabled={actionLoading}
                  onClick={handleReturnToQueue}
                >
                  Return to queue
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
