import { useCallback, useEffect, useState } from 'react';
import {
  getAvailableBeds,
  getIcuDailyRecords,
  saveIcuDailyRecord,
  transferIcuToGeneralWard,
  transferIcuToMortuary,
} from '../../../api/ward';
import { confirmAction, confirmIcuDailySave } from '../../../utils/confirmAction';
import { wst } from '../styles/wardStaffClasses';
import IcuVitalsForm, { EMPTY_ICU_VITALS } from './IcuVitalsForm';
import IcuDispositionPorterFields, {
  buildPorterTransportPayload,
  emptyPorterChecklist,
} from './IcuDispositionPorterFields';
import {
  firstValidationMessage,
  validateIcuDailyRecord,
  validateIcuMortuaryTransfer,
  validateIcuPorterTransport,
} from '../icuWardValidation';

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
  return { ...EMPTY_ICU_VITALS, record_date: todayIsoDate() };
}

export default function IcuPatientWorkspace({
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
  const [assignedGeneralBed, setAssignedGeneralBed] = useState(null);
  const [generalBedsAvailable, setGeneralBedsAvailable] = useState(true);
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
      const data = await getIcuDailyRecords(admission.id);
      setRecords(Array.isArray(data?.records) ? data.records : []);
    } catch {
      setRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  }, [admission?.id]);

  const loadAssignedGeneralBed = useCallback(async () => {
    try {
      const beds = await getAvailableBeds('general');
      const list = Array.isArray(beds) ? beds : [];
      setGeneralBedsAvailable(list.length > 0);
      setAssignedGeneralBed(list[0] || null);
    } catch {
      setGeneralBedsAvailable(false);
      setAssignedGeneralBed(null);
    }
  }, []);

  useEffect(() => {
    loadRecords();
    loadAssignedGeneralBed();
  }, [loadRecords, loadAssignedGeneralBed]);

  const hasTodayRecord = records.some((rec) => rec.record_date === todayIsoDate());

  function porterPayload() {
    return buildPorterTransportPayload({
      equipmentRequired: porterEquipment,
      equipmentNotes: porterEquipmentNotes,
      criticalNotes: porterCriticalNotes,
      checklist: porterChecklist,
    });
  }

  function togglePorterChecklist(id) {
    setPorterChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
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
    const errors = validateIcuDailyRecord(payload);
    setVitalsErrors(errors);
    if (Object.keys(errors).length) {
      onActionError(firstValidationMessage(errors));
      return;
    }

    if (!(await confirmIcuDailySave(patientName))) return;

    setActionLoading(true);
    onActionError('');
    try {
      await saveIcuDailyRecord(admission.id, payload);
      setVitalsErrors({});
      onToast(`Daily ICU record saved for ${patientName}.`);
      await loadRecords();
      await onRefreshQueue();
    } catch (err) {
      onActionError(err.message || 'Could not save daily record');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTransferGeneral() {
    if (!admission?.id) return;
    if (!hasTodayRecord) {
      onActionError("Save today's ICU daily record before requesting transfer.");
      return;
    }
    if (!generalBedsAvailable) {
      onActionError('No general ward beds are currently available.');
      return;
    }

    const porterInput = porterValidationInput();
    const errors = validateIcuPorterTransport(porterInput);
    setPorterErrors(errors);
    if (Object.keys(errors).length) {
      onActionError(firstValidationMessage(errors));
      return;
    }

    const bedLabel = assignedGeneralBed ? bedOptionLabel(assignedGeneralBed) : 'the next available general ward bed';
    if (!(await confirmAction({
      title: 'Transfer to general ward?',
      text: `Request internal porter transport for ${patientName} to ${bedLabel}? The system will assign the bed and the ICU bed will be freed once delivery is complete.`,
      icon: 'question',
      confirmButtonText: 'Request transfer',
    }))) return;

    setActionLoading(true);
    onActionError('');
    try {
      const result = await transferIcuToGeneralWard(admission.id, {
        ...porterPayload(),
      });
      setPorterErrors({});
      const destination = result?.target_bed || bedLabel;
      onToast(`${patientName} — transfer requested to ${destination}. Internal porter notified.`);
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
      onActionError("Save today's ICU daily record before requesting transfer.");
      return;
    }

    const errors = validateIcuMortuaryTransfer({
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
      text: `Register ${patientName} as deceased and request internal porter transport to the mortuary? The ICU bed will be freed once transport is complete.`,
      icon: 'warning',
      confirmButtonText: 'Send to mortuary',
    }))) return;

    setActionLoading(true);
    onActionError('');
    try {
      await transferIcuToMortuary(admission.id, {
        cause_of_death: causeOfDeath.trim(),
        notes: mortuaryNotes.trim() || undefined,
        ...porterPayload(),
      });
      setMortuaryErrors({});
      setPorterErrors({});
      onToast(`${patientName} — mortuary transfer requested. Internal porter notified.`);
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
      <section className={wst.placementCard} aria-labelledby="icu-placement-heading">
        <h3 id="icu-placement-heading" className={wst.placementTitle}>
          ICU placement
        </h3>
        <p className={wst.placementMain}>
          {ward.name || 'ICU'} ({ward.ward_number || '—'})
        </p>
        <p className={wst.placementSub}>
          Room {bed.room_number || '—'} · Bed {bed.bed_number || '—'}
          {admission?.admitted_at
            ? ` · Admitted ${new Date(admission.admitted_at).toLocaleString()}`
            : ''}
        </p>
      </section>

      <section className={wst.sectionPanel} aria-labelledby="icu-patient-heading">
        <h3 id="icu-patient-heading" className={wst.sectionTitle}>
          Patient details
        </h3>
        <dl className={wst.infoGrid}>
          <div>
            <dt className={wst.infoLabel}>Full name</dt>
            <dd className={wst.infoValue}>{patientName}</dd>
          </div>
          <div>
            <dt className={wst.infoLabel}>Patient ID</dt>
            <dd className={wst.infoValue}>{patient.patient_number || '—'}</dd>
          </div>
          <div>
            <dt className={wst.infoLabel}>Sex</dt>
            <dd className={`${wst.infoValue} capitalize`}>{patient.sex || '—'}</dd>
          </div>
          <div>
            <dt className={wst.infoLabel}>Date of birth</dt>
            <dd className={wst.infoValue}>{formatDob(patient.date_of_birth)}</dd>
          </div>
          <div>
            <dt className={wst.infoLabel}>Visit</dt>
            <dd className={wst.infoValue}>
              {visit.visit_number || '—'} ({visit.visit_type || '—'})
            </dd>
          </div>
        </dl>
      </section>

      <section className={wst.sectionPanel} aria-labelledby="icu-vitals-heading">
        <h3 id="icu-vitals-heading" className={wst.sectionTitle}>
          Daily ICU record
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Capture today&apos;s vitals and monitoring, then save. Once saved, the patient is removed from
          today&apos;s ICU queue — you can still request transfer below.
        </p>
        {hasTodayRecord ? (
          <p className="mt-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900">
            Today&apos;s daily record is saved ({todayIsoDate()}).
          </p>
        ) : null}
        <IcuVitalsForm
          vitals={vitals}
          onChange={(updater) => {
            setVitals(updater);
            setVitalsErrors({});
          }}
          idPrefix="icu-daily"
          hideRecordDate
          fieldErrors={vitalsErrors}
          submitButton={hasTodayRecord ? null : (
            <button
              type="button"
              className={wst.btnPrimary}
              disabled={actionLoading}
              onClick={handleSaveRecord}
            >
              {actionLoading ? 'Saving…' : 'Save daily record'}
            </button>
          )}
        />
      </section>

      {recordsLoading ? (
        <p className="text-sm text-slate-500">Loading previous records…</p>
      ) : records.length > 0 ? (
        <section className={wst.sectionPanel} aria-labelledby="icu-history-heading">
          <h3 id="icu-history-heading" className={wst.sectionTitle}>
            Previous daily records
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {records.map((rec) => (
              <li
                key={rec.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <p className="font-semibold text-slate-900">{rec.record_date}</p>
                <p className="mt-1 text-slate-600">
                  HR {rec.heart_rate ?? '—'} · SpO₂ {rec.oxygen_saturation ?? '—'}% · RR{' '}
                  {rec.respiration_rate ?? '—'} · Temp {rec.body_temperature ?? '—'}°C · BP{' '}
                  {rec.blood_pressure_systolic ?? '—'}/{rec.blood_pressure_diastolic ?? '—'}
                </p>
                {rec.recorded_by?.name ? (
                  <p className="mt-1 text-xs text-slate-500">Recorded by {rec.recorded_by.name}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={wst.sectionPanel} aria-labelledby="icu-transfer-heading">
        <h3 id="icu-transfer-heading" className={wst.sectionTitle}>
          Patient disposition
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          After today&apos;s daily record is saved, complete porter transport details and request internal
          transport. The ICU bed and room become available once the porter marks delivery complete.
        </p>
        {!hasTodayRecord ? (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Save today&apos;s daily record before requesting transfer.
          </p>
        ) : null}

        <IcuDispositionPorterFields
          equipmentRequired={porterEquipment}
          onEquipmentRequiredChange={(v) => {
            setPorterEquipment(v);
            setPorterErrors({});
            setMortuaryErrors({});
          }}
          equipmentNotes={porterEquipmentNotes}
          onEquipmentNotesChange={(v) => {
            setPorterEquipmentNotes(v);
            setPorterErrors({});
            setMortuaryErrors({});
          }}
          criticalNotes={porterCriticalNotes}
          onCriticalNotesChange={(v) => {
            setPorterCriticalNotes(v);
            setPorterErrors({});
            setMortuaryErrors({});
          }}
          checklist={porterChecklist}
          onChecklistToggle={(id) => {
            togglePorterChecklist(id);
            setPorterErrors({});
            setMortuaryErrors({});
          }}
          idPrefix="icu-disposition"
          fieldErrors={{ ...porterErrors, ...mortuaryErrors }}
        />

        <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/50 p-4">
          <h4 className="text-sm font-bold text-teal-900">Transfer to general ward</h4>
          {assignedGeneralBed ? (
            <p className="mt-2 text-sm text-slate-700">
              <span className="font-semibold text-teal-900">System-assigned bed: </span>
              {bedOptionLabel(assignedGeneralBed)}
            </p>
          ) : (
            <p className="mt-2 text-sm text-amber-800">
              No general ward beds are currently available. Transfer cannot be requested until a bed is free.
            </p>
          )}
          <button
            type="button"
            className={`${wst.btnPrimary} mt-3`}
            disabled={actionLoading || !generalBedsAvailable || !hasTodayRecord}
            onClick={handleTransferGeneral}
          >
            Request transfer to general ward
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-4">
          <h4 className="text-sm font-bold text-slate-900">Send to mortuary</h4>
          <div className="mt-3 grid gap-3">
            <label className="block text-sm">
              <span className={wst.infoLabel}>Cause of death (required)</span>
              <input
                type="text"
                className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm ${
                  mortuaryErrors.cause_of_death ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-200'
                }`}
                value={causeOfDeath}
                onChange={(e) => {
                  setCauseOfDeath(e.target.value);
                  setMortuaryErrors((prev) => {
                    const next = { ...prev };
                    delete next.cause_of_death;
                    return next;
                  });
                }}
              />
              {mortuaryErrors.cause_of_death ? (
                <p className="mt-1 text-xs text-red-600">{mortuaryErrors.cause_of_death}</p>
              ) : null}
            </label>
            <label className="block text-sm">
              <span className={wst.infoLabel}>Notes (optional)</span>
              <textarea
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                value={mortuaryNotes}
                onChange={(e) => setMortuaryNotes(e.target.value)}
              />
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
