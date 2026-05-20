import { useEffect, useMemo, useState } from 'react';
import {
  admitPatient,
  createConsultation,
  updateConsultation,
  createPrescription,
  createLabOrder,
  dischargeVisit,
  getAvailableBeds,
  getConsultationsByVisit,
} from '../../../api/doctor';
import { completeQueueEntry } from '../../../api/queue';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import { IntakeSelect, IntakeTextarea } from '../../nurse/components/IntakeField';
import { vitalsToIntakeForm, emptyMedLine } from '../doctorConsultForm';
import DoctorConsultationForm, { ICD_PRESETS } from './DoctorConsultationForm';
import {
  ADMIT_TRANSPORT_CHECKLIST_OPTIONS,
  EQUIPMENT_MODES,
} from '../../../constants/admitTransportChecklist';

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
  const [medFieldErrors, setMedFieldErrors] = useState({});
  const [diagnosisErrors, setDiagnosisErrors] = useState({});
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [labClinicalNotes, setLabClinicalNotes] = useState('');
  const [labEmergency, setLabEmergency] = useState(false);
  const [labError, setLabError] = useState('');

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
    setMedFieldErrors({});
    setDiagnosisErrors({});
    setSelectedLabTests([]);
    setLabClinicalNotes('');
    setLabEmergency(Boolean(patient?.isEmergency));
    setLabError('');

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
    setPrescriptionLines((lines) => [
      ...lines,
      {
        ...medLine,
        medication_name: name,
        dosage: dose,
        quantity: Number(medLine.quantity) || 1,
      },
    ]);
    setMedLine(emptyMedLine());
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

  async function handleSendToLab() {
    if (selectedLabTests.length === 0) return;
    if (!validateDiagnosisImpression()) return;

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

    setActionLoading(true);
    onActionError('');
    try {
      const cid = await ensureConsultation();
      await createPrescription({
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
      onToast('Prescription sent to pharmacy — consultation completed');
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
    setActionLoading(true);
    onActionError('');
    try {
      await ensureConsultation();
      const equipment_checklist = ADMIT_TRANSPORT_CHECKLIST_OPTIONS.map((opt) => ({
        id: opt.id,
        checked: Boolean(admitChecklist[opt.id]),
      }));
      await admitPatient({
        visit_id: patient.visitId,
        bed_id: selectedBedId,
        equipment_required: admitEquipmentMode,
        equipment_notes: admitEquipmentNotes.trim() || null,
        critical_notes: admitCriticalNotes.trim() || null,
        equipment_checklist,
      });
      setShowAdmitModal(false);
      await finishConsultation(`${patient.name} admitted — consultation completed`);
    } catch (err) {
      onActionError(err.message || 'Failed to admit patient');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDischarge() {
    if (!validateDiagnosisImpression()) return;

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
        medLine={medLine}
        medFieldErrors={medFieldErrors}
        onMedFieldChange={setMedField}
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
