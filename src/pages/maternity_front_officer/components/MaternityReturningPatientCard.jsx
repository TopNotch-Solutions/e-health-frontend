import { useState } from 'react';
import IntakeDetailsForm from '../../front_office/components/IntakeDetailsForm';
import EmergencyPatientToggle from '../../front_office/components/EmergencyPatientToggle';
import ImmediateTriageToggle from '../../front_office/components/ImmediateTriageToggle';
import ReturningPatientCardShell from '../../../components/patient/ReturningPatientCardShell';
import { useToast } from '../../front_office/context/ToastContext';
import { activeVisitLocation } from '../../front_office/patientUtils';
import { lookup } from '../../front_office/styles/lookupClasses';
import {
  formatMaternityAgeLabel,
  isMaternityEligibleSex,
  MATERNITY_INELIGIBLE_SEX_MESSAGE,
} from '../maternityPatientUtils';
import MaternityQueueRoutingForm from './MaternityQueueRoutingForm';
import { maternityRoutingButtonLabel } from '../constants/maternityRoutingOptions';

export default function MaternityReturningPatientCard({
  patient,
  onRoute,
  routeLoading,
  routePatientId,
}) {
  const { showToast } = useToast();
  const [modeOfArrival, setModeOfArrival] = useState('');
  const [accompaniedBy, setAccompaniedBy] = useState('');
  const [isEmergency, setIsEmergency] = useState(Boolean(patient.is_emergency));
  const [immediateTriage, setImmediateTriage] = useState(false);
  const [routingDestination, setRoutingDestination] = useState('');
  const busy = routeLoading && routePatientId === patient.id;
  const hasActiveVisit = Boolean(patient.has_active_visit || patient.active_visit);
  const activeLocation = activeVisitLocation(patient);
  const eligible = isMaternityEligibleSex(patient.sex);
  const routeBlocked = hasActiveVisit || !eligible;
  const ageLabel = formatMaternityAgeLabel(patient.date_of_birth);

  function handleImmediateTriageChange(checked) {
    setImmediateTriage(checked);
    if (checked) setRoutingDestination('');
  }

  async function handleRoute() {
    if (!eligible) {
      showToast(MATERNITY_INELIGIBLE_SEX_MESSAGE, 'error');
      return;
    }
    if (routeBlocked && hasActiveVisit) {
      showToast(
        `This patient already has an active visit${activeLocation ? ` in ${activeLocation}` : ''}. `
        + 'They must complete their current visit before a new check-in.',
        'error'
      );
      return;
    }
    if (!immediateTriage && !routingDestination) {
      showToast('Select a routing destination before sending the patient to queue.', 'error');
      return;
    }
    if (!immediateTriage) {
      if (!modeOfArrival) {
        showToast('Select mode of arrival before check-in.', 'error');
        return;
      }
      if (!accompaniedBy) {
        showToast('Select who accompanied the patient before check-in.', 'error');
        return;
      }
    }
    await onRoute(patient, {
      mode_of_arrival: modeOfArrival,
      accompanied_by: accompaniedBy,
      is_emergency: isEmergency,
      immediate_triage: immediateTriage,
      routing_destination: routingDestination,
    });
  }

  const routeLabel = maternityRoutingButtonLabel({
    destination: routingDestination,
    immediateTriage,
    loading: busy,
    action: 'Route',
  });

  return (
    <ReturningPatientCardShell
      patient={patient}
      ageLabel={ageLabel}
      eligible={eligible}
      ineligibleMessage={MATERNITY_INELIGIBLE_SEX_MESSAGE}
      hasActiveVisit={hasActiveVisit}
      activeLocation={activeLocation}
      activeVisitNumber={patient.active_visit?.visit_number}
      footer={eligible ? (
        <button
          type="button"
          className={lookup.returningFooterPrimary}
          disabled={routeLoading || routeBlocked}
          onClick={handleRoute}
        >
          {routeLabel}
        </button>
      ) : null}
    >
      {!immediateTriage && eligible ? (
        <section className={lookup.returningSection}>
          <h4 className={lookup.returningSectionTitle}>Arrival details</h4>
          <IntakeDetailsForm
            modeOfArrival={modeOfArrival}
            accompaniedBy={accompaniedBy}
            onModeChange={setModeOfArrival}
            onAccompaniedChange={setAccompaniedBy}
            disabled={routeLoading || routeBlocked}
            classNames={lookup}
            embedded
          />
        </section>
      ) : null}

      {eligible ? (
        <section className={lookup.returningSection}>
          <h4 className={lookup.returningSectionTitle}>Priority &amp; maternity routing</h4>
          <div className="space-y-3">
            <EmergencyPatientToggle
              id={`mfo-returning-emergency-${patient.id}`}
              checked={isEmergency}
              onChange={setIsEmergency}
              disabled={routeLoading || immediateTriage || routeBlocked}
            />
            <ImmediateTriageToggle
              id={`mfo-returning-triage-${patient.id}`}
              checked={immediateTriage}
              onChange={handleImmediateTriageChange}
              disabled={routeLoading || routeBlocked}
            />
          </div>
          <div className="mt-4">
            <MaternityQueueRoutingForm
              destination={routingDestination}
              onDestinationChange={setRoutingDestination}
              disabled={routeLoading || immediateTriage || routeBlocked}
              immediateTriage={immediateTriage}
              hideWhenImmediateTriage
              classNames={lookup}
            />
          </div>
        </section>
      ) : null}
    </ReturningPatientCardShell>
  );
}
