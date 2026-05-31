import { useState } from 'react';
import { Link } from 'react-router-dom';
import IntakeDetailsForm from '../IntakeDetailsForm';
import EmergencyPatientToggle from '../EmergencyPatientToggle';
import ImmediateTriageToggle from '../ImmediateTriageToggle';
import QueueRoutingForm, { routingButtonLabel } from '../QueueRoutingForm';
import { useToast } from '../../context/ToastContext';
import { formatDob, maskId, patientName } from '../../patientUtils';
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

  function handleImmediateTriageChange(checked) {
    setImmediateTriage(checked);
    if (checked) setRoutingDestination('');
  }

  async function handleCheckIn() {
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
    <article className={lookup.returningCard}>
      <span className={lookup.returningBadge}>Returning patient</span>
      <h3 className="mt-3 text-xl font-bold text-slate-900">{patientName(patient)}</h3>
      <p className="mt-1 text-sm text-slate-600">
        <span className="font-mono font-semibold">{patient.patient_number}</span>
        {patient.id_number ? (
          <>
            {' '}
            · ID <span className="font-mono">{maskId(patient.id_number)}</span>
          </>
        ) : null}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        DOB {formatDob(patient.date_of_birth)}
        {patient.phone ? ` · ${patient.phone}` : ''}
      </p>

      {!immediateTriage ? (
        <IntakeDetailsForm
          modeOfArrival={modeOfArrival}
          accompaniedBy={accompaniedBy}
          onModeChange={setModeOfArrival}
          onAccompaniedChange={setAccompaniedBy}
          disabled={checkInLoading}
          classNames={lookup}
        />
      ) : null}

      <div className="mt-4 space-y-3">
        <EmergencyPatientToggle
          id={`fo-returning-emergency-${patient.id}`}
          checked={isEmergency}
          onChange={setIsEmergency}
          disabled={checkInLoading || immediateTriage}
        />
        <ImmediateTriageToggle
          id={`fo-returning-triage-${patient.id}`}
          checked={immediateTriage}
          onChange={handleImmediateTriageChange}
          disabled={checkInLoading}
        />
      </div>

      <QueueRoutingForm
        destination={routingDestination}
        onDestinationChange={setRoutingDestination}
        disabled={checkInLoading || immediateTriage}
        immediateTriage={immediateTriage}
        hideWhenImmediateTriage
        classNames={lookup}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={lookup.btnPrimary}
          disabled={checkInLoading}
          onClick={handleCheckIn}
        >
          {routeLabel}
        </button>
        <Link
          to={`/front_office/patient/${patient.id}`}
          className={lookup.btnSecondary}
        >
          View EHR
        </Link>
      </div>
    </article>
  );
}
