import { useEffect, useState } from 'react';
import { confirmAction } from '../../../utils/confirmAction';
import { allPrescriptionLinesOutOfStock, formatSkippedPharmacyPatientToast } from '../../../utils/pharmacyStockDisplay';
import {
  createConsultation,
  updateConsultation,
  createPrescription,
  getConsultationsByVisit,
  clinicScheduleFollowUp,
  clinicTransferBookingRoom,
  clinicTransferEmergencyUnit,
  clinicDischargePatient,
} from '../../../api/doctor';
import { checkMedicationStock, getMedicationCatalog } from '../../../api/inventory';
import ConsultationMedicalHistoryPanel from '../../../components/patient/ConsultationMedicalHistoryPanel';
import DischargePatientSection from '../../../components/consultation/DischargePatientSection';
import { emptyMedLine, commitMedLineToList, buildPrescriptionItemPayload } from '../../doctor/doctorConsultForm';
import ClinicalTimelinePanel from './ClinicalTimelinePanel';
import ClinicDiagnosisSection from './ClinicDiagnosisSection';
import ClinicDispositionSection from './ClinicDispositionSection';
import {
  emptyClinicDoctorForm,
  isDiagnosisComplete,
  validateDiagnosisField,
  validateFollowUpForm,
  validatePharmacyDisposition,
  validateDischargeDisposition,
} from '../clinicDoctorForm';
import { getIcd10ByCode } from '../../../api/icd10';
import { formatDiagnosisForSave, parseStoredDiagnosis } from '../../../utils/icd10Diagnosis';
import {
  dischargeConfirmText,
  DISCHARGE_CONFIRM_TITLE,
  resolveDischargeDiagnosisForSave,
} from '../../../utils/dischargeDocumentation';

