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
      className={`${ui.emergencyCaseToggle} ${checked ? ui.emergencyCaseToggleOn : ''} ${
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
      <span className={ui.emergencyCaseToggleIcon} aria-hidden>
        !
      </span>
      <span className="min-w-0 flex-1">
        <span className={ui.emergencyCaseToggleTitle}>Emergency case</span>
        <span className={ui.emergencyCaseToggleHint}>
          Classify as emergency — can still route to any sector below
        </span>
      </span>
      <span
        className={`${ui.emergencyCaseToggleSwitch} ${checked ? ui.emergencyCaseToggleSwitchOn : ''}`}
        aria-hidden
      />
    </label>
  );
}
