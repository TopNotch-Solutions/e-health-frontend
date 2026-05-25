import { IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import { rad } from '../styles/radiologistClasses';

function ensureChange(handler) {
  return (e) => {
    if (typeof handler === 'function') handler(e);
  };
}

export function SonarImagingStep({ imagingNotes, onImagingChange, error }) {
  const value = imagingNotes ?? '';

  return (
    <section
      className={`${rad.stepPanel} ${rad.stepPanelImaging}`}
      aria-labelledby="sonar-imaging-heading"
    >
      <div className={rad.stepHeader}>
        <span className={rad.stepBadge} aria-hidden>
          1
        </span>
        <div className="min-w-0 flex-1">
          <h3 id="sonar-imaging-heading" className={rad.stepTitle}>
            Sonographer imaging
          </h3>
          <p className={rad.stepSubtitle}>
            Confirm preparation was followed and document views, technique, and structures
            captured during the scan.
          </p>
        </div>
      </div>

      <div className={rad.fieldStack}>
        <div>
          <p className={rad.fieldHint}>
            Include probe type, patient position, image quality, and key anatomical landmarks
            visualized.
          </p>
          <IntakeTextarea
            id="sonar-imaging-notes"
            label="Imaging capture notes"
            required
            error={error}
            value={value}
            onChange={ensureChange(onImagingChange)}
            className={c.textarea}
            rows={6}
            placeholder="e.g. Curvilinear probe, supine. GB visualized — no stones; wall thickness 3 mm. CBD 4 mm…"
          />
        </div>
      </div>
    </section>
  );
}

export function SonarReportStep({
  findings,
  impression,
  report,
  onFindingsChange,
  onImpressionChange,
  onReportChange,
  reportError,
  actionLoading,
  onSubmit,
}) {
  const findingsVal = findings ?? '';
  const impressionVal = impression ?? '';
  const reportVal = report ?? '';

  return (
    <section
      className={`${rad.stepPanel} ${rad.stepPanelReport}`}
      aria-labelledby="sonar-report-heading"
    >
      <div className={rad.stepHeader}>
        <span className={`${rad.stepBadge} ${rad.stepBadgeReport}`} aria-hidden>
          2
        </span>
        <div className="min-w-0 flex-1">
          <h3 id="sonar-report-heading" className={rad.stepTitle}>
            Radiologist diagnostic report
          </h3>
          <p className={rad.stepSubtitle}>
            Structured interpretation for the referring doctor — findings, impression, and formal
            report.
          </p>
        </div>
      </div>

      <div className={rad.fieldStack}>
        <div>
          <p className={rad.fieldHint}>
            Objective description of what was seen on imaging — organized by region or structure.
          </p>
          <IntakeTextarea
            id="sonar-findings"
            label="Sonographic findings"
            required={false}
            showRequiredMark={false}
            value={findingsVal}
            onChange={ensureChange(onFindingsChange)}
            className={c.textarea}
            rows={5}
            placeholder="Liver: normal size and echogenicity. Gallbladder: no calculi…"
          />
        </div>

        <div>
          <p className={rad.fieldHint}>
            One or two sentences summarizing the clinical takeaway for the referring clinician.
          </p>
          <IntakeTextarea
            id="sonar-impression"
            label="Impression / conclusion"
            required={false}
            showRequiredMark={false}
            value={impressionVal}
            onChange={ensureChange(onImpressionChange)}
            className={c.textarea}
            rows={3}
            placeholder="e.g. No sonographic evidence of acute cholecystitis."
          />
        </div>

        <div>
          <p className={rad.fieldHint}>
            Complete report as it will be read at follow-up — include comparison, limitations, and
            recommendations if needed.
          </p>
          <IntakeTextarea
            id="sonar-report"
            label="Formal diagnostic report"
            required
            error={reportError}
            value={reportVal}
            onChange={ensureChange(onReportChange)}
            className={c.textarea}
            rows={8}
            placeholder={'ULTRASOUND REPORT\n\nClinical indication: …\n\nTechnique: …\n\nFindings: …\n\nImpression: …'}
          />
        </div>
      </div>

      <div className={rad.submitWrap}>
        <p className={rad.submitHint}>
          Submitting sends the report to the referring doctor and returns the patient to the doctor
          queue for follow-up.
        </p>
        <button
          type="button"
          className={rad.submitBtn}
          disabled={actionLoading}
          onClick={onSubmit}
        >
          Submit report & return to doctor
        </button>
      </div>
    </section>
  );
}