export default function ClinicDoctorWorkspace({
  patient,
  timeline,
  timelineLoading,
  actionLoading,
  setActionLoading,
  onToast,
  onActionError,
  onDone,
}) {
  const [form, setForm] = useState(emptyClinicDoctorForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [consultationId, setConsultationId] = useState(null);
  const [medLine, setMedLine] = useState(emptyMedLine);
  const [prescriptionLines, setPrescriptionLines] = useState([]);
  const [medFieldErrors, setMedFieldErrors] = useState({});
  const [medCatalog, setMedCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [liveStock, setLiveStock] = useState(null);
  const [stockChecking, setStockChecking] = useState(false);

  const diagnosisUnlocked = isDiagnosisComplete(form);

  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    getMedicationCatalog()
      .then((rows) => {
        if (cancelled) return;
        setMedCatalog(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        if (!cancelled) setCatalogError(err.message || 'Could not load medication catalog.');
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const name = medLine.medication_name?.trim();
    const qty = Number(medLine.quantity) || 1;
    if (!name) {
      setLiveStock(null);
      return undefined;
    }
    let cancelled = false;
    setStockChecking(true);
    const timer = setTimeout(() => {
      checkMedicationStock(name, qty)
        .then((data) => { if (!cancelled) setLiveStock(data); })
        .catch(() => { if (!cancelled) setLiveStock(null); })
        .finally(() => { if (!cancelled) setStockChecking(false); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [medLine.medication_name, medLine.quantity]);

  useEffect(() => {
    setForm(emptyClinicDoctorForm());
    setFieldErrors({});
    setConsultationId(null);
    setMedLine(emptyMedLine());
    setPrescriptionLines([]);
    setLiveStock(null);
    setMedFieldErrors({});

    if (!patient?.visitId) return;
    getConsultationsByVisit(patient.visitId)
      .then(async (list) => {
        const latest = Array.isArray(list) ? list[0] : null;
        if (latest?.id) setConsultationId(latest.id);
        if (latest?.diagnosis) {
          const parsed = parseStoredDiagnosis(latest.diagnosis);
          let description = parsed.description;
          if (parsed.code && !description) {
            try {
              const row = await getIcd10ByCode(parsed.code);
              description = row?.description || '';
            } catch {
              description = '';
            }
          }
          setForm((prev) => ({
            ...prev,
            icd10Code: parsed.code,
            icd10Description: description,
          }));
        }
        if (latest?.notes) {
          setForm((prev) => ({ ...prev, notes: latest.notes }));
        }
      })
      .catch(() => {});
  }, [patient?.entryId, patient?.visitId]);

  function handleFieldChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    onActionError('');
  }

  function setMedField(key, value) {
    setMedLine((prev) => ({ ...prev, [key]: value }));
    setMedFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleMedicationSelect(medicationName) {
    const entry = medCatalog.find(
      (c) => c.name === medicationName || c.medication_name === medicationName
    );
    setMedLine((prev) => ({
      ...prev,
      medication_name: medicationName,
      generic_name: entry?.generic || entry?.generic_name || '',
    }));
  }

  function addMedToList() {
    const ok = commitMedLineToList({
      medLine,
      liveStock,
      setPrescriptionLines,
      setMedFieldErrors,
      setMedLine,
      setLiveStock,
    });
    if (!ok) return;
    setFieldErrors((prev) => {
      if (!prev.prescription) return prev;
      const next = { ...prev };
      delete next.prescription;
      return next;
    });
  }

  function removeMedLine(index) {
    setPrescriptionLines((lines) => lines.filter((_, i) => i !== index));
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

  async function ensureConsultation() {
    const payload = {
      diagnosis: formatDiagnosisForSave(form.icd10Code, form.icd10Description),
      notes: form.notes.trim() || null,
    };
    if (consultationId) {
      await updateConsultation(consultationId, payload);
      return consultationId;
    }
    const created = await createConsultation({
      visit_id: patient.visitId,
      ...payload,
    });
    setConsultationId(created.id);
    return created.id;
  }

  function buildPrescriptionItems() {
    return prescriptionLines.map((item) => buildPrescriptionItemPayload(item));
  }

  async function handleSubmitDisposition() {
    if (!patient || actionLoading || !form.disposition) return;

    let validation = {};
    if (form.disposition === 'pharmacy') {
      validation = validatePharmacyDisposition(form, prescriptionLines);
    } else if (form.disposition === 'follow_up') {
      validation = validateFollowUpForm(form);
    } else if (form.disposition === 'booking_room' || form.disposition === 'emergency_unit') {
      validation = validateDiagnosisField(form);
    } else {
      validation = { disposition: 'Select a disposition action.' };
    }

    if (Object.keys(validation).length) {
      setFieldErrors(validation);
      return;
    }

    const allOutOfStock = allPrescriptionLinesOutOfStock(prescriptionLines);

    const confirmTexts = {
      pharmacy: allOutOfStock
        ? `All medications are out of stock. Save the prescription for ${patient.name} without sending them to pharmacy?`
        : `Prescribe medications and route ${patient.name} to Pharmacy?`,
      follow_up: `Schedule follow-up for ${patient.name} on ${form.follow_up_date}?`,
      booking_room: `Transfer ${patient.name} to the Booking Room?`,
      emergency_unit: `Transfer ${patient.name} to the Emergency Unit?`,
    };
    const confirmTitles = {
      pharmacy: allOutOfStock ? 'Save prescription?' : 'Route to Pharmacy?',
      follow_up: 'Schedule follow-up?',
      booking_room: 'Transfer to Booking Room?',
      emergency_unit: 'Transfer to Emergency Unit?',
    };
    if (!(await confirmAction({
      title: confirmTitles[form.disposition],
      text: confirmTexts[form.disposition],
      icon: 'question',
      confirmButtonText: 'Yes, proceed',
    }))) return;

    setActionLoading(true);
    onActionError('');
    setFieldErrors({});

    const items = prescriptionLines.length > 0 ? buildPrescriptionItems() : undefined;

    const diagnosisText = formatDiagnosisForSave(form.icd10Code, form.icd10Description);

    try {
      if (form.disposition === 'pharmacy') {
        const cid = await ensureConsultation();
        const result = await createPrescription({
          visit_id: patient.visitId,
          consultation_id: cid,
          queue_entry_id: patient.entryId,
          items: buildPrescriptionItems(),
        });
        onToast(
          formatSkippedPharmacyPatientToast(patient.name, result)
            || `${patient.name} prescribed and routed to Pharmacy`
        );
        onDone();
        return;
      }

      if (form.disposition === 'follow_up') {
        const result = await clinicScheduleFollowUp({
          visit_id: patient.visitId,
          queue_entry_id: patient.entryId,
          diagnosis: diagnosisText,
          follow_up_date: form.follow_up_date,
          notes: form.notes.trim() || null,
          items,
        });
        const billingNote = result?.routedToBilling
          ? ' Patient sent to billing clerk for payment.'
          : '';
        const rxNote = items?.length
          ? result?.skippedPharmacy
            ? ' Prescription recorded — pharmacy skipped (out of stock).'
            : ' Prescription sent to pharmacy.'
          : '';
        onToast(
          `${patient.name} — follow-up scheduled for ${form.follow_up_date}${rxNote}${billingNote}`
        );
        onDone();
        return;
      }

      if (form.disposition === 'booking_room') {
        const result = await clinicTransferBookingRoom({
          visit_id: patient.visitId,
          queue_entry_id: patient.entryId,
          diagnosis: diagnosisText,
          notes: form.notes.trim() || null,
          items,
          destination_department: form.destination_department || undefined,
          equipment_required: form.equipment_required,
          critical_notes: form.critical_notes?.trim() || null,
          external_porter_notes: form.external_porter_notes?.trim() || null,
          internal_porter_notes: form.internal_porter_notes?.trim() || null,
        });
        onToast(
          items?.length
            ? result?.skippedPharmacy
              ? `${patient.name} — prescription recorded (pharmacy skipped), transferred to Booking Room`
              : `${patient.name} — prescription sent to pharmacy and transferred to Booking Room`
            : `${patient.name} transferred to Booking Room`
        );
        onDone();
        return;
      }

      if (form.disposition === 'emergency_unit') {
        await clinicTransferEmergencyUnit({
          visit_id: patient.visitId,
          queue_entry_id: patient.entryId,
          diagnosis: diagnosisText,
          notes: form.notes.trim() || null,
        });
        onToast(`${patient.name} transferred to Emergency Unit`);
        onDone();
      }
    } catch (err) {
      onActionError(err.message || 'Failed to complete disposition');
    } finally {
      setActionLoading(false);
    }
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
      const result = await clinicDischargePatient({
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
      const billingNote = result?.routedToBilling
        ? ' Patient sent to billing clerk for payment.'
        : '';
      onToast(`${patient.name} — refusal documented, consultation ended${billingNote}`);
      onDone();
    } catch (err) {
      onActionError(err.message || 'Failed to discharge patient');
    } finally {
      setActionLoading(false);
    }
  }

  const hasPrescription = prescriptionLines.length > 0;
  const allOutOfStock = allPrescriptionLinesOutOfStock(prescriptionLines);

  const canSubmitDisposition =
    form.disposition === 'pharmacy'
      ? hasPrescription
      : form.disposition === 'follow_up'
        ? Boolean(form.follow_up_date)
        : form.disposition === 'booking_room'
        || form.disposition === 'emergency_unit';

  return (
    <div className="space-y-4">
      <ConsultationMedicalHistoryPanel
        patientId={patient?.patient?.id}
        visitId={patient?.visitId}
        showStatSummaryButton
      />
      <ClinicalTimelinePanel timeline={timeline} loading={timelineLoading} hideStaff />

      <ClinicDiagnosisSection
        icd10Code={form.icd10Code}
        icd10Description={form.icd10Description}
        notes={form.notes}
        fieldErrors={fieldErrors}
        onIcd10Select={handleIcd10Select}
        onNotesChange={(value) => handleFieldChange('notes', value)}
      />

      <ClinicDispositionSection
        unlocked={diagnosisUnlocked}
        form={form}
        fieldErrors={fieldErrors}
        onDispositionChange={(value) => handleFieldChange('disposition', value)}
        onFollowUpDateChange={(value) => handleFieldChange('follow_up_date', value)}
        onSubmit={handleSubmitDisposition}
        actionLoading={actionLoading}
        canSubmitDisposition={canSubmitDisposition}
        hasPrescription={hasPrescription}
        allOutOfStock={allOutOfStock}
        catalog={medCatalog}
        catalogLoading={catalogLoading}
        catalogError={catalogError}
        medLine={medLine}
        medFieldErrors={medFieldErrors}
        onMedFieldChange={setMedField}
        onMedicationSelect={handleMedicationSelect}
        liveStock={liveStock}
        stockChecking={stockChecking}
        prescriptionLines={prescriptionLines}
        onAddMedToList={addMedToList}
        onRemoveMedLine={removeMedLine}
        patient={patient}
        onFormPatch={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
      />

      <DischargePatientSection
        idPrefix="cd"
        dischargeReason={form.discharge_reason}
        onDischargeReasonChange={(value) => handleFieldChange('discharge_reason', value)}
        error={fieldErrors.discharge_reason}
        actionLoading={actionLoading}
        onDischarge={handleDischarge}
      />
    </div>
  );
}
