import { useState } from 'react';
import { confirmPatientArrival } from '../../../api/ward';
import { confirmIcuArrivalAndSave } from '../../../utils/confirmAction';
import { EQUIPMENT_MODES } from '../../../constants/admitTransportChecklist';
import { wst } from '../styles/wardStaffClasses';
import IcuVitalsForm, { EMPTY_ICU_VITALS } from './IcuVitalsForm';
import { firstValidationMessage, validateIcuDailyRecord } from '../icuWardValidation';

function equipmentLabel(value) {
  return EQUIPMENT_MODES.find((m) => m.value === value)?.label || value || '—';
}

function priorityLabel(p) {
  if (p === 'emergency') return 'Emergency';
  if (p === 'urgent') return 'Urgent';
  return 'Normal';
}

function formatDob(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function todayRecord() {
  return { ...EMPTY_ICU_VITALS, record_date: new Date().toISOString().slice(0, 10) };
}

export default function IcuArrivalWorkspace({
  admission,
  actionLoading,
  setActionLoading,
  onToast,
  onActionError,
  onRefreshQueue,
  onRefreshIcuQueue,
  onDone,
}) {
  const [vitals, setVitals] = useState(todayRecord);
  const [vitalsErrors, setVitalsErrors] = useState({});

  const patient = admission?.patient || {};
  const ward = admission?.ward || {};
  const bed = admission?.bed || {};
  const visit = admission?.visit || {};
  const transport = admission?.transport || {};
  const checklist = Array.isArray(transport?.equipment_checklist) ? transport.equipment_checklist : [];
  const critical = transport?.critical_notes?.trim() || '';

  const patientName = [patient.first_name, patient.last_name].filter(Boolean).join(' ').trim() || 'Patient';

  async function handleConfirmArrivalAndSave() {
    if (!admission?.id) return;

    const payload = { ...vitals, record_date: new Date().toISOString().slice(0, 10) };
    const errors = validateIcuDailyRecord(payload);
    setVitalsErrors(errors);
    if (Object.keys(errors).length) {
      onActionError(firstValidationMessage(errors));
      return;
    }

    if (!(await confirmIcuArrivalAndSave(patientName))) return;

    setActionLoading(true);
    onActionError('');
    try {
      const result = await confirmPatientArrival(admission.id, { icu_record: payload });
      const when = result?.admitted_at
        ? new Date(result.admitted_at).toLocaleString()
        : new Date().toLocaleString();
      onToast(
        `${patientName} — arrival confirmed at ${when}. Bed marked occupied and today's ICU record saved.`
      );
      await Promise.all([
        onRefreshQueue?.(),
        onRefreshIcuQueue?.(),
      ]);
      onDone();
    } catch (err) {
      onActionError(err.message || 'Could not confirm arrival and save record');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <section className={wst.placementCard} aria-labelledby="icu-arr-placement-heading">
        <h3 id="icu-arr-placement-heading" className={wst.placementTitle}>
          ICU placement
        </h3>
        <p className={wst.placementMain}>
          {ward.name || 'ICU'} ({ward.ward_number || '—'})
        </p>
        <p className={wst.placementSub}>
          Room {bed.room_number || '—'} · Bed {bed.bed_number || '—'}
        </p>
        {bed.status === 'reserved' ? (
          <p className="mt-2 text-xs font-semibold text-sky-800">
            Bed reserved — will be marked occupied when you confirm arrival.
          </p>
        ) : null}
      </section>

      <section className={wst.sectionPanel} aria-labelledby="icu-arr-patient-heading">
        <h3 id="icu-arr-patient-heading" className={wst.sectionTitle}>
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
            <dt className={wst.infoLabel}>Phone</dt>
            <dd className={wst.infoValue}>{patient.phone || '—'}</dd>
          </div>
          <div>
            <dt className={wst.infoLabel}>Visit</dt>
            <dd className={wst.infoValue}>
              {visit.visit_number || '—'} ({visit.visit_type || '—'})
            </dd>
          </div>
          {patient.is_emergency ? (
            <div className="sm:col-span-2">
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold uppercase text-red-800">
                Emergency patient
              </span>
            </div>
          ) : null}
        </dl>
      </section>

      {transport?.id ? (
        <section className={wst.sectionPanel} aria-labelledby="icu-arr-transport-heading">
          <h3 id="icu-arr-transport-heading" className={wst.sectionTitle}>
            Transport (porter)
          </h3>
          <dl className={wst.infoGrid}>
            <div>
              <dt className={wst.infoLabel}>From</dt>
              <dd className={wst.infoValue}>{transport.from_location || '—'}</dd>
            </div>
            <div>
              <dt className={wst.infoLabel}>To</dt>
              <dd className={wst.infoValue}>{transport.to_location || '—'}</dd>
            </div>
            <div>
              <dt className={wst.infoLabel}>Priority</dt>
              <dd className={wst.infoValue}>{priorityLabel(transport.priority)}</dd>
            </div>
            <div>
              <dt className={wst.infoLabel}>Mode</dt>
              <dd className={wst.infoValue}>{equipmentLabel(transport.equipment_required)}</dd>
            </div>
          </dl>
          {critical ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Critical notes</p>
              <p className="mt-1 whitespace-pre-wrap">{critical}</p>
            </div>
          ) : null}
          {checklist.length > 0 ? (
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-800">
              {checklist.map((item) => (
                <li key={item.id}>{item.label || item.id}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section className={wst.sectionPanel} aria-labelledby="icu-arr-vitals-heading">
        <h3 id="icu-arr-vitals-heading" className={wst.sectionTitle}>
          Arrival ICU record
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Capture today&apos;s vitals and monitoring, then confirm arrival — everything is saved in one step.
        </p>
        <IcuVitalsForm
          vitals={vitals}
          onChange={(updater) => {
            setVitals(updater);
            setVitalsErrors({});
          }}
          idPrefix="icu-arrival"
          hideRecordDate
          fieldErrors={vitalsErrors}
          submitButton={(
            <button
              type="button"
              className={wst.btnPrimary}
              disabled={actionLoading}
              onClick={handleConfirmArrivalAndSave}
            >
              {actionLoading ? 'Saving…' : 'Confirm arrival & save record'}
            </button>
          )}
        />
      </section>
    </div>
  );
}
