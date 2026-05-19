import { useEffect, useMemo, useState } from 'react';
import {
  admitPatient,
  createConsultation,
  createPrescription,
  dischargeVisit,
  getAvailableBeds,
  getConsultationsByVisit,
} from '../../../api/doctor';
import { completeQueueEntry } from '../../../api/queue';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import { IntakeSelect } from '../../nurse/components/IntakeField';
import { vitalsToIntakeForm, emptyMedLine } from '../doctorConsultForm';
import DoctorConsultationForm, { ICD_PRESETS } from './DoctorConsultationForm';

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
  const [medFieldErrors, setMedFieldErrors] = useState({});

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

    if (!patient?.visitId) return;
    getConsultationsByVisit(patient.visitId)
      .then((list) => {
        const latest = Array.isArray(list) ? list[0] : null;
        if (latest?.id) setConsultationId(latest.id);
        if (latest?.notes) setClinicalNotes(latest.notes);
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

  function tryAddIcd() {
    const raw = icdInput.trim();
    if (!raw) return;
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
  }

  async function ensureConsultation() {
    if (consultationId) return consultationId;
    const diagnosis = diagnoses.map((d) => `${d.code} — ${d.label}`).join('; ');
    const created = await createConsultation({
      visit_id: patient.visitId,
      diagnosis: diagnosis || null,
      notes: clinicalNotes || null,
      actions_taken: JSON.stringify({ nurse_intake: intakeForm }),
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

  async function handleSendToPharmacy() {
    if (prescriptionLines.length === 0) return;

    setActionLoading(true);
    onActionError('');
    try {
      const cid = await ensureConsultation();
      await createPrescription({
        visit_id: patient.visitId,
        consultation_id: cid,
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
      await finishConsultation('Prescription sent to pharmacy — consultation completed');
    } catch (err) {
      onActionError(err.message || 'Failed to send to pharmacy');
    } finally {
      setActionLoading(false);
    }
  }

  async function openAdmitModal() {
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
      await admitPatient({
        visit_id: patient.visitId,
        bed_id: selectedBedId,
        equipment_required: 'wheelchair',
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
        onIcdInputChange={setIcdInput}
        onTryAddIcd={tryAddIcd}
        diagnoses={diagnoses}
        onRemoveDiagnosis={removeDiagnosis}
        clinicalNotes={clinicalNotes}
        onClinicalNotesChange={setClinicalNotes}
        medLine={medLine}
        medFieldErrors={medFieldErrors}
        onMedFieldChange={setMedField}
        prescriptionLines={prescriptionLines}
        onAddMedToList={addMedToList}
        onRemoveMedLine={removeMedLine}
        actionLoading={actionLoading}
        onSendToPharmacy={handleSendToPharmacy}
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
            className={`${c.sectionPanel} w-full max-w-md`}
            role="dialog"
            aria-labelledby="admit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="admit-title" className={c.sectionTitle}>
              Admit to ward
            </h3>
            {beds.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No available beds.</p>
            ) : (
              <div className="mt-4">
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
                      {b.ward?.name || 'Ward'} — Bed {b.bed_number}
                    </option>
                  ))}
                </IntakeSelect>
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
