import { lookup } from '../../front_office/styles/lookupClasses';
import {
  MATERNITY_ROUTING_DESTINATIONS,
  maternityRoutingLabel,
} from '../constants/maternityRoutingOptions';

export default function MaternityQueueRoutingForm({
  destination,
  onDestinationChange,
  disabled = false,
  classNames,
  hideWhenImmediateTriage = false,
  immediateTriage = false,
}) {
  const ui = classNames || lookup;

  if (hideWhenImmediateTriage && immediateTriage) {
    return (
      <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        Immediate triage selected — patient will be routed directly to{' '}
        <strong>Maternity ICU</strong>.
      </p>
    );
  }

  const label = destination ? maternityRoutingLabel(destination) : null;

  return (
    <section className={`${ui.intakeSection} mt-4`} aria-labelledby="mfo-routing-heading">
      <h4 id="mfo-routing-heading" className={ui.intakeTitle}>
        Queue routing
      </h4>
      <p className="mt-1 text-xs text-slate-500">
        Select ANC or ANW, then route the patient to that maternity queue.
      </p>
      <div className="mt-3 space-y-1">
        <label htmlFor="mfo-routing-dest" className="text-sm font-medium text-slate-700">
          Destination
        </label>
        <select
          id="mfo-routing-dest"
          className={ui.select}
          value={destination}
          disabled={disabled}
          onChange={(e) => onDestinationChange(e.target.value)}
        >
          <option value="">Select destination…</option>
          {MATERNITY_ROUTING_DESTINATIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {label ? (
        <p className="mt-3 text-sm text-teal-800">
          Ready to send patient to <strong>{label}</strong>.
        </p>
      ) : null}
    </section>
  );
}
