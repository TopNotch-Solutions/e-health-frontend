import NurseReadOnlyIntakeCards from './NurseReadOnlyIntakeCards';
import DoctorLabOrderSection from './DoctorLabOrderSection';
import { IntakeInput, IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';

const ICD_PRESETS = [
  { code: 'M54.5', label: 'Low back pain' },
  { code: 'M51.26', label: 'Sciatica' },
  { code: 'I10', label: 'Essential hypertension' },
  { code: 'E11.9', label: 'Type 2 diabetes mellitus' },
  { code: 'J06.9', label: 'Acute upper respiratory infection' },
];

export default function DoctorConsultationForm({
  intakeForm,
  allergy,
  icdInput,
  onIcdInputChange,
  onTryAddIcd,
  diagnoses,
  diagnosisErrors = {},
  onRemoveDiagnosis,
  clinicalNotes,
  onClinicalNotesChange,
  medLine,
  medFieldErrors,
  onMedFieldChange,
  prescriptionLines,
  onAddMedToList,
  onRemoveMedLine,
  actionLoading,
  onSendToPharmacy,
  selectedLabTests,
  onToggleLabTest,
  labClinicalNotes,
  onLabClinicalNotesChange,
  labEmergency,
  onLabEmergencyChange,
  onSendToLab,
  labError,
  onAdmit,
  onDischarge,
}) {
  const hasPrescription = prescriptionLines.length > 0;

  return (
    <>
      {allergy ? (
        <section className={c.sectionPanel} aria-label="Allergy alert">
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
            Allergy: {allergy}
          </p>
        </section>
      ) : null}

      <NurseReadOnlyIntakeCards form={intakeForm} idPrefix="doc" />

      <section className={c.sectionPanel} aria-labelledby="doc-diagnosis-heading">
        <h3 id="doc-diagnosis-heading" className={c.sectionTitle}>
          Diagnosis / clinical impression
        </h3>
        <div className="mt-4 space-y-4">
          <IntakeInput
            id="doc-icd"
            label="ICD-10 code or diagnosis"
            required
            error={diagnosisErrors.icd}
            className={c.input}
            placeholder="e.g. M54.5 or short clinical impression"
            value={icdInput}
            onChange={(e) => onIcdInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onTryAddIcd();
              }
            }}
          />
          {diagnoses.length > 0 ? (
            <div className={c.tagList}>
              {diagnoses.map((d) => (
                <span key={d.code} className={c.tag}>
                  {d.code} - {d.label}
                  <button
                    type="button"
                    className={c.tagRemove}
                    aria-label={`Remove ${d.code}`}
                    onClick={() => onRemoveDiagnosis(d.code)}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <IntakeTextarea
            id="doc-clinical-notes"
            label="Clinical notes and treatment plan"
            required
            error={diagnosisErrors.clinicalNotes}
            className={c.textarea}
            placeholder="Detail the treatment plan, counseling provided, and clinical reasoning..."
            value={clinicalNotes}
            onChange={(e) => onClinicalNotesChange(e.target.value)}
          />
        </div>
      </section>

      <section className={c.sectionPanel} aria-labelledby="doc-rx-heading">
        <h3 id="doc-rx-heading" className={c.sectionTitle}>
          Prescribe medication
        </h3>
        <p className="mt-1 text-sm text-slate-500">Optional. Add medications only if needed.</p>
        <div className="mt-4 space-y-4">
          <div className={c.vitalsGrid}>
            <IntakeInput
              id="doc-med-name"
              label="Medication"
              required={false}
              error={medFieldErrors.medication_name}
              className={c.input}
              placeholder="e.g. Amoxicillin"
              value={medLine.medication_name}
              onChange={(e) => onMedFieldChange('medication_name', e.target.value)}
            />
            <IntakeInput
              id="doc-med-dose"
              label="Dosage"
              required={false}
              error={medFieldErrors.dosage}
              className={c.input}
              placeholder="e.g. 500mg TDS"
              value={medLine.dosage}
              onChange={(e) => onMedFieldChange('dosage', e.target.value)}
            />
            <IntakeInput
              id="doc-med-freq"
              label="Frequency"
              required={false}
              error={null}
              className={c.input}
              placeholder="e.g. Three times daily"
              value={medLine.frequency}
              onChange={(e) => onMedFieldChange('frequency', e.target.value)}
            />
            <IntakeInput
              id="doc-med-qty"
              label="Quantity"
              required={false}
              error={null}
              className={c.input}
              inputMode="numeric"
              value={medLine.quantity}
              onChange={(e) => onMedFieldChange('quantity', e.target.value)}
            />
          </div>
          <IntakeInput
            id="doc-med-inst"
            label="Instructions"
            required={false}
            error={null}
            className={c.input}
            placeholder="Optional instructions"
            value={medLine.instructions}
            onChange={(e) => onMedFieldChange('instructions', e.target.value)}
          />
          <button type="button" className={c.btnSecondary} onClick={onAddMedToList}>
            + Add to prescription list
          </button>
          {prescriptionLines.length > 0 ? (
            <ul className="space-y-2">
              {prescriptionLines.map((line, i) => (
                <li
                  key={`${line.medication_name}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <span>
                    <strong>{line.medication_name}</strong> - {line.dosage}
                    {line.frequency ? ` (${line.frequency})` : ''} x{line.quantity}
                  </span>
                  <button
                    type="button"
                    className="text-slate-500 hover:text-red-600"
                    onClick={() => onRemoveMedLine(i)}
                    aria-label="Remove medication"
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {hasPrescription ? (
            <button
              type="button"
              className={`${c.btnAction} ${c.btnPharmacy}`}
              disabled={actionLoading}
              onClick={onSendToPharmacy}
            >
              Send to pharmacy
            </button>
          ) : null}
        </div>
      </section>

      <DoctorLabOrderSection
        selectedTests={selectedLabTests}
        onToggleTest={onToggleLabTest}
        labClinicalNotes={labClinicalNotes}
        onLabClinicalNotesChange={onLabClinicalNotesChange}
        labEmergency={labEmergency}
        onLabEmergencyChange={onLabEmergencyChange}
        actionLoading={actionLoading}
        onSendToLab={onSendToLab}
        labError={labError}
        prescriptionLineCount={prescriptionLines.length}
      />

      <section className={c.sectionPanel} aria-labelledby="doc-disp-heading">
        <h3 id="doc-disp-heading" className={c.sectionTitle}>
          Patient disposition
        </h3>
        <div className={c.dispositionRow}>
          <button
            type="button"
            className={`${c.btnAction} ${c.btnAdmit}`}
            disabled={actionLoading}
            onClick={onAdmit}
          >
            Admit to ward
          </button>
          <button
            type="button"
            className={`${c.btnAction} ${c.btnDischarge}`}
            disabled={actionLoading}
            onClick={onDischarge}
          >
            Discharge patient
          </button>
        </div>
      </section>
    </>
  );
}

export { ICD_PRESETS };
