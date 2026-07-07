import { useEffect, useMemo } from 'react';
import {
  formatRoutingDestinationList,
  getRoutingDestinationsForPatient,
  routingLabel,
} from '../constants/routingOptions';
import { lookup } from '../styles/lookupClasses';

/**
 * Select clinic routing destination and show a dynamic route button label.
 */
export default function QueueRoutingForm({
  destination,
  onDestinationChange,
  patientSex,
  patientDateOfBirth,
  facilityDestinations,
  isHospital = false,
  hasPendingMedication = false,
  destinationsLoading = false,
  disabled = false,
  classNames,
  hidePriorityRouting = false,
}) {
  const ui = classNames || lookup;
  const destinations = useMemo(
    () => getRoutingDestinationsForPatient({
      sex: patientSex,
      dateOfBirth: patientDateOfBirth,
      facilityDestinations,
      isHospital,
      hasPendingMedication,
    }),
    [patientSex, patientDateOfBirth, facilityDestinations, isHospital, hasPendingMedication]
  );

  const destinationHelpText = useMemo(() => {
    if (hidePriorityRouting || destination === 'pharmacy') {
      return 'Send the patient to the pharmacy queue to collect pending medication.';
    }
    if (!isHospital) {
      return 'Select the clinic sector, then route the patient to that queue.';
    }
    if (destinationsLoading) {
      return 'Loading routing destinations for this hospital…';
    }
    if (!destinations.length) {
      return 'No routing destinations are active at this hospital. Ask system administration to add departments.';
    }
    const list = formatRoutingDestinationList(destinations);
    return `Select where to send the patient — ${list}.`;
  }, [isHospital, destinationsLoading, destinations, hidePriorityRouting, destination]);

  const singleNurseRoute = destinations.length === 1 && destinations[0]?.value === 'nurse';

  useEffect(() => {
    if (singleNurseRoute && !destination && destinations[0]?.value) {
      onDestinationChange(destinations[0].value);
    }
  }, [singleNurseRoute, destination, destinations, onDestinationChange]);

  useEffect(() => {
    if (destination && !destinations.some((opt) => opt.value === destination)) {
      onDestinationChange('');
    }
  }, [destination, destinations, onDestinationChange]);

  const label = destination ? routingLabel(destination, destinations) : null;

  if (singleNurseRoute) {
    return (
      <section className={`${ui.intakeSection} mt-4`} aria-labelledby="fo-routing-heading">
        <h4 id="fo-routing-heading" className={ui.intakeTitle}>
          Queue routing
        </h4>
        <p className="mt-2 text-sm text-slate-600">
          Hospital front office routes all patients to the <strong>Nurse</strong> intake queue.
          Use emergency classification above if the case is urgent.
        </p>
      </section>
    );
  }

  return (
    <section className={`${ui.intakeSection} mt-4`} aria-labelledby="fo-routing-heading">
      <h4 id="fo-routing-heading" className={ui.intakeTitle}>
        {hidePriorityRouting ? 'Pharmacy collection' : 'Queue routing'}
      </h4>
      <p className="mt-1 text-xs text-slate-500">
        {destinationHelpText}
      </p>
      {destinations.length > 0 ? (
      <div className="mt-3 space-y-1">
        <label htmlFor="fo-routing-dest" className="text-sm font-medium text-slate-700">
          Destination sector
        </label>
        <select
          id="fo-routing-dest"
          className={ui.select}
          value={destination}
          disabled={disabled || destinationsLoading}
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
      ) : null}
      {label ? (
        <p className="mt-3 text-sm text-teal-800">
          Ready to send patient to <strong>{label}</strong>.
        </p>
      ) : null}
    </section>
  );
}

export function routingButtonLabel({
  destination,
  loading,
  action = 'Route',
  destinations,
} = {}) {
  if (loading) return `${action}…`;
  if (destination) return `${action} to ${routingLabel(destination, destinations)}`;
  if (destinations?.length === 1 && destinations[0]?.value === 'nurse') {
    return `${action} to Nurse`;
  }
  return `${action} patient`;
}
