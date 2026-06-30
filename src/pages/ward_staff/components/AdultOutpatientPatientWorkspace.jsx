import { useCallback, useEffect, useState } from 'react';
import {
  dischargeAdultOutpatientPatient,
  getAdultOutpatientDailyRecords,
  getAvailableBeds,
  saveAdultOutpatientDailyRecord,
  transferAdultOutpatientToMortuary,
  transferAdultOutpatientToWard,
} from '../../../api/ward';
import { confirmAction, confirmAdultOutpatientDailySave } from '../../../utils/confirmAction';
import { wst } from '../styles/wardStaffClasses';
import AdultOutpatientVitalsForm, { EMPTY_AO_VITALS } from './AdultOutpatientVitalsForm';
import IcuDispositionPorterFields, {
  buildPorterTransportPayload,
  emptyPorterChecklist,
} from './IcuDispositionPorterFields';
import {
  TRANSFER_WARD_OPTIONS,
  firstValidationMessage,
  validateAdultOutpatientDailyRecord,
  validateAdultOutpatientDischarge,
  validateAdultOutpatientMortuaryTransfer,
  validateAdultOutpatientPorterTransport,
} from '../adultOutpatientWardValidation';

function bedOptionLabel(bed) {
  const ward = bed.ward || {};
  return `${ward.name || 'Ward'} — Room ${bed.room_number || '—'} — Bed ${bed.bed_number || '—'}`;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function todayRecord() {
  return { ...EMPTY_AO_VITALS, record_date: todayIsoDate() };
}

export default function AdultOutpatientPatientWorkspace({
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
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [vitalsErrors, setVitalsErrors] = useState({});
  const [porterErrors, setPorterErrors] = useState({});
  const [mortuaryErrors, setMortuaryErrors] = useState({});
  const [dischargeErrors, setDischargeErrors] = useState({});

  const loadRecords = useCallback(async () => {
    if (!admission?.id) return;
    setRecordsLoading(true);
    try {
      const data = await getAdultOutpatientDailyRecords(admission.id);
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

  useEffect(() => { loadRecords(); }, [loadRecords]);
  useEffect(() => { loadAssignedBed(transferTarget); }, [loadAssignedBed, transferTarget]);

  const hasTodayRecord = records.some((rec) => rec.record_date === todayIsoDate());
  const targetLabel = TRANSFER_WARD_OPTIONS.find((o) => o.value === transferTarget)?.label || 'Ward';

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
    const errors = validateAdultOutpatientDailyRecord(payload);
    setVitalsErrors(errors);
    if (Object.keys(errors).length) {
      onActionError(firstValidationMessage(errors));
      return;
    }
    if (!(await confirmAdultOutpatientDailySave(patientName))) return;

    setActionLoading(true);
    onActionError('');
    try {
      await saveAdultOutpatientDailyRecord(admission.id, payload);
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
    if (!admission?.id || !hasTodayRecord) {
      onActionError("Save today's daily record before requesting transfer.");
      return;
    }
    if (!bedsAvailable) {
      onActionError('No beds are currently available in the selected ward type.');
      return;
    }

    const errors = validateAdultOutpatientPorterTransport(porterValidationInput());
    setPorterErrors(errors);
    if (Object.keys(errors).length) {
      onActionError(firstValidationMessage(errors));
      return;
    }

    const bedLabel = assignedBed ? bedOptionLabel(assignedBed) : `the next available ${targetLabel.toLowerCase()} bed`;
    if (!(await confirmAction({
      title: `Transfer to ${targetLabel}?`,
      text: `Request porter transport for ${patientName} to ${bedLabel}?`,
      icon: 'question',
      confirmButtonText: 'Request transfer',
    }))) return;

    setActionLoading(true);
    try {
      const result = await transferAdultOutpatientToWard(admission.id, {
        target_ward_type: transferTarget,
        ...porterPayload(),
      });
      onToast(`${patientName} — transfer to ${targetLabel} requested (${result?.target_bed || bedLabel}).`);
      await onRefreshQueue();
      onDone();
    } catch (err) {
      onActionError(err.message || 'Could not request transfer');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDischarge() {
    if (!admission?.id || !hasTodayRecord) {
      onActionError("Save today's daily record before discharging.");
      return;
    }

    const errors = validateAdultOutpatientDischarge({ dischargeNotes });
    setDischargeErrors(errors);
    if (Object.keys(errors).length) {
      onActionError(firstValidationMessage(errors));
      return;
    }

    if (!(await confirmAction({
      title: 'Discharge patient?',
      text: `Discharge ${patientName} from adult outpatient? The bed will be freed immediately.`,
      icon: 'question',
      confirmButtonText: 'Discharge',
    }))) return;

    setActionLoading(true);
    try {
      const result = await dischargeAdultOutpatientPatient(admission.id, {
        discharge_notes: dischargeNotes.trim(),
      });
      const routed = result?.routedToBilling ? ' Patient sent to billing for settlement.' : '';
      onToast(`${patientName} discharged.${routed}`);
      await onRefreshQueue();
      onDone();
    } catch (err) {
      onActionError(err.message || 'Could not discharge patient');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTransferMortuary() {
    if (!admission?.id || !hasTodayRecord) {
      onActionError("Save today's daily record before requesting transfer.");
      return;
    }

    const errors = validateAdultOutpatientMortuaryTransfer({
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
      text: `Register ${patientName} as deceased and request porter transport to mortuary?`,
      icon: 'warning',
      confirmButtonText: 'Send to mortuary',
    }))) return;

    setActionLoading(true);
    try {
      await transferAdultOutpatientToMortuary(admission.id, {
        cause_of_death: causeOfDeath.trim(),
        date_of_death: todayIsoDate(),
        notes: mortuaryNotes.trim() || undefined,
        ...porterPayload(),
      });
      onToast(`${patientName} — mortuary transfer requested.`);
      await onRefreshQueue();
      onDone();
    } catch (err) {
      onActionError(err.message || 'Could not request mortuary transfer');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <section className={wst.placementCard}>
        <h3 className={wst.placementTitle}>Adult outpatient placement</h3>
        <p className={wst.placementMain}>{ward.name || 'Adult outpatient'}</p>
        <p className={wst.placementSub}>Room {bed.room_number || '—'} · Bed {bed.bed_number || '—'}</p>
      </section>

      <section className={wst.sectionPanel}>
        <h3 className={wst.sectionTitle}>Daily record</h3>
        {hasTodayRecord ? (
          <p className="mb-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
            Today&apos;s record saved ({todayIsoDate()}).
          </p>
        ) : null}
        <AdultOutpatientVitalsForm
          vitals={vitals}
          onChange={(updater) => { setVitals(updater); setVitalsErrors({}); }}
          hideRecordDate
          fieldErrors={vitalsErrors}
          submitButton={hasTodayRecord ? null : (
            <button type="button" className={wst.btnPrimary} disabled={actionLoading} onClick={handleSaveRecord}>
              {actionLoading ? 'Saving…' : 'Save daily record'}
            </button>
          )}
        />
      </section>

      {records.length > 0 && !recordsLoading ? (
        <section className={wst.sectionPanel}>
          <h3 className={wst.sectionTitle}>Previous records</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {records.map((rec) => (
              <li key={rec.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="font-semibold">{rec.record_date}</p>
                <p className="text-slate-600">
                  HR {rec.heart_rate ?? '—'} · SpO₂ {rec.oxygen_saturation ?? '—'}% · RR {rec.respiration_rate ?? '—'} · BP {rec.blood_pressure_systolic ?? '—'}/{rec.blood_pressure_diastolic ?? '—'}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={wst.sectionPanel}>
        <h3 className={wst.sectionTitle}>Patient disposition</h3>
        {!hasTodayRecord ? (
          <p className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Save today&apos;s daily record before transfer or discharge.
          </p>
        ) : null}

        <IcuDispositionPorterFields
          equipmentRequired={porterEquipment}
          onEquipmentRequiredChange={setPorterEquipment}
          equipmentNotes={porterEquipmentNotes}
          onEquipmentNotesChange={setPorterEquipmentNotes}
          criticalNotes={porterCriticalNotes}
          onCriticalNotesChange={setPorterCriticalNotes}
          checklist={porterChecklist}
          onChecklistToggle={(id) => setPorterChecklist((prev) => ({ ...prev, [id]: !prev[id] }))}
          idPrefix="ao-disposition"
          fieldErrors={{ ...porterErrors, ...mortuaryErrors }}
        />

        <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/50 p-4">
          <h4 className="text-sm font-bold text-teal-900">Transfer to another ward</h4>
          <select
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={transferTarget}
            onChange={(e) => setTransferTarget(e.target.value)}
          >
            {TRANSFER_WARD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {assignedBed ? (
            <p className="mt-2 text-sm"><span className="font-semibold">System-assigned bed: </span>{bedOptionLabel(assignedBed)}</p>
          ) : (
            <p className="mt-2 text-sm text-amber-800">No beds available in {targetLabel.toLowerCase()}.</p>
          )}
          <button type="button" className={`${wst.btnPrimary} mt-3`} disabled={actionLoading || !bedsAvailable || !hasTodayRecord} onClick={handleTransferWard}>
            Request transfer
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <h4 className="text-sm font-bold text-emerald-900">Discharge patient</h4>
          <label className="mt-2 block text-sm">
            <span className={wst.infoLabel}>Discharge notes (required)</span>
            <textarea
              rows={2}
              className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm ${dischargeErrors.discharge_notes ? 'border-red-400' : 'border-slate-200'}`}
              value={dischargeNotes}
              onChange={(e) => { setDischargeNotes(e.target.value); setDischargeErrors({}); }}
            />
            {dischargeErrors.discharge_notes ? <p className="mt-1 text-xs text-red-600">{dischargeErrors.discharge_notes}</p> : null}
          </label>
          <button
            type="button"
            className="mt-3 inline-flex min-h-[2.5rem] items-center justify-center rounded-lg border border-emerald-600 bg-white px-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
            disabled={actionLoading || !hasTodayRecord}
            onClick={handleDischarge}
          >
            Discharge patient
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-4">
          <h4 className="text-sm font-bold text-slate-900">Send to mortuary</h4>
          <label className="mt-2 block text-sm">
            <span className={wst.infoLabel}>Cause of death (required)</span>
            <input
              type="text"
              className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm ${mortuaryErrors.cause_of_death ? 'border-red-400' : 'border-slate-200'}`}
              value={causeOfDeath}
              onChange={(e) => setCauseOfDeath(e.target.value)}
            />
          </label>
          <label className="mt-2 block text-sm">
            <span className={wst.infoLabel}>Notes (optional)</span>
            <textarea rows={2} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={mortuaryNotes} onChange={(e) => setMortuaryNotes(e.target.value)} />
          </label>
          <button type="button" className="mt-3 rounded-lg border border-slate-400 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-60" disabled={actionLoading || !hasTodayRecord} onClick={handleTransferMortuary}>
            Request transport to mortuary
          </button>
        </div>
      </section>
    </div>
  );
}
