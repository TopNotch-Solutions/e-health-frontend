import { useEffect, useMemo, useState } from 'react';
import {
  admitPatient,
  createConsultation,
  updateConsultation,
  createPrescription,
  createLabOrder,
  createSonarReferral,
  dischargeVisit,
  getAvailableBeds,
  getConsultationsByVisit,
} from '../../../api/doctor';
import { completeQueueEntry } from '../../../api/queue';
import { checkMedicationStock, getMedicationCatalog } from '../../../api/inventory';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import { IntakeSelect, IntakeTextarea } from '../../nurse/components/IntakeField';
import { vitalsToIntakeForm, emptyMedLine } from '../doctorConsultForm';
import DoctorConsultationForm, { ICD_PRESETS } from './DoctorConsultationForm';
import {
  ADMIT_TRANSPORT_CHECKLIST_OPTIONS,
  EQUIPMENT_MODES,
} from '../../../constants/admitTransportChecklist';
import { DIET_TYPES } from '../../../constants/dietTypes';
import { confirmAction } from '../../../utils/confirmAction';

function parseStoredDiagnoses(diagnosisText) {
  if (!diagnosisText || typeof diagnosisText !== 'string') return [];
  return diagnosisText
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^([A-Z]\d{2}(?:\.\d+)?)\s*[—–-]\s*(.+)$/i);
      if (m) return { code: m[1].toUpperCase(), label: m[2].trim() };
      return null;
    })
    .filter(Boolean);
}

