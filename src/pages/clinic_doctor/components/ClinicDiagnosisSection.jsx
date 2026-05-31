import { IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';

export default function ClinicDiagnosisSection({
  diagnosis,
  notes,
  fieldErrors,
  onDiagnosisChange,
  onNotesChange,
}) {
  return (
    <section className={c.sectionPanel} aria-labelledby="cd-diagnosis-heading">
      <h3 id="cd-diagnosis-heading" className={c.sectionTitle}>
        Doctor diagnosis
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Enter your clinical diagnosis before any disposition or routing actions are unlocked.
      </p>
      <div className="mt-4 space-y-4">
        <IntakeTextarea
          id="cd-diagnosis"
          label="Clinical diagnosis"
          required
          error={fieldErrors.diagnosis}
          className={c.textarea}
          rows={3}
          placeholder="Enter your diagnosis or clinical impression…"
          value={diagnosis}
          onChange={(e) => onDiagnosisChange(e.target.value)}
        />
        <IntakeTextarea
          id="cd-notes"
          label="Consultation notes (optional)"
          className={c.textarea}
          rows={2}
          placeholder="Additional notes for the record…"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>
    </section>
  );
}
