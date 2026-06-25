import { useEffect, useMemo, useState } from 'react';
import { confirmAction } from '../../../utils/confirmAction';
import { getMedicationCatalog, checkMedicationStock } from '../../../api/inventory';
import {
  emergencyDoctorTransferBookingRoom,
  emergencyDoctorPrescribePharmacy,
  emergencyDoctorDischargePatient,
} from '../../../api/emergencyUnit';
import { IntakeSelect } from '../../nurse/components/IntakeField';
import HospitalReferralFields from '../../../components/hospital/HospitalReferralFields';
import { submitButtonClass } from '../../nurse/utils/submitButtonClasses';
import DoctorPrescriptionSection from '../../doctor/components/DoctorPrescriptionSection';
import NurseReadOnlyIntakeCards from '../../doctor/components/NurseReadOnlyIntakeCards';
import { emptyMedLine, vitalsToIntakeForm } from '../../doctor/doctorConsultForm';
import { buildDoctorPrescriptionLine } from '../../../utils/pharmacyStockDisplay';
import ClinicalTimelinePanel from '../../clinic_doctor/components/ClinicalTimelinePanel';
import ConsultationMedicalHistoryPanel from '../../../components/patient/ConsultationMedicalHistoryPanel';
import DischargePatientSection from '../../../components/consultation/DischargePatientSection';
import ClinicDiagnosisSection from '../../clinic_doctor/components/ClinicDiagnosisSection';
import {
  emptyEmergencyDoctorForm,
  EU_DOCTOR_DISPOSITIONS,
  isDiagnosisComplete,
  validateDiagnosisField,
  validatePharmacyDisposition,
  validateDischargeDisposition,
  dispositionButtonLabel,
  dispositionShowsPrescription,
  dispositionRequiresPrescription,
} from '../emergencyUnitDoctorForm';
import { formatDiagnosisForSave } from '../../../utils/icd10Diagnosis';
import {
  dischargeConfirmText,
  DISCHARGE_CONFIRM_TITLE,
  resolveDischargeDiagnosisForSave,
} from '../../../utils/dischargeDocumentation';

const DISPOSITION_BTN_VARIANT = {
  pharmacy: 'primary',
  booking_room: 'amber',
};

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 10h-1V7a4 4 0 10-8 0v3H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2zm-3 0h-4V7a2 2 0 114 0v3z" />
    </svg>
  );
}

