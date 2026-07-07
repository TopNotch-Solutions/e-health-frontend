import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClinicRoutingOptions } from '../../../../hooks/useClinicRoutingOptions';
import IntakeDetailsForm from '../IntakeDetailsForm';
import EmergencyPatientToggle from '../EmergencyPatientToggle';
import QueueRoutingForm, { routingButtonLabel } from '../QueueRoutingForm';
import ReturningPatientCardShell from '../../../../components/patient/ReturningPatientCardShell';
import { useToast } from '../../context/ToastContext';
import { activeVisitLocation } from '../../patientUtils';
import { getRoutingDestinationsForPatient, isPharmacyRouting } from '../../constants/routingOptions';
import { lookup } from '../../styles/lookupClasses';

export default function ReturningPatientCard({
  patient,
  onCheckIn,
  checkInLoading,
  checkInPatientId,
}) {
  const { showToast } = useToast();
  const { options: routingOptions, loading: routingLoading } = useClinicRoutingOptions();
  const isHospital = Boolean(routingOptions?.is_hospital);
  const frontOfficeDestinations = routingOptions?.front_office;
  const [modeOfArrival, setModeOfArrival] = useState('');
  const [accompaniedBy, setAccompaniedBy] = useState('');
  const [isEmergency, setIsEmergency] = useState(Boolean(patient.is_emergency));
  const [routingDestination, setRoutingDestination] = useState('');
  const busy = checkInLoading && checkInPatientId === patient.id;
  const hasActiveVisit = Boolean(patient.has_active_visit || patient.active_visit);
  const activeLocation = activeVisitLocation(patient);
  const checkInBlocked = hasActiveVisit;

  const destinations = useMemo(
    () => getRoutingDestinationsForPatient({
      sex: patient.sex,
      dateOfBirth: patient.date_of_birth,
      facilityDestinations: frontOfficeDestinations,
      isHospital,
      hasPendingMedication: Boolean(patient.has_pending_medication),
    }),
    [patient.sex, patient.date_of_birth, patient.has_pending_medication, frontOfficeDestinations, isHospital]
  );

  const pharmacyOnlyRoute = destinations.length === 1 && destinations[0]?.value === 'pharmacy';
  const hidePriorityRouting = pharmacyOnlyRoute || isPharmacyRouting(routingDestination);

  useEffect(() => {
    if (pharmacyOnlyRoute && routingDestination !== 'pharmacy') {
      setRoutingDestination('pharmacy');
    }
  }, [pharmacyOnlyRoute, routingDestination]);

  useEffect(() => {
    if (hidePriorityRouting) {
      setIsEmergency(false);
    }
  }, [hidePriorityRouting]);

  function handleRoutingDestinationChange(value) {
    setRoutingDestination(value);
    if (isPharmacyRouting(value)) {
      setIsEmergency(false);
    }
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
    if (!routingDestination) {
      showToast('Select a routing destination before sending the patient to queue.', 'error');
      return;
    }
    if (!modeOfArrival) {
      showToast('Select mode of arrival before check-in.', 'error');
      return;
    }
    if (!accompaniedBy) {
      showToast('Select who accompanied the patient before check-in.', 'error');
      return;
    }
    await onCheckIn(patient, {
      mode_of_arrival: modeOfArrival,
      accompanied_by: accompaniedBy,
      is_emergency: isEmergency,
      routing_destination: routingDestination,
    });
  }

  const routeLabel = routingButtonLabel({
    destination: routingDestination,
    loading: busy,
    action: 'Route',
    destinations: frontOfficeDestinations,
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

      <section className={lookup.returningSection}>
        {!hidePriorityRouting ? (
          <>
            <h4 className={lookup.returningSectionTitle}>Priority &amp; routing</h4>
            <div className="space-y-3">
              <EmergencyPatientToggle
                id={`fo-returning-emergency-${patient.id}`}
                checked={isEmergency}
                onChange={setIsEmergency}
                disabled={checkInLoading || checkInBlocked}
              />
            </div>
            <div className="mt-4">
              <QueueRoutingForm
                destination={routingDestination}
                onDestinationChange={handleRoutingDestinationChange}
                patientSex={patient.sex}
                patientDateOfBirth={patient.date_of_birth}
                facilityDestinations={frontOfficeDestinations}
                isHospital={isHospital}
                hasPendingMedication={Boolean(patient.has_pending_medication)}
                destinationsLoading={routingLoading}
                disabled={checkInLoading || checkInBlocked}
                hidePriorityRouting={false}
                classNames={lookup}
              />
            </div>
          </>
        ) : (
          <QueueRoutingForm
            destination={routingDestination}
            onDestinationChange={handleRoutingDestinationChange}
            patientSex={patient.sex}
            patientDateOfBirth={patient.date_of_birth}
            facilityDestinations={frontOfficeDestinations}
            isHospital={isHospital}
            hasPendingMedication={Boolean(patient.has_pending_medication)}
            destinationsLoading={routingLoading}
            disabled={checkInLoading || checkInBlocked}
            hidePriorityRouting
            classNames={lookup}
          />
        )}
      </section>
    </ReturningPatientCardShell>
  );
}
