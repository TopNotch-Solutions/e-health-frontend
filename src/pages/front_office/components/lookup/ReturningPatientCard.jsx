import { useState } from 'react';
import { Link } from 'react-router-dom';
import IntakeDetailsForm from '../IntakeDetailsForm';
import EmergencyPatientToggle from '../EmergencyPatientToggle';
import ImmediateTriageToggle from '../ImmediateTriageToggle';
import QueueRoutingForm, { routingButtonLabel } from '../QueueRoutingForm';
import ReturningPatientCardShell from '../../../../components/patient/ReturningPatientCardShell';
import { useToast } from '../../context/ToastContext';
import { activeVisitLocation } from '../../patientUtils';
import { lookup } from '../../styles/lookupClasses';

export default function ReturningPatientCard({
  patient,
  onCheckIn,
  checkInLoading,
  checkInPatientId,
}) {
  const { showToast } = useToast();
  const [modeOfArrival, setModeOfArrival] = useState('');
  const [accompaniedBy, setAccompaniedBy] = useState('');
  const [isEmergency, setIsEmergency] = useState(Boolean(patient.is_emergency));
  const [immediateTriage, setImmediateTriage] = useState(false);
  const [routingDestination, setRoutingDestination] = useState('');
  const busy = checkInLoading && checkInPatientId === patient.id;
  const hasActiveVisit = Boolean(patient.has_active_visit || patient.active_visit);
  const activeLocation = activeVisitLocation(patient);
  const checkInBlocked = hasActiveVisit;

  function handleImmediateTriageChange(checked) {
    setImmediateTriage(checked);
    if (checked) setRoutingDestination('');
  }

  async function handleCheckIn() {
    if (checkInBlocked) {
      showToast(
        `This patient already has an active visit${activeLocation ? ` in ${activeLocation}` : ''}. `
        + 'They must complete their current consultation before a new check-in.',
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
    await onCheckIn(patient, {
      mode_of_arrival: modeOfArrival,
      accompanied_by: accompaniedBy,
      is_emergency: isEmergency,
      immediate_triage: immediateTriage,
      routing_destination: routingDestination,
    });
  }

  const routeLabel = routingButtonLabel({
    destination: routingDestination,
    immediateTriage,
    loading: busy,
    action: 'Route',
  });

  return (
    <ReturningPatientCardShell
      patient={patient}
      hasActiveVisit={hasActiveVisit}
      activeLocation={activeLocation}
      activeVisitNumber={patient.active_visit?.visit_number}
      footer={(
        <>
          <button
            type="button"
            className={lookup.returningFooterPrimary}
            disabled={checkInLoading || checkInBlocked}
            onClick={handleCheckIn}
          >
            {routeLabel}
          </button>
          <Link
            to={`/front_office/patient/${patient.id}`}
            className={lookup.returningFooterSecondary}
          >
            View EHR
          </Link>
        </>
      )}
    >
      {!immediateTriage ? (
        <section className={lookup.returningSection}>
          <h4 className={lookup.returningSectionTitle}>Arrival details</h4>
          <IntakeDetailsForm
            modeOfArrival={modeOfArrival}
            accompaniedBy={accompaniedBy}
            onModeChange={setModeOfArrival}
            onAccompaniedChange={setAccompaniedBy}
            disabled={checkInLoading || checkInBlocked}
            classNames={lookup}
            embedded
          />
        </section>
      ) : null}

      <section className={lookup.returningSection}>
        <h4 className={lookup.returningSectionTitle}>Priority &amp; routing</h4>
        <div className="space-y-3">
          <EmergencyPatientToggle
            id={`fo-returning-emergency-${patient.id}`}
            checked={isEmergency}
            onChange={setIsEmergency}
            disabled={checkInLoading || immediateTriage || checkInBlocked}
          />
          <ImmediateTriageToggle
            id={`fo-returning-triage-${patient.id}`}
            checked={immediateTriage}
            onChange={handleImmediateTriageChange}
            disabled={checkInLoading || checkInBlocked}
          />
        </div>
        <div className="mt-4">
          <QueueRoutingForm
            destination={routingDestination}
            onDestinationChange={setRoutingDestination}
            patientSex={patient.sex}
            patientDateOfBirth={patient.date_of_birth}
            disabled={checkInLoading || immediateTriage || checkInBlocked}
            immediateTriage={immediateTriage}
            hideWhenImmediateTriage
            classNames={lookup}
          />
        </div>
      </section>
    </ReturningPatientCardShell>
  );
}
