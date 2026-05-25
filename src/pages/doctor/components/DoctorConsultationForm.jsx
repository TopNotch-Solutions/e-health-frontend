import NurseReadOnlyIntakeCards from './NurseReadOnlyIntakeCards';
import DoctorLabOrderSection from './DoctorLabOrderSection';
import DoctorSonarOrderSection from './DoctorSonarOrderSection';
import DoctorPrescriptionSection from './DoctorPrescriptionSection';
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
  catalog,
  catalogLoading,
  catalogError = '',
  medLine,
  medFieldErrors,
  onMedFieldChange,
  onMedicationSelect,
  liveStock,
  stockChecking,
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
  selectedScan,
  onSelectScan,
  sonarSymptoms,
  onSonarSymptomsChange,
  sonarDiagnosticQuestions,
  onSonarDiagnosticQuestionsChange,
  sonarPrepInstructions,
  onSonarPrepInstructionsChange,
  sonarEmergency,
  onSonarEmergencyChange,
  onSendToSonar,
  sonarError,
  onAdmit,
  onDischarge,
}) {
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

      <DoctorPrescriptionSection
        catalog={catalog}
        catalogLoading={catalogLoading}
        catalogError={catalogError}
        medLine={medLine}
        medFieldErrors={medFieldErrors}
        onMedFieldChange={onMedFieldChange}
        onMedicationSelect={onMedicationSelect}
        liveStock={liveStock}
        stockChecking={stockChecking}
        prescriptionLines={prescriptionLines}
        onAddMedToList={onAddMedToList}
        onRemoveMedLine={onRemoveMedLine}
        actionLoading={actionLoading}
        onSendToPharmacy={onSendToPharmacy}
      />

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

      <DoctorSonarOrderSection
        selectedScan={selectedScan}
        onSelectScan={onSelectScan}
        symptoms={sonarSymptoms}
        onSymptomsChange={onSonarSymptomsChange}
        diagnosticQuestions={sonarDiagnosticQuestions}
        onDiagnosticQuestionsChange={onSonarDiagnosticQuestionsChange}
        prepInstructions={sonarPrepInstructions}
        onPrepInstructionsChange={onSonarPrepInstructionsChange}
        sonarEmergency={sonarEmergency}
        onSonarEmergencyChange={onSonarEmergencyChange}
        actionLoading={actionLoading}
        onSendToSonar={onSendToSonar}
        sonarError={sonarError}
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
