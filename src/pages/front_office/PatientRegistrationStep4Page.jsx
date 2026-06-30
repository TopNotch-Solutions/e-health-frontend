import { Link } from 'react-router-dom';
import { confirmAction } from '../../utils/confirmAction';
import { useClinicRoutingOptions } from '../../hooks/useClinicRoutingOptions';
import RegistrationGuard from './RegistrationGuard';
import { useRegistration } from './RegistrationContext';
import RegistrationStepper from './RegistrationStepper';
import EmergencyPatientToggle from './components/EmergencyPatientToggle';
import ImmediateTriageToggle from './components/ImmediateTriageToggle';
import QueueRoutingForm, { routingButtonLabel } from './components/QueueRoutingForm';
import { fo } from './styles/frontOfficeModuleClasses';

function Step4Form() {
  const { draft, updateField, submitRegistration, submitting, submitError } = useRegistration();
  const { options: routingOptions } = useClinicRoutingOptions();
  const isHospital = Boolean(routingOptions?.is_hospital);
  const frontOfficeDestinations = routingOptions?.front_office;
  const emergencyUnitAvailable = !isHospital && routingOptions?.emergency_unit_available !== false;

  function handleImmediateTriageChange(checked) {
    updateField('immediate_triage', checked);
    if (checked) updateField('routing_destination', '');
  }

  async function onFinish(e) {
    e.preventDefault();
    const finishLabel = routingButtonLabel({
      destination: draft.routing_destination,
      immediateTriage: draft.immediate_triage,
      loading: submitting,
      action: 'Finish & route',
      destinations: frontOfficeDestinations,
    });
    const routeLabel = draft.immediate_triage
      ? 'Emergency Unit'
      : (isHospital ? 'Nurse' : (draft.routing_destination || 'the selected queue'));
    if (!(await confirmAction({
      title: 'Finish registration?',
      text: draft.immediate_triage
        ? `Register ${draft.first_name} ${draft.last_name} and route to Emergency Unit?`
        : `Register ${draft.first_name} ${draft.last_name} and route to ${routeLabel}?`,
      icon: 'question',
      confirmButtonText: finishLabel,
    }))) return;
    await submitRegistration();
  }

  const finishLabel = routingButtonLabel({
    destination: draft.routing_destination,
    immediateTriage: draft.immediate_triage,
    loading: submitting,
    action: 'Finish & route',
    destinations: frontOfficeDestinations,
  });

  const canFinishRoute = Boolean(draft.routing_destination)
    || Boolean(draft.immediate_triage)
    || isHospital;

  return (
    <div className={fo.page}>
      <div className={fo.registrationIntro}>
        <header className={fo.header}>
          <h1 className={fo.title}>Patient registration</h1>
          <p className={fo.sub}>Step 4: Review, route &amp; submit</p>
        </header>
        <RegistrationStepper activeStep={4} />
        <div className={fo.progressWrap}>
          <div className={fo.progressTrack} aria-hidden>
            <div className={fo.progressFill} style={{ width: '100%' }} />
          </div>
          <span className={fo.progressLabel}>Ready to submit</span>
        </div>
      </div>

      <article className={fo.sectionPanel}>
        <h3 className={fo.sectionTitle}>Summary</h3>
        <ul className={`${fo.summaryList} mt-4`}>
          <li>
            <strong>Name:</strong> {draft.first_name} {draft.last_name}
          </li>
          <li>
            <strong>DOB:</strong> {draft.date_of_birth || '—'}
          </li>
          <li>
            <strong>Sex:</strong> {draft.sex || '—'}
          </li>
          <li>
            <strong>National ID:</strong> {draft.id_number || '—'}
          </li>
          <li>
            <strong>Phone:</strong> {draft.phone || '—'}
          </li>
          <li>
            <strong>Payment:</strong> {draft.payment_type === 'private' ? 'Private' : 'Public'}
          </li>
          <li>
            <strong>Emergency case:</strong>{' '}
            {draft.is_emergency ? (
              <span className="font-semibold text-rose-700">Yes</span>
            ) : (
              'No'
            )}
          </li>
        </ul>
      </article>

      <article className={`${fo.sectionPanel} mt-4 space-y-3`}>
        <h3 className={fo.sectionTitle}>Routing &amp; emergency</h3>
        <EmergencyPatientToggle
          id="fo-reg-step4-emergency"
          checked={Boolean(draft.is_emergency)}
          onChange={(v) => updateField('is_emergency', v)}
          disabled={submitting || draft.immediate_triage}
        />
        <ImmediateTriageToggle
          id="fo-reg-step4-triage"
          checked={Boolean(draft.immediate_triage)}
          onChange={handleImmediateTriageChange}
          disabled={submitting || !emergencyUnitAvailable}
        />
        <QueueRoutingForm
          destination={draft.routing_destination}
          onDestinationChange={(v) => updateField('routing_destination', v)}
          patientSex={draft.sex}
          patientDateOfBirth={draft.date_of_birth}
          facilityDestinations={frontOfficeDestinations}
          isHospital={isHospital}
          disabled={submitting || draft.immediate_triage}
          immediateTriage={draft.immediate_triage}
          hideWhenImmediateTriage
        />
      </article>

      {submitError ? (
        <p role="alert" className={fo.error}>
          {submitError}
        </p>
      ) : null}

      <footer className={fo.actions}>
        <Link to="/front_office/registration/step-3" className={fo.btnOutline}>
          Back
        </Link>
        {canFinishRoute ? (
          <button type="button" className={fo.btnPrimary} disabled={submitting} onClick={onFinish}>
            {finishLabel}
          </button>
        ) : (
          <p className="text-sm text-slate-500">
            Select a destination sector above to finish registration.
          </p>
        )}
      </footer>
    </div>
  );
}

export default function PatientRegistrationStep4Page() {
  return (
    <RegistrationGuard>
      <Step4Form />
    </RegistrationGuard>
  );
}