export default function DoctorWorkspace({
  patient,
  actionLoading,
  setActionLoading,
  onToast,
  onActionError,
  onDone,
}) {
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnoses, setDiagnoses] = useState([]);
  const [icdInput, setIcdInput] = useState('');
  const [consultationId, setConsultationId] = useState(null);
  const [medLine, setMedLine] = useState(emptyMedLine);
  const [prescriptionLines, setPrescriptionLines] = useState([]);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [beds, setBeds] = useState([]);
  const [selectedBedId, setSelectedBedId] = useState('');
  const [admitCriticalNotes, setAdmitCriticalNotes] = useState('');
  const [admitEquipmentMode, setAdmitEquipmentMode] = useState('wheelchair');
  const [admitEquipmentNotes, setAdmitEquipmentNotes] = useState('');
  const [admitChecklist, setAdmitChecklist] = useState(() =>
    Object.fromEntries(ADMIT_TRANSPORT_CHECKLIST_OPTIONS.map((o) => [o.id, false]))
  );
  const [admitDietType, setAdmitDietType] = useState('');
  const [admitDietDescription, setAdmitDietDescription] = useState('');
  const [admitDietRestrictions, setAdmitDietRestrictions] = useState('');
  const [admitDietSpecialInstructions, setAdmitDietSpecialInstructions] = useState('');
  const [medFieldErrors, setMedFieldErrors] = useState({});
  const [diagnosisErrors, setDiagnosisErrors] = useState({});
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [labClinicalNotes, setLabClinicalNotes] = useState('');
  const [labEmergency, setLabEmergency] = useState(false);
  const [labError, setLabError] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  const [sonarSymptoms, setSonarSymptoms] = useState('');
  const [sonarDiagnosticQuestions, setSonarDiagnosticQuestions] = useState('');
  const [sonarPrepInstructions, setSonarPrepInstructions] = useState('');
  const [sonarEmergency, setSonarEmergency] = useState(false);
  const [sonarError, setSonarError] = useState('');
  const [medCatalog, setMedCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [liveStock, setLiveStock] = useState(null);
  const [stockChecking, setStockChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    setCatalogError('');
    getMedicationCatalog()
      .then((rows) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        setMedCatalog(list);
        if (list.length === 0) {
          setCatalogError('No medications in catalog. Run backend migration and medication catalog seed.');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setMedCatalog([]);
          setCatalogError(err.message || 'Could not load medication catalog.');
        }
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
        .then((data) => {
          if (!cancelled) setLiveStock(data);
        })
        .catch(() => {
          if (!cancelled) setLiveStock(null);
        })
        .finally(() => {
          if (!cancelled) setStockChecking(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [medLine.medication_name, medLine.quantity]);

  useEffect(() => {
    if (!showAdmitModal) return;
    setAdmitCriticalNotes('');
    setAdmitEquipmentMode('wheelchair');
    setAdmitEquipmentNotes('');
    setAdmitChecklist(
      Object.fromEntries(ADMIT_TRANSPORT_CHECKLIST_OPTIONS.map((o) => [o.id, false]))
    );
    setSelectedBedId('');
  }, [showAdmitModal]);

  const intakeForm = useMemo(
    () => vitalsToIntakeForm(patient?.vitals),
    [patient?.vitals, patient?.entryId]
  );

  useEffect(() => {
    setClinicalNotes('');
    setDiagnoses([]);
    setIcdInput('');
    setConsultationId(null);
    setMedLine(emptyMedLine());
    setPrescriptionLines([]);
    setLiveStock(null);
    setMedFieldErrors({});
    setDiagnosisErrors({});
    setSelectedLabTests([]);
    setLabClinicalNotes('');
    setLabEmergency(Boolean(patient?.isEmergency));
    setLabError('');
    setSelectedScan(null);
    setSonarSymptoms('');
    setSonarDiagnosticQuestions('');
    setSonarPrepInstructions('');
    setSonarEmergency(Boolean(patient?.isEmergency));
    setSonarError('');

    if (!patient?.visitId) return;
    getConsultationsByVisit(patient.visitId)
      .then((list) => {
        const latest = Array.isArray(list) ? list[0] : null;
        if (latest?.id) setConsultationId(latest.id);
        if (latest?.notes) setClinicalNotes(latest.notes);
        const restored = parseStoredDiagnoses(latest?.diagnosis);
        if (restored.length) setDiagnoses(restored);
        else if (latest?.diagnosis?.trim()) setIcdInput(latest.diagnosis.trim());
      })
      .catch(() => {});
  }, [patient?.entryId, patient?.visitId]);

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
    setMedFieldErrors((prev) => {
      if (!prev.medication_name) return prev;
      const next = { ...prev };
      delete next.medication_name;
      return next;
    });
  }

  function clearDiagnosisError(key) {
    setDiagnosisErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  /** Must have ICD/diagnosis text or structured tags, plus clinical notes, before pharmacy / admit / discharge. */
  function validateDiagnosisImpression() {
    const errs = {};
    if (!icdInput.trim() && diagnoses.length === 0) {
      errs.icd = 'Enter an ICD-10 code or clinical impression.';
    }
    if (!clinicalNotes.trim()) {
      errs.clinicalNotes = 'Enter clinical notes and treatment plan.';
    }
    setDiagnosisErrors(errs);
    if (Object.keys(errs).length > 0) {
      document.getElementById('doc-diagnosis-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return false;
    }
    return true;
  }

  function tryAddIcd() {
    const raw = icdInput.trim();
    if (!raw) return;
    clearDiagnosisError('icd');
    clearDiagnosisError('diagnoses');
    const fromPreset = ICD_PRESETS.find(
      (p) =>
        raw.toLowerCase() === p.code.toLowerCase() ||
        raw.toLowerCase() === `${p.code} - ${p.label}`.toLowerCase() ||
        p.label.toLowerCase().includes(raw.toLowerCase())
    );
    if (fromPreset) {
      if (!diagnoses.some((d) => d.code === fromPreset.code)) {
        setDiagnoses((d) => [...d, fromPreset]);
      }
      setIcdInput('');
      return;
    }
    const m = raw.match(/^([A-Z]\d{2}(?:\.\d+)?)\s*[-–]\s*(.+)$/i);
    if (m) {
      const code = m[1].toUpperCase();
      const label = m[2].trim();
      if (!diagnoses.some((d) => d.code === code)) setDiagnoses((d) => [...d, { code, label }]);
      setIcdInput('');
    }
  }

  function removeDiagnosis(code) {
    setDiagnoses((d) => d.filter((x) => x.code !== code));
    clearDiagnosisError('diagnoses');
    clearDiagnosisError('icd');
  }

  function buildDiagnosisForSave() {
    const tagPart = diagnoses.map((d) => `${d.code} — ${d.label}`).join('; ');
    const free = icdInput.trim();
    if (tagPart && free) return `${tagPart}; ${free}`;
    return tagPart || free || null;
  }

  async function ensureConsultation() {
    const diagnosis = buildDiagnosisForSave();
    const payload = {
      diagnosis: diagnosis || null,
      notes: clinicalNotes || null,
      actions_taken: JSON.stringify({ nurse_intake: intakeForm }),
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

  function addMedToList() {
    const name = medLine.medication_name.trim();
    const dose = medLine.dosage.trim();
    if (!name && !dose) return;

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
        generic_name: medLine.generic_name?.trim() || '',
        dosage: dose,
        quantity: qty,
        stock_status: stockSnapshot.stock_status,
        stock_label: stockSnapshot.stock_label,
        quantity_in_stock: stockSnapshot.quantity_in_stock,
        reorder_level: stockSnapshot.reorder_level,
        can_dispense: stockSnapshot.can_dispense,
      },
    ]);
    setMedLine(emptyMedLine());
    setLiveStock(null);
  }

  function removeMedLine(index) {
    setPrescriptionLines((lines) => lines.filter((_, i) => i !== index));
  }

  async function finishConsultation(toastMessage) {
    await completeQueueEntry(patient.entryId, {});
    if (toastMessage) onToast(toastMessage);
    onDone();
  }

  function toggleLabTest(test) {
    setLabError('');
    setSelectedLabTests((prev) => {
      const exists = prev.some((t) => t.id === test.id);
      if (exists) return prev.filter((t) => t.id !== test.id);
      return [...prev, { id: test.id, name: test.name, sampleType: test.sampleType || null }];
    });
  }

  async function handleSendToSonar() {
    if (!selectedScan) return;
    if (!validateDiagnosisImpression()) return;
    if (!(await confirmAction({
      title: 'Send to ultrasound?',
      text: `Refer ${patient.name} to ultrasound (${selectedScan.name})? The patient will leave your queue.`,
      icon: 'warning',
      confirmButtonText: 'Send to ultrasound',
    }))) return;

    setActionLoading(true);
    onActionError('');
    setSonarError('');
    try {
      await ensureConsultation();
      await createSonarReferral({
        visit_id: patient.visitId,
        queue_entry_id: patient.entryId,
        scan_type: selectedScan.name,
        scan_id: selectedScan.id,
        symptoms: sonarSymptoms.trim() || null,
        diagnostic_questions: sonarDiagnosticQuestions.trim() || null,
        prep_instructions: sonarPrepInstructions.trim() || null,
        clinical_notes: clinicalNotes.trim() || null,
        is_emergency: sonarEmergency,
      });
      setSelectedScan(null);
      setSonarSymptoms('');
      setSonarDiagnosticQuestions('');
      setSonarPrepInstructions('');
      onToast('Patient referred to ultrasound — removed from your queue');
      onDone();
    } catch (err) {
      const msg = err.message || 'Failed to send to ultrasound';
      setSonarError(msg);
      onActionError(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSendToLab() {
    if (selectedLabTests.length === 0) return;
    if (!validateDiagnosisImpression()) return;
    if (!(await confirmAction({
      title: 'Send to laboratory?',
      text: prescriptionLines.length > 0
        ? `Send ${patient.name} to the lab and queue prescription for pharmacy?`
        : `Send ${patient.name} to the laboratory? The patient will leave your queue.`,
      icon: 'warning',
      confirmButtonText: 'Send to lab',
    }))) return;

    setActionLoading(true);
    onActionError('');
    setLabError('');
    try {
      const cid = await ensureConsultation();
      const payload = {
        visit_id: patient.visitId,
        queue_entry_id: patient.entryId,
        tests: selectedLabTests,
        clinical_notes: labClinicalNotes.trim() || null,
        is_emergency: labEmergency,
      };
      if (prescriptionLines.length > 0) {
        payload.consultation_id = cid;
        payload.items = prescriptionLines.map((item) => ({
          medication_name: item.medication_name,
          dosage: item.dosage,
          frequency: item.frequency || null,
          quantity: item.quantity || 1,
          instructions: item.instructions || null,
        }));
      }
      await createLabOrder(payload);
      setSelectedLabTests([]);
      setLabClinicalNotes('');
      if (prescriptionLines.length > 0) {
        setPrescriptionLines([]);
        setMedLine(emptyMedLine());
      }
      onToast(
        prescriptionLines.length > 0
          ? 'Patient sent to laboratory and prescription queued for pharmacy'
          : 'Patient sent to laboratory — removed from your queue'
      );
      onDone();
    } catch (err) {
      const msg = err.message || 'Failed to send to laboratory';
      setLabError(msg);
      onActionError(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSendToPharmacy() {
    if (prescriptionLines.length === 0) return;
    if (!validateDiagnosisImpression()) return;
    if (!(await confirmAction({
      title: 'Send to pharmacy?',
      text: `Send prescription for ${patient.name} to the pharmacy and complete this consultation?`,
      icon: 'warning',
      confirmButtonText: 'Send to pharmacy',
    }))) return;

    setActionLoading(true);
    onActionError('');
    try {
      const cid = await ensureConsultation();
      const result = await createPrescription({
        visit_id: patient.visitId,
        consultation_id: cid,
        queue_entry_id: patient.entryId,
        items: prescriptionLines.map((item) => ({
          medication_name: item.medication_name,
          dosage: item.dosage,
          frequency: item.frequency || null,
          quantity: item.quantity || 1,
          instructions: item.instructions || null,
        })),
      });
      setPrescriptionLines([]);
      setMedLine(emptyMedLine());
      setLiveStock(null);

      const alerts = result?.lowStockAlerts || [];
      const outCount = alerts.filter((a) => a.stock_status === 'out_of_stock').length;
      const lowCount = alerts.filter((a) => a.stock_status === 'low_stock').length;
      let msg = 'Prescription sent to pharmacy — consultation completed';
      if (outCount) msg += ` ${outCount} medication(s) out of stock.`;
      if (lowCount) msg += ` ${lowCount} low stock.`;
      onToast(msg);
      onDone();
    } catch (err) {
      onActionError(err.message || 'Failed to send to pharmacy');
    } finally {
      setActionLoading(false);
    }
  }

  async function openAdmitModal() {
    if (!validateDiagnosisImpression()) return;

    setActionLoading(true);
    onActionError('');
    try {
      const list = await getAvailableBeds();
      setBeds(Array.isArray(list) ? list : []);
      setSelectedBedId('');
      setShowAdmitModal(true);
    } catch (err) {
      onActionError(err.message || 'Could not load available beds');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAdmit() {
    if (!selectedBedId) {
      onActionError('Select a bed to admit the patient.');
      return;
    }
    if (!(await confirmAction({
      title: 'Admit patient?',
      text: `Admit ${patient.name} to the selected bed and complete this consultation?`,
      icon: 'warning',
      confirmButtonText: 'Admit patient',
    }))) return;
    setActionLoading(true);
    onActionError('');
    try {
      await ensureConsultation();
      const equipment_checklist = ADMIT_TRANSPORT_CHECKLIST_OPTIONS.map((opt) => ({
        id: opt.id,
        checked: Boolean(admitChecklist[opt.id]),
      }));
      const admitBody = {
        visit_id: patient.visitId,
        bed_id: selectedBedId,
        equipment_required: admitEquipmentMode,
        equipment_notes: admitEquipmentNotes.trim() || null,
        critical_notes: admitCriticalNotes.trim() || null,
        equipment_checklist,
      };
      if (admitDietType) {
        admitBody.diet_type = admitDietType;
        admitBody.diet_description = admitDietDescription.trim() || null;
        admitBody.diet_restrictions = admitDietRestrictions.trim() || null;
        admitBody.diet_special_instructions = admitDietSpecialInstructions.trim() || null;
      }
      await admitPatient(admitBody);
      setShowAdmitModal(false);
      setAdmitDietType('');
      setAdmitDietDescription('');
      setAdmitDietRestrictions('');
      setAdmitDietSpecialInstructions('');
      const dietNote = admitDietType ? ' Diet sent to kitchen with ward location.' : '';
      await finishConsultation(`${patient.name} admitted — consultation completed.${dietNote}`);
    } catch (err) {
      onActionError(err.message || 'Failed to admit patient');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDischarge() {
    if (!validateDiagnosisImpression()) return;
    if (!(await confirmAction({
      title: 'Discharge patient?',
      text: `Discharge ${patient.name} and complete this consultation?`,
      icon: 'warning',
      confirmButtonText: 'Discharge',
    }))) return;

    setActionLoading(true);
    onActionError('');
    try {
      await ensureConsultation();
      await dischargeVisit(patient.visitId, {
        discharge_notes: clinicalNotes || null,
      });
      await finishConsultation(`${patient.name} discharged — consultation completed`);
    } catch (err) {
      onActionError(err.message || 'Failed to discharge patient');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <>
      <DoctorConsultationForm
        intakeForm={intakeForm}
        allergy={patient.allergy}
        icdInput={icdInput}
        onIcdInputChange={(value) => {
          setIcdInput(value);
          if (value.trim()) {
            clearDiagnosisError('icd');
            clearDiagnosisError('diagnoses');
          }
        }}
        onTryAddIcd={tryAddIcd}
        diagnoses={diagnoses}
        diagnosisErrors={diagnosisErrors}
        onRemoveDiagnosis={removeDiagnosis}
        clinicalNotes={clinicalNotes}
        onClinicalNotesChange={(value) => {
          setClinicalNotes(value);
          if (value.trim()) clearDiagnosisError('clinicalNotes');
        }}
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
        actionLoading={actionLoading}
        onSendToPharmacy={handleSendToPharmacy}
        selectedLabTests={selectedLabTests}
        onToggleLabTest={toggleLabTest}
        labClinicalNotes={labClinicalNotes}
        onLabClinicalNotesChange={setLabClinicalNotes}
        labEmergency={labEmergency}
        onLabEmergencyChange={setLabEmergency}
        onSendToLab={handleSendToLab}
        labError={labError}
        selectedScan={selectedScan}
        onSelectScan={setSelectedScan}
        sonarSymptoms={sonarSymptoms}
        onSonarSymptomsChange={setSonarSymptoms}
        sonarDiagnosticQuestions={sonarDiagnosticQuestions}
        onSonarDiagnosticQuestionsChange={setSonarDiagnosticQuestions}
        sonarPrepInstructions={sonarPrepInstructions}
        onSonarPrepInstructionsChange={setSonarPrepInstructions}
        sonarEmergency={sonarEmergency}
        onSonarEmergencyChange={setSonarEmergency}
        onSendToSonar={handleSendToSonar}
        sonarError={sonarError}
        onAdmit={openAdmitModal}
        onDischarge={handleDischarge}
      />

      {showAdmitModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
          role="presentation"
          onClick={() => setShowAdmitModal(false)}
        >
          <div
            className={`${c.sectionPanel} max-h-[min(90vh,720px)] w-full max-w-2xl overflow-y-auto`}
            role="dialog"
            aria-labelledby="admit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="admit-title" className={c.sectionTitle}>
              Admit to ward
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Select a bed and transport details. Porters will see critical notes and the checklist you confirm below.
            </p>
            {beds.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No available beds.</p>
            ) : (
              <div className="mt-4 space-y-4">
                <IntakeSelect
                  id="doc-bed-select"
                  label="Select bed"
                  required
                  error={null}
                  className={c.select}
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                >
                  <option value="">Choose a bed…</option>
                  {beds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.ward?.name || 'Ward'}
                      {b.room_number ? ` — Room ${b.room_number}` : ''} — Bed {b.bed_number}
                    </option>
                  ))}
                </IntakeSelect>

                <IntakeSelect
                  id="doc-admit-equipment-mode"
                  label="Equipment / mode of transport"
                  required
                  error={null}
                  className={c.select}
                  value={admitEquipmentMode}
                  onChange={(e) => setAdmitEquipmentMode(e.target.value)}
                >
                  {EQUIPMENT_MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </IntakeSelect>

                <IntakeTextarea
                  id="doc-admit-equipment-notes"
                  label="Equipment notes (optional)"
                  value={admitEquipmentNotes}
                  onChange={(e) => setAdmitEquipmentNotes(e.target.value)}
                  className={c.textarea}
                  rows={2}
                  placeholder="e.g. Bariatric chair, two staff required"
                />

                <IntakeTextarea
                  id="doc-admit-critical"
                  label="Critical notes for porter (optional)"
                  value={admitCriticalNotes}
                  onChange={(e) => setAdmitCriticalNotes(e.target.value)}
                  className={c.textarea}
                  rows={3}
                  placeholder="Falls risk, oxygen dependency, isolation precautions…"
                />

                <fieldset className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                  <legend className="px-1 text-xs font-bold uppercase tracking-wide text-amber-900">
                    Diet prescription (kitchen)
                  </legend>
                  <p className="mt-1 text-xs text-slate-600">
                    Prescribe the inpatient diet now — kitchen staff will see ward, room, and bed on the meal
                    board.
                  </p>
                  <div className="mt-3 space-y-3">
                    <IntakeSelect
                      id="doc-admit-diet-type"
                      label="Diet type"
                      className={c.select}
                      value={admitDietType}
                      onChange={(e) => setAdmitDietType(e.target.value)}
                    >
                      <option value="">No diet order (add later)</option>
                      {DIET_TYPES.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </IntakeSelect>
                    <IntakeTextarea
                      id="doc-admit-diet-desc"
                      label="Diet notes (optional)"
                      value={admitDietDescription}
                      onChange={(e) => setAdmitDietDescription(e.target.value)}
                      className={c.textarea}
                      rows={2}
                      placeholder="Texture modifications, calorie targets…"
                    />
                    <IntakeTextarea
                      id="doc-admit-diet-restrictions"
                      label="Restrictions (optional)"
                      value={admitDietRestrictions}
                      onChange={(e) => setAdmitDietRestrictions(e.target.value)}
                      className={c.textarea}
                      rows={2}
                      placeholder="Allergies, religious, fluid limits…"
                    />
                    <IntakeTextarea
                      id="doc-admit-diet-special"
                      label="Special instructions for kitchen (optional)"
                      value={admitDietSpecialInstructions}
                      onChange={(e) => setAdmitDietSpecialInstructions(e.target.value)}
                      className={c.textarea}
                      rows={2}
                      placeholder="Serve at specific times, assist feeding…"
                    />
                  </div>
                </fieldset>

                <fieldset className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                    Equipment checklist (tick all that apply)
                  </legend>
                  <ul className="mt-2 space-y-2">
                    {ADMIT_TRANSPORT_CHECKLIST_OPTIONS.map((opt) => (
                      <li key={opt.id}>
                        <label className="flex cursor-pointer gap-2 text-sm text-slate-800">
                          <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600"
                            checked={Boolean(admitChecklist[opt.id])}
                            onChange={() =>
                              setAdmitChecklist((prev) => ({ ...prev, [opt.id]: !prev[opt.id] }))
                            }
                          />
                          {opt.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className={c.btnSecondary} onClick={() => setShowAdmitModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={c.btnComplete}
                disabled={actionLoading || !selectedBedId}
                onClick={handleAdmit}
              >
                Confirm admission
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
