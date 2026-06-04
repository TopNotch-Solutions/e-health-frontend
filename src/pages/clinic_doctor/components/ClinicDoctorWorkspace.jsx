import { useEffect, useState } from 'react';
import { confirmAction } from '../../../utils/confirmAction';
import {
  createConsultation,
  updateConsultation,
  createPrescription,
  getConsultationsByVisit,
  clinicScheduleFollowUp,
  clinicTransferBookingRoom,
  clinicTransferEmergencyUnit,
} from '../../../api/doctor';
import { checkMedicationStock, getMedicationCatalog } from '../../../api/inventory';
import { emptyMedLine } from '../../doctor/doctorConsultForm';
import ClinicalTimelinePanel from './ClinicalTimelinePanel';
import ClinicDiagnosisSection from './ClinicDiagnosisSection';
import ClinicDispositionSection from './ClinicDispositionSection';
import {
  emptyClinicDoctorForm,
  isDiagnosisComplete,
  validateDiagnosisField,
  validateFollowUpForm,
  validatePharmacyDisposition,
} from '../clinicDoctorForm';

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
      .then((list) => {
        const latest = Array.isArray(list) ? list[0] : null;
        if (latest?.id) setConsultationId(latest.id);
        if (latest?.diagnosis) {
          setForm((prev) => ({ ...prev, diagnosis: latest.diagnosis }));
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
    const name = medLine.medication_name.trim();
    const dose = medLine.dosage.trim();
    const errs = {};
    if (!name) errs.medication_name = 'Enter medication name';
    if (!dose) errs.dosage = 'Enter dosage';
    if (Object.keys(errs).length) {
      setMedFieldErrors(errs);
      return;
    }
    const qty = Number(medLine.quantity) || 1;
    const stockSnapshot = liveStock || {
      stock_status: 'out_of_stock',
      stock_label: 'Out of stock',
      quantity_in_stock: 0,
    };
    setPrescriptionLines((lines) => [
      ...lines,
      {
        ...medLine,
        medication_name: name,
        dosage: dose,
        quantity: qty,
        stock_status: stockSnapshot.stock_status,
        stock_label: stockSnapshot.stock_label,
        quantity_in_stock: stockSnapshot.quantity_in_stock,
      },
    ]);
    setMedLine(emptyMedLine());
    setLiveStock(null);
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

  async function ensureConsultation() {
    const payload = {
      diagnosis: form.diagnosis.trim(),
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
    return prescriptionLines.map((item) => ({
      medication_name: item.medication_name,
      dosage: item.dosage,
      frequency: item.frequency || null,
      quantity: item.quantity || 1,
      instructions: item.instructions || null,
    }));
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

    const confirmTexts = {
      pharmacy: `Prescribe medications and route ${patient.name} to Pharmacy?`,
      follow_up: `Schedule follow-up for ${patient.name} on ${form.follow_up_date}?`,
      booking_room: `Transfer ${patient.name} to the Booking Room?`,
      emergency_unit: `Transfer ${patient.name} to the Emergency Unit?`,
    };
    const confirmTitles = {
      pharmacy: 'Route to Pharmacy?',
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

    try {
      if (form.disposition === 'pharmacy') {
        const cid = await ensureConsultation();
        await createPrescription({
          visit_id: patient.visitId,
          consultation_id: cid,
          queue_entry_id: patient.entryId,
          items: buildPrescriptionItems(),
        });
        onToast(`${patient.name} prescribed and routed to Pharmacy`);
        onDone();
        return;
      }

      if (form.disposition === 'follow_up') {
        await clinicScheduleFollowUp({
          visit_id: patient.visitId,
          queue_entry_id: patient.entryId,
          diagnosis: form.diagnosis.trim(),
          follow_up_date: form.follow_up_date,
          notes: form.notes.trim() || null,
          items,
        });
        onToast(
          items?.length
            ? `${patient.name} — prescription sent to pharmacy, follow-up on ${form.follow_up_date}`
            : `${patient.name} — follow-up scheduled for ${form.follow_up_date}`
        );
        onDone();
        return;
      }

      if (form.disposition === 'booking_room') {
        await clinicTransferBookingRoom({
          visit_id: patient.visitId,
          queue_entry_id: patient.entryId,
          diagnosis: form.diagnosis.trim(),
          notes: form.notes.trim() || null,
          items,
        });
        onToast(
          items?.length
            ? `${patient.name} — prescription sent to pharmacy and transferred to Booking Room`
            : `${patient.name} transferred to Booking Room`
        );
        onDone();
        return;
      }

      if (form.disposition === 'emergency_unit') {
        await clinicTransferEmergencyUnit({
          visit_id: patient.visitId,
          queue_entry_id: patient.entryId,
          diagnosis: form.diagnosis.trim(),
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

  const hasPrescription = prescriptionLines.length > 0;

  const canSubmitDisposition =
    form.disposition === 'pharmacy'
      ? hasPrescription
      : form.disposition === 'follow_up'
        ? Boolean(form.follow_up_date)
        : form.disposition === 'booking_room'
        || form.disposition === 'emergency_unit';

  return (
    <div className="space-y-4">
      <ClinicalTimelinePanel timeline={timeline} loading={timelineLoading} />

      <ClinicDiagnosisSection
        diagnosis={form.diagnosis}
        notes={form.notes}
        fieldErrors={fieldErrors}
        onDiagnosisChange={(value) => handleFieldChange('diagnosis', value)}
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
      />
    </div>
  );
}
