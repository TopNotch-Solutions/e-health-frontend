import { ACCOMPANIED_BY_OPTIONS, MODE_OF_ARRIVAL_OPTIONS } from '../constants/intakeOptions';
import { returningPanel } from '../styles/frontOfficeClasses';

/**
 * Returning-user intake: mode of arrival and accompaniment (required before check-in).
 * Pass `classNames` (e.g. lookup tokens) to match parent UI.
 */
export default function IntakeDetailsForm({
  modeOfArrival,
  accompaniedBy,
  onModeChange,
  onAccompaniedChange,
  disabled = false,
  classNames,
}) {
  const ui = classNames || returningPanel;

  return (
    <section className={ui.intakeSection} aria-labelledby="fo-intake-heading">
      <h4 id="fo-intake-heading" className={ui.intakeTitle}>
        Intake details
      </h4>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="fo-mode-arrival" className="text-sm font-medium text-slate-700">
            Mode of arrival
          </label>
          <select
            id="fo-mode-arrival"
            className={ui.select}
            value={modeOfArrival}
            disabled={disabled}
            onChange={(e) => onModeChange(e.target.value)}
          >
            {MODE_OF_ARRIVAL_OPTIONS.map((opt) => (
              <option key={opt.value || 'empty'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="fo-accompanied-by" className="text-sm font-medium text-slate-700">
            Accompanied by
          </label>
          <select
            id="fo-accompanied-by"
            className={ui.select}
            value={accompaniedBy}
            disabled={disabled}
            onChange={(e) => onAccompaniedChange(e.target.value)}
          >
            {ACCOMPANIED_BY_OPTIONS.map((opt) => (
              <option key={opt.value || 'empty-accompanied'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
