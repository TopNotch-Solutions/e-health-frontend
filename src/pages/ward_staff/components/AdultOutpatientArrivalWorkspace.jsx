import { useState } from 'react';
import { confirmPatientArrival } from '../../../api/ward';
import { confirmAdultOutpatientArrivalAndSave } from '../../../utils/confirmAction';
import { wst } from '../styles/wardStaffClasses';
import AdultOutpatientVitalsForm, { EMPTY_AO_VITALS } from './AdultOutpatientVitalsForm';
import { firstValidationMessage, validateAdultOutpatientDailyRecord } from '../adultOutpatientWardValidation';

function formatDob(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function todayRecord() {
  return { ...EMPTY_AO_VITALS, record_date: new Date().toISOString().slice(0, 10) };
}

export default function AdultOutpatientArrivalWorkspace({
  admission,
  actionLoading,
  setActionLoading,
  onToast,
  onActionError,
  onRefreshQueue,
  onRefreshInWardQueue,
  onDone,
}) {
  const [vitals, setVitals] = useState(() => todayRecord());
  const [vitalsErrors, setVitalsErrors] = useState({});

  const patient = admission?.patient || {};
  const ward = admission?.ward || {};
  const bed = admission?.bed || {};
  const visit = admission?.visit || {};
  const patientName = [patient.first_name, patient.last_name].filter(Boolean).join(' ').trim() || 'Patient';

  async function handleConfirmArrivalAndSave() {
    if (!admission?.id) return;

    const payload = { ...vitals, record_date: new Date().toISOString().slice(0, 10) };
    const errors = validateAdultOutpatientDailyRecord(payload);
    setVitalsErrors(errors);
    if (Object.keys(errors).length) {
      onActionError(firstValidationMessage(errors));
      return;
    }

    if (!(await confirmAdultOutpatientArrivalAndSave(patientName))) return;

    setActionLoading(true);
    onActionError('');
    try {
      await confirmPatientArrival(admission.id, { adult_outpatient_record: payload });
      onToast(`${patientName} — arrival confirmed. Bed occupied and today's record saved.`);
      await Promise.all([onRefreshQueue?.(), onRefreshInWardQueue?.()]);
      onDone();
    } catch (err) {
      onActionError(err.message || 'Could not confirm arrival and save record');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <section className={wst.placementCard}>
        <h3 className={wst.placementTitle}>Adult outpatient placement</h3>
        <p className={wst.placementMain}>{ward.name || 'Adult outpatient'} ({ward.ward_number || '—'})</p>
        <p className={wst.placementSub}>Room {bed.room_number || '—'} · Bed {bed.bed_number || '—'}</p>
      </section>

      <section className={wst.sectionPanel}>
        <h3 className={wst.sectionTitle}>Patient details</h3>
        <dl className={wst.infoGrid}>
          <div><dt className={wst.infoLabel}>Full name</dt><dd className={wst.infoValue}>{patientName}</dd></div>
          <div><dt className={wst.infoLabel}>Patient ID</dt><dd className={wst.infoValue}>{patient.patient_number || '—'}</dd></div>
          <div><dt className={wst.infoLabel}>Sex</dt><dd className={`${wst.infoValue} capitalize`}>{patient.sex || '—'}</dd></div>
          <div><dt className={wst.infoLabel}>Date of birth</dt><dd className={wst.infoValue}>{formatDob(patient.date_of_birth)}</dd></div>
          <div><dt className={wst.infoLabel}>Visit</dt><dd className={wst.infoValue}>{visit.visit_number || '—'}</dd></div>
        </dl>
      </section>

      <section className={wst.sectionPanel}>
        <h3 className={wst.sectionTitle}>Arrival record</h3>
        <p className="mt-1 text-sm text-slate-600">Capture vitals and confirm arrival — saved in one step.</p>
        <AdultOutpatientVitalsForm
          vitals={vitals}
          onChange={(updater) => { setVitals(updater); setVitalsErrors({}); }}
          idPrefix="ao-arrival"
          hideRecordDate
          fieldErrors={vitalsErrors}
          submitButton={(
            <button type="button" className={wst.btnPrimary} disabled={actionLoading} onClick={handleConfirmArrivalAndSave}>
              {actionLoading ? 'Saving…' : 'Confirm arrival & save record'}
            </button>
          )}
        />
      </section>
    </div>
  );
}
