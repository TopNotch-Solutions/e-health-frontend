import { useEffect, useMemo } from 'react';
import { getRoutingDestinationsForPatient, routingLabel } from '../constants/routingOptions';
import { lookup } from '../styles/lookupClasses';

/**
 * Select clinic routing destination and show a dynamic route button label.
 */
export default function QueueRoutingForm({
  destination,
  onDestinationChange,
  patientSex,
  patientDateOfBirth,
  disabled = false,
  classNames,
  hideWhenImmediateTriage = false,
  immediateTriage = false,
}) {
  const ui = classNames || lookup;
  const destinations = useMemo(
    () => getRoutingDestinationsForPatient({ sex: patientSex, dateOfBirth: patientDateOfBirth }),
    [patientSex, patientDateOfBirth]
  );

  useEffect(() => {
    if (destination && !destinations.some((opt) => opt.value === destination)) {
      onDestinationChange('');
    }
  }, [destination, destinations, onDestinationChange]);

  if (hideWhenImmediateTriage && immediateTriage) {
    return (
      <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        Immediate triage selected — patient will be routed directly to the{' '}
        <strong>Emergency Unit</strong> queue.
      </p>
    );
  }

  const label = destination ? routingLabel(destination) : null;

  return (
    <section className={`${ui.intakeSection} mt-4`} aria-labelledby="fo-routing-heading">
      <h4 id="fo-routing-heading" className={ui.intakeTitle}>
        Queue routing
      </h4>
      <p className="mt-1 text-xs text-slate-500">
        Select the clinic sector, then route the patient to that queue.
      </p>
      <div className="mt-3 space-y-1">
        <label htmlFor="fo-routing-dest" className="text-sm font-medium text-slate-700">
          Destination sector
        </label>
        <select
          id="fo-routing-dest"
          className={ui.select}
          value={destination}
          disabled={disabled}
          onChange={(e) => onDestinationChange(e.target.value)}
        >
          <option value="">Select destination…</option>
          {destinations.map((opt) => (
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

export function routingButtonLabel({ destination, immediateTriage, loading, action = 'Route' }) {
  if (loading) return `${action}…`;
  if (immediateTriage) return `${action} to Emergency Unit`;
  if (destination) return `${action} to ${routingLabel(destination)}`;
  return `${action} patient`;
}
