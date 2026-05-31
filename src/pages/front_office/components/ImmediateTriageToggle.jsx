import { lookup } from '../styles/lookupClasses';

/**
 * Immediate triage — routes unregistered patients as Unknown to Emergency Unit.
 */
export default function ImmediateTriageToggle({
  checked,
  onChange,
  disabled = false,
  id = 'fo-immediate-triage',
  classNames,
}) {
  const ui = classNames || lookup;

  return (
    <label
      htmlFor={id}
      className={`${ui.emergencyToggle} ${checked ? ui.emergencyToggleOn : ''} ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={ui.emergencyToggleIcon} aria-hidden>
        ⚡
      </span>
      <span className="min-w-0 flex-1">
        <span className={ui.emergencyToggleTitle}>Immediate triage emergency</span>
        <span className={ui.emergencyToggleHint}>
          Route instantly to Emergency Unit (unregistered patients become Unknown)
        </span>
      </span>
      <span
        className={`${ui.emergencyToggleSwitch} ${checked ? ui.emergencyToggleSwitchOn : ''}`}
        aria-hidden
      />
    </label>
  );
}