export default function EmergencyUnitDoctorWorkspace({
  patient,
  timeline,
  timelineLoading,
  actionLoading,
  setActionLoading,
  onToast,
  onActionError,
  onDone,
}) {
  const [form, setForm] = useState(emptyEmergencyDoctorForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [medLine, setMedLine] = useState(emptyMedLine);
  const [prescriptionLines, setPrescriptionLines] = useState([]);
  const [medFieldErrors, setMedFieldErrors] = useState({});
  const [medCatalog, setMedCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [liveStock, setLiveStock] = useState(null);
  const [stockChecking, setStockChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    getMedicationCatalog()
      .then((rows) => { if (!cancelled) setMedCatalog(Array.isArray(rows) ? rows : []); })
      .catch((err) => { if (!cancelled) setCatalogError(err.message || 'Could not load catalog'); })
      .finally(() => { if (!cancelled) setCatalogLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const name = medLine.medication_name?.trim();
    if (!name) { setLiveStock(null); return undefined; }
    let cancelled = false;
    setStockChecking(true);
    const timer = setTimeout(() => {
      checkMedicationStock(name, Number(medLine.quantity) || 1)
        .then((data) => { if (!cancelled) setLiveStock(data); })
        .finally(() => { if (!cancelled) setStockChecking(false); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [medLine.medication_name, medLine.quantity]);

  useEffect(() => {
    setForm(emptyEmergencyDoctorForm());
    setPrescriptionLines([]);
    setMedLine(emptyMedLine());
    setFieldErrors({});
  }, [patient?.entryId]);

  const diagnosisUnlocked = isDiagnosisComplete(form);
  const hasPrescription = prescriptionLines.length > 0;
  const showPrescription = dispositionShowsPrescription(form.disposition);
  const prescriptionRequired = dispositionRequiresPrescription(form.disposition);

  function buildItems() {
    return prescriptionLines.map((item) => ({
      medication_name: item.medication_name,
      dosage: item.dosage,
      frequency: item.frequency || null,
      quantity: item.quantity || 1,
      instructions: item.instructions || null,
    }));
  }

  function handleIcd10Select({ code, description }) {
    setForm((prev) => ({
      ...prev,
      icd10Code: code,
      icd10Description: description,
    }));
    setFieldErrors((prev) => {
      if (!prev.icd10Code) return prev;
      const next = { ...prev };
      delete next.icd10Code;
      return next;
    });
    onActionError('');
  }

  async function handleDischarge() {
    if (!patient || actionLoading) return;

    const validation = validateDischargeDisposition(form);
    if (Object.keys(validation).length) {
      setFieldErrors(validation);
      return;
    }

    if (!(await confirmAction({
      title: DISCHARGE_CONFIRM_TITLE,
      text: dischargeConfirmText(patient.name),
      icon: 'warning',
      confirmButtonText: 'End consultation',
    }))) return;

    setActionLoading(true);
    onActionError('');
    setFieldErrors({});

    try {
      await emergencyDoctorDischargePatient({
        visit_id: patient.visitId,
        queue_entry_id: patient.entryId,
        diagnosis: resolveDischargeDiagnosisForSave(
          form.icd10Code,
          form.icd10Description,
          formatDiagnosisForSave
        ),
        discharge_reason: form.discharge_reason.trim(),
        notes: form.notes.trim() || null,
      });
      onToast(`${patient.name} — refusal documented, consultation ended`);
      onDone();
    } catch (err) {
      onActionError(err.message || 'Failed to end consultation');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSubmitDisposition() {
    if (!patient || actionLoading || !form.disposition) return;

    let validation = {};
    if (form.disposition === 'pharmacy') {
      validation = validatePharmacyDisposition(form, prescriptionLines);
    } else if (form.disposition === 'booking_room') {
      validation = validateDiagnosisField(form);
    }

    if (Object.keys(validation).length) {
      setFieldErrors(validation);
      return;
    }

    const confirmText = form.disposition === 'pharmacy'
      ? `Prescribe medications and route ${patient.name} to Pharmacy?`
      : `Transfer ${patient.name} to the Booking Room?`;
    if (!(await confirmAction({
      title: form.disposition === 'pharmacy' ? 'Route to Pharmacy?' : 'Transfer to Booking Room?',
      text: confirmText,
      icon: 'question',
      confirmButtonText: 'Yes, proceed',
    }))) return;

    setActionLoading(true);
    onActionError('');
    setFieldErrors({});

    const payload = {
      visit_id: patient.visitId,
      queue_entry_id: patient.entryId,
      diagnosis: formatDiagnosisForSave(form.icd10Code, form.icd10Description),
      notes: form.notes.trim() || null,
      destination_department: form.destination_department || undefined,
      equipment_required: form.equipment_required,
      critical_notes: form.critical_notes?.trim() || null,
      external_porter_notes: form.external_porter_notes?.trim() || null,
      internal_porter_notes: form.internal_porter_notes?.trim() || null,
    };

    try {
      if (form.disposition === 'pharmacy') {
        await emergencyDoctorPrescribePharmacy({ ...payload, items: buildItems() });
        onToast(`${patient.name} prescribed and routed to Pharmacy`);
      } else {
        const items = hasPrescription ? buildItems() : undefined;
        await emergencyDoctorTransferBookingRoom({ ...payload, items });
        onToast(
          items?.length
            ? `${patient.name} — Rx to pharmacy & transferred to Booking Room`
            : `${patient.name} transferred to Booking Room`
        );
      }
      onDone();
    } catch (err) {
      onActionError(err.message || 'Failed to complete disposition');
    } finally {
      setActionLoading(false);
    }
  }

  const canSubmit =
    form.disposition === 'pharmacy'
      ? hasPrescription
      : form.disposition === 'booking_room';

  const intakeForm = useMemo(
    () => vitalsToIntakeForm(patient?.vitals || timeline?.vitals),
    [patient?.vitals, timeline?.vitals]
  );

  return (
    <div className="space-y-4">
      <ConsultationMedicalHistoryPanel
        patientId={patient?.patient?.id}
        showStatSummaryButton
      />
      <NurseReadOnlyIntakeCards form={intakeForm} idPrefix="eu-doc" />
      <ClinicalTimelinePanel timeline={timeline} loading={timelineLoading} />
      <ClinicDiagnosisSection
        icd10Code={form.icd10Code}
        icd10Description={form.icd10Description}
        notes={form.notes}
        fieldErrors={fieldErrors}
        onIcd10Select={handleIcd10Select}
        onNotesChange={(v) => setForm((prev) => ({ ...prev, notes: v }))}
      />

      <section className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Disposition &amp; routing</h3>
        <p className="mt-1 text-sm text-slate-500">
          Route to pharmacy only, or transfer to Booking Room for final administrative disposition.
          Medications are optional when sending to Booking Room.
        </p>

        {!diagnosisUnlocked ? (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <LockIcon />
            <span>Complete the ICD-10 diagnosis above to unlock disposition controls.</span>
          </div>
        ) : null}

        <div className={`mt-4 space-y-4 ${diagnosisUnlocked ? '' : 'pointer-events-none opacity-50'}`}>
          <IntakeSelect
            id="eud-disposition"
            label="Disposition action"
            error={fieldErrors.disposition}
            className={c.select}
            value={form.disposition}
            disabled={!diagnosisUnlocked}
            onChange={(e) => setForm((prev) => ({ ...prev, disposition: e.target.value }))}
          >
            <option value="">Select disposition…</option>
            {EU_DOCTOR_DISPOSITIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </IntakeSelect>

          {form.disposition === 'booking_room' ? (
            <HospitalReferralFields
              visitId={patient?.visitId}
              sourceRole="emergency_unit_doctor"
              form={form}
              onChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
              fieldErrors={fieldErrors}
            />
          ) : null}

          {showPrescription ? (
            <>
              {!prescriptionRequired ? (
                <p className="text-sm text-slate-600">
                  Optional: add medications to also send a prescription to the pharmacy.
                </p>
              ) : null}
              <DoctorPrescriptionSection
                catalog={medCatalog}
                catalogLoading={catalogLoading}
                catalogError={catalogError}
                medLine={medLine}
                medFieldErrors={medFieldErrors}
                onMedFieldChange={(key, value) => {
                  setMedLine((prev) => ({ ...prev, [key]: value }));
                  setMedFieldErrors((prev) => {
                    if (!prev[key]) return prev;
                    const next = { ...prev };
                    delete next[key];
                    return next;
                  });
                }}
                onMedicationSelect={(name) => setMedLine((prev) => ({ ...prev, medication_name: name }))}
                liveStock={liveStock}
                stockChecking={stockChecking}
                prescriptionLines={prescriptionLines}
                onAddMedToList={() => {
                  if (!medLine.medication_name?.trim()) {
                    setMedFieldErrors({ medication_name: 'Required' });
                    return;
                  }
                  setPrescriptionLines((lines) => [
                    ...lines,
                    buildDoctorPrescriptionLine(medLine, liveStock),
                  ]);
                  setMedLine(emptyMedLine());
                  setLiveStock(null);
                }}
                onRemoveMedLine={(i) => setPrescriptionLines((lines) => lines.filter((_, idx) => idx !== i))}
                actionLoading={actionLoading}
                onSendToPharmacy={() => {}}
                hideSubmitButton
              />
            </>
          ) : null}

          {fieldErrors.prescription ? (
            <p className={c.fieldError} role="alert">{fieldErrors.prescription}</p>
          ) : null}

          {form.disposition ? (
            <button
              type="button"
              className={submitButtonClass(DISPOSITION_BTN_VARIANT[form.disposition] || 'primary')}
              disabled={!diagnosisUnlocked || actionLoading || !canSubmit}
              onClick={handleSubmitDisposition}
            >
              {dispositionButtonLabel(form, actionLoading, hasPrescription)}
            </button>
          ) : (
            <p className={c.hint}>Choose a disposition action above to continue.</p>
          )}
        </div>
      </section>

      <DischargePatientSection
        idPrefix="eud"
        dischargeReason={form.discharge_reason}
        onDischargeReasonChange={(value) => setForm((prev) => ({ ...prev, discharge_reason: value }))}
        error={fieldErrors.discharge_reason}
        actionLoading={actionLoading}
        onDischarge={handleDischarge}
      />
    </div>
  );
}
