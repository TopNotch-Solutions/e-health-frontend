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
  onCompleteRouting,
  routingError,
  hasRoutingSelection,
  selectedLabTests,
  onToggleLabTest,
  labClinicalNotes,
  onLabClinicalNotesChange,
  labEmergency,
  onLabEmergencyChange,
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
        hideSubmitButton
      />

      <DoctorLabOrderSection
        selectedTests={selectedLabTests}
        onToggleTest={onToggleLabTest}
        labClinicalNotes={labClinicalNotes}
        onLabClinicalNotesChange={onLabClinicalNotesChange}
        labEmergency={labEmergency}
        onLabEmergencyChange={onLabEmergencyChange}
        actionLoading={actionLoading}
        labError={labError}
        hideSubmitButton
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
        sonarError={sonarError}
        hideSubmitButton
      />

      <section className={c.sectionPanel} aria-labelledby="doc-routing-heading">
        <h3 id="doc-routing-heading" className={c.sectionTitle}>
          Complete consultation
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          When you are ready, send the patient to pharmacy, laboratory, and/or ultrasound in one
          step based on what you configured above. You can combine medication, lab tests, and
          imaging on the same visit.
        </p>
        {routingError ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {routingError}
          </p>
        ) : null}
        <button
          type="button"
          className={`${c.btnAction} ${c.btnComplete} mt-4 max-w-md`}
          disabled={actionLoading || !hasRoutingSelection}
          onClick={onCompleteRouting}
        >
          {actionLoading ? 'Routing patient…' : 'Complete consultation & route patient'}
        </button>
        {!hasRoutingSelection ? (
          <p className="mt-2 text-xs text-slate-500">
            Add at least one medication, laboratory test, or ultrasound referral to continue.
          </p>
        ) : null}
      </section>

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
