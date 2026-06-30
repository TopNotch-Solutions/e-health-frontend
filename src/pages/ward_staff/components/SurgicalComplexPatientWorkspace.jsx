import { useCallback, useEffect, useState } from 'react';
import {
  getAvailableBeds,
  getSurgicalComplexDailyRecords,
  saveSurgicalComplexDailyRecord,
  transferSurgicalComplexToMortuary,
  transferSurgicalComplexToWard,
} from '../../../api/ward';
import { confirmAction, confirmSurgicalComplexDailySave } from '../../../utils/confirmAction';
import { wst } from '../styles/wardStaffClasses';
import SurgicalComplexVitalsForm, { EMPTY_SC_VITALS } from './SurgicalComplexVitalsForm';
import IcuDispositionPorterFields, {
  buildPorterTransportPayload,
  emptyPorterChecklist,
} from './IcuDispositionPorterFields';
import {
  TRANSFER_WARD_OPTIONS,
  firstValidationMessage,
  validateSurgicalComplexDailyRecord,
  validateSurgicalComplexMortuaryTransfer,
  validateSurgicalComplexPorterTransport,
} from '../surgicalComplexWardValidation';

function formatDob(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function bedOptionLabel(bed) {
  const ward = bed.ward || {};
  return `${ward.name || 'Ward'} — Room ${bed.room_number || '—'} — Bed ${bed.bed_number || '—'}`;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function todayRecord() {
  return { ...EMPTY_SC_VITALS, record_date: todayIsoDate() };
}

export default function SurgicalComplexPatientWorkspace({
  admission,
  actionLoading,
  setActionLoading,
  onToast,
  onActionError,
  onRefreshQueue,
  onDone,
}) {
  const patient = admission?.patient || {};
  const ward = admission?.ward || {};
  const bed = admission?.bed || {};
  const visit = admission?.visit || {};
  const patientName = [patient.first_name, patient.last_name].filter(Boolean).join(' ').trim() || 'Patient';

  const [vitals, setVitals] = useState(() => todayRecord());
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [transferTarget, setTransferTarget] = useState('general');
  const [assignedBed, setAssignedBed] = useState(null);
  const [bedsAvailable, setBedsAvailable] = useState(true);
  const [porterEquipment, setPorterEquipment] = useState('stretcher');
  const [porterEquipmentNotes, setPorterEquipmentNotes] = useState('');
  const [porterCriticalNotes, setPorterCriticalNotes] = useState('');
  const [porterChecklist, setPorterChecklist] = useState(emptyPorterChecklist);
  const [causeOfDeath, setCauseOfDeath] = useState('');
  const [mortuaryNotes, setMortuaryNotes] = useState('');
  const [vitalsErrors, setVitalsErrors] = useState({});
  const [porterErrors, setPorterErrors] = useState({});
  const [mortuaryErrors, setMortuaryErrors] = useState({});

  const loadRecords = useCallback(async () => {
    if (!admission?.id) return;
    setRecordsLoading(true);
    try {
      const data = await getSurgicalComplexDailyRecords(admission.id);
      setRecords(Array.isArray(data?.records) ? data.records : []);
    } catch {
      setRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  }, [admission?.id]);

  const loadAssignedBed = useCallback(async (wardType) => {
    try {
      const beds = await getAvailableBeds(wardType);
      const list = Array.isArray(beds) ? beds : [];
      setBedsAvailable(list.length > 0);
      setAssignedBed(list[0] || null);
    } catch {
      setBedsAvailable(false);
      setAssignedBed(null);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    loadAssignedBed(transferTarget);
  }, [loadAssignedBed, transferTarget]);

  const hasTodayRecord = records.some((rec) => rec.record_date === todayIsoDate());

  function porterPayload() {
    return buildPorterTransportPayload({
      equipmentRequired: porterEquipment,
      equipmentNotes: porterEquipmentNotes,
      criticalNotes: porterCriticalNotes,
      checklist: porterChecklist,
    });
  }

  function porterValidationInput() {
    return {
      equipmentRequired: porterEquipment,
      equipmentNotes: porterEquipmentNotes,
      criticalNotes: porterCriticalNotes,
      checklist: porterChecklist,
    };
  }

  async function handleSaveRecord() {
    if (!admission?.id) return;
    const payload = { ...vitals, record_date: todayIsoDate() };
    const errors = validateSurgicalComplexDailyRecord(payload);
    setVitalsErrors(errors);
    if (Object.keys(errors).length) {
      onActionError(firstValidationMessage(errors));
      return;
    }
    if (!(await confirmSurgicalComplexDailySave(patientName))) return;

    setActionLoading(true);
    onActionError('');
    try {
      await saveSurgicalComplexDailyRecord(admission.id, payload);
      setVitalsErrors({});
      onToast(`Daily record saved for ${patientName}.`);
      await loadRecords();
      await onRefreshQueue();
    } catch (err) {
      onActionError(err.message || 'Could not save daily record');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTransferWard() {
    if (!admission?.id) return;
    if (!hasTodayRecord) {
      onActionError("Save today's daily record before requesting transfer.");
      return;
    }
    if (!bedsAvailable) {
      onActionError('No beds are currently available in the selected ward type.');
      return;
    }

    const porterInput = porterValidationInput();
    const errors = validateSurgicalComplexPorterTransport(porterInput);
    setPorterErrors(errors);
    if (Object.keys(errors).length) {
      onActionError(firstValidationMessage(errors));
      return;
    }

    const targetLabel = TRANSFER_WARD_OPTIONS.find((o) => o.value === transferTarget)?.label || transferTarget;
    const bedLabel = assignedBed ? bedOptionLabel(assignedBed) : `the next available ${targetLabel.toLowerCase()} bed`;
    if (!(await confirmAction({
      title: `Transfer to ${targetLabel}?`,
      text: `Request internal porter transport for ${patientName} to ${bedLabel}? The surgical complex bed will be freed once delivery is complete.`,
      icon: 'question',
      confirmButtonText: 'Request transfer',
    }))) return;

    setActionLoading(true);
    onActionError('');
    try {
      const result = await transferSurgicalComplexToWard(admission.id, {
        target_ward_type: transferTarget,
        ...porterPayload(),
      });
      setPorterErrors({});
      const destination = result?.target_bed || bedLabel;
      onToast(`${patientName} — transfer to ${targetLabel} requested (${destination}).`);
      await onRefreshQueue();
      onDone();
    } catch (err) {
      onActionError(err.message || 'Could not request ward transfer');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTransferMortuary() {
    if (!admission?.id) return;
    if (!hasTodayRecord) {
      onActionError("Save today's daily record before requesting transfer.");
      return;
    }

    const errors = validateSurgicalComplexMortuaryTransfer({
      causeOfDeath,
      ...porterValidationInput(),
    });
    setMortuaryErrors(errors);
    setPorterErrors(errors);
    if (Object.keys(errors).length) {
      onActionError(firstValidationMessage(errors));
      return;
    }

    if (!(await confirmAction({
      title: 'Send to mortuary?',
      text: `Register ${patientName} as deceased and request internal porter transport to the mortuary?`,
      icon: 'warning',
      confirmButtonText: 'Send to mortuary',
    }))) return;

    setActionLoading(true);
    onActionError('');
    try {
      await transferSurgicalComplexToMortuary(admission.id, {
        cause_of_death: causeOfDeath.trim(),
        date_of_death: todayIsoDate(),
        notes: mortuaryNotes.trim() || undefined,
        ...porterPayload(),
      });
      setMortuaryErrors({});
      setPorterErrors({});
      onToast(`${patientName} — mortuary transfer requested.`);
      await onRefreshQueue();
      onDone();
    } catch (err) {
      onActionError(err.message || 'Could not request mortuary transfer');
    } finally {
      setActionLoading(false);
    }
  }

  const targetLabel = TRANSFER_WARD_OPTIONS.find((o) => o.value === transferTarget)?.label || 'Ward';

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <section className={wst.placementCard} aria-labelledby="sc-placement-heading">
        <h3 id="sc-placement-heading" className={wst.placementTitle}>Surgical complex placement</h3>
        <p className={wst.placementMain}>{ward.name || 'Surgical complex'} ({ward.ward_number || '—'})</p>
        <p className={wst.placementSub}>
          Room {bed.room_number || '—'} · Bed {bed.bed_number || '—'}
          {admission?.admitted_at ? ` · Admitted ${new Date(admission.admitted_at).toLocaleString()}` : ''}
        </p>
      </section>

      <section className={wst.sectionPanel} aria-labelledby="sc-patient-heading">
        <h3 id="sc-patient-heading" className={wst.sectionTitle}>Patient details</h3>
        <dl className={wst.infoGrid}>
          <div><dt className={wst.infoLabel}>Full name</dt><dd className={wst.infoValue}>{patientName}</dd></div>
          <div><dt className={wst.infoLabel}>Patient ID</dt><dd className={wst.infoValue}>{patient.patient_number || '—'}</dd></div>
          <div><dt className={wst.infoLabel}>Sex</dt><dd className={`${wst.infoValue} capitalize`}>{patient.sex || '—'}</dd></div>
          <div><dt className={wst.infoLabel}>Date of birth</dt><dd className={wst.infoValue}>{formatDob(patient.date_of_birth)}</dd></div>
          <div><dt className={wst.infoLabel}>Visit</dt><dd className={wst.infoValue}>{visit.visit_number || '—'} ({visit.visit_type || '—'})</dd></div>
        </dl>
      </section>

      <section className={wst.sectionPanel} aria-labelledby="sc-vitals-heading">
        <h3 id="sc-vitals-heading" className={wst.sectionTitle}>Daily record</h3>
        <p className="mt-1 text-sm text-slate-600">
          Capture today&apos;s monitoring, then save. Once saved, the patient leaves today&apos;s queue — you can still request transfer below.
        </p>
        {hasTodayRecord ? (
          <p className="mt-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900">
            Today&apos;s record is saved ({todayIsoDate()}).
          </p>
        ) : null}
        <SurgicalComplexVitalsForm
          vitals={vitals}
          onChange={(updater) => { setVitals(updater); setVitalsErrors({}); }}
          idPrefix="sc-daily"
          hideRecordDate
          fieldErrors={vitalsErrors}
          submitButton={hasTodayRecord ? null : (
            <button type="button" className={wst.btnPrimary} disabled={actionLoading} onClick={handleSaveRecord}>
              {actionLoading ? 'Saving…' : 'Save daily record'}
            </button>
          )}
        />
      </section>

      {recordsLoading ? (
        <p className="text-sm text-slate-500">Loading previous records…</p>
      ) : records.length > 0 ? (
        <section className={wst.sectionPanel} aria-labelledby="sc-history-heading">
          <h3 id="sc-history-heading" className={wst.sectionTitle}>Previous daily records</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {records.map((rec) => (
              <li key={rec.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-900">{rec.record_date}</p>
                <p className="mt-1 text-slate-600">
                  HR {rec.heart_rate ?? '—'} · SpO₂ {rec.pulse_oximetry_spo2 ?? rec.oxygen_saturation ?? '—'}% · RR {rec.respiration_rate ?? '—'} · Temp {rec.body_temperature ?? '—'}°C · BP {rec.blood_pressure_systolic ?? '—'}/{rec.blood_pressure_diastolic ?? '—'}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={wst.sectionPanel} aria-labelledby="sc-transfer-heading">
        <h3 id="sc-transfer-heading" className={wst.sectionTitle}>Patient disposition</h3>
        <p className="mt-1 text-sm text-slate-600">
          After today&apos;s record is saved, complete porter details and request internal transport. Beds and rooms become available once delivery is complete.
        </p>
        {!hasTodayRecord ? (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Save today&apos;s daily record before requesting transfer.
          </p>
        ) : null}

        <IcuDispositionPorterFields
          equipmentRequired={porterEquipment}
          onEquipmentRequiredChange={(v) => { setPorterEquipment(v); setPorterErrors({}); setMortuaryErrors({}); }}
          equipmentNotes={porterEquipmentNotes}
          onEquipmentNotesChange={(v) => { setPorterEquipmentNotes(v); setPorterErrors({}); setMortuaryErrors({}); }}
          criticalNotes={porterCriticalNotes}
          onCriticalNotesChange={(v) => { setPorterCriticalNotes(v); setPorterErrors({}); setMortuaryErrors({}); }}
          checklist={porterChecklist}
          onChecklistToggle={(id) => { setPorterChecklist((prev) => ({ ...prev, [id]: !prev[id] })); setPorterErrors({}); setMortuaryErrors({}); }}
          idPrefix="sc-disposition"
          fieldErrors={{ ...porterErrors, ...mortuaryErrors }}
        />

        <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/50 p-4">
          <h4 className="text-sm font-bold text-teal-900">Transfer to another ward</h4>
          <label className="mt-3 block text-sm">
            <span className={wst.infoLabel}>Destination</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={transferTarget}
              onChange={(e) => setTransferTarget(e.target.value)}
            >
              {TRANSFER_WARD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          {assignedBed ? (
            <p className="mt-2 text-sm text-slate-700">
              <span className="font-semibold text-teal-900">System-assigned bed: </span>
              {bedOptionLabel(assignedBed)}
            </p>
          ) : (
            <p className="mt-2 text-sm text-amber-800">No beds available in {targetLabel.toLowerCase()}.</p>
          )}
          <button
            type="button"
            className={`${wst.btnPrimary} mt-3`}
            disabled={actionLoading || !bedsAvailable || !hasTodayRecord}
            onClick={handleTransferWard}
          >
            Request transfer to {targetLabel.toLowerCase()}
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-4">
          <h4 className="text-sm font-bold text-slate-900">Send to mortuary</h4>
          <div className="mt-3 grid gap-3">
            <label className="block text-sm">
              <span className={wst.infoLabel}>Cause of death (required)</span>
              <input
                type="text"
                className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm ${mortuaryErrors.cause_of_death ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-200'}`}
                value={causeOfDeath}
                onChange={(e) => {
                  setCauseOfDeath(e.target.value);
                  setMortuaryErrors((prev) => { const next = { ...prev }; delete next.cause_of_death; return next; });
                }}
              />
              {mortuaryErrors.cause_of_death ? <p className="mt-1 text-xs text-red-600">{mortuaryErrors.cause_of_death}</p> : null}
            </label>
            <label className="block text-sm">
              <span className={wst.infoLabel}>Notes (optional)</span>
              <textarea rows={2} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={mortuaryNotes} onChange={(e) => setMortuaryNotes(e.target.value)} />
            </label>
          </div>
          <button
            type="button"
            className="mt-3 inline-flex min-h-[2.5rem] items-center justify-center rounded-lg border border-slate-400 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 disabled:opacity-60"
            disabled={actionLoading || !hasTodayRecord}
            onClick={handleTransferMortuary}
          >
            Request transport to mortuary
          </button>
        </div>
      </section>
    </div>
  );
}
