import { lookup } from '../styles/lookupClasses';

/**
 * Mark visit as emergency — patient is prioritized at the top of nurse and doctor queues.
 */
export default function EmergencyPatientToggle({
  checked,
  onChange,
  disabled = false,
  id = 'fo-is-emergency',
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
        !
      </span>
      <span className="min-w-0 flex-1">
        <span className={ui.emergencyToggleTitle}>Emergency case</span>
        <span className={ui.emergencyToggleHint}>
          Classify as emergency — can still route to any sector below
        </span>
      </span>
      <span
        className={`${ui.emergencyToggleSwitch} ${checked ? ui.emergencyToggleSwitchOn : ''}`}
        aria-hidden
      />
    </label>
  );
}
