import { Link } from 'react-router-dom';
import { confirmAction } from '../../utils/confirmAction';
import EmergencyPatientToggle from '../front_office/components/EmergencyPatientToggle';
import ImmediateTriageToggle from '../front_office/components/ImmediateTriageToggle';
import RegistrationStepper from '../front_office/RegistrationStepper';
import { fo } from '../front_office/styles/frontOfficeModuleClasses';
import { formatMaternityAgeLabel } from './maternityPatientUtils';
import MaternityQueueRoutingForm from './components/MaternityQueueRoutingForm';
import { maternityRoutingButtonLabel } from './constants/maternityRoutingOptions';
import MaternityRegistrationGuard from './MaternityRegistrationGuard';
import { useMaternityRegistration } from './MaternityRegistrationContext';

function Step4Form() {
  const { draft, updateField, submitRegistration, submitting, submitError } = useMaternityRegistration();
  const ageLabel = formatMaternityAgeLabel(draft.date_of_birth);

  function handleImmediateTriageChange(checked) {
    updateField('immediate_triage', checked);
    if (checked) updateField('routing_destination', '');
  }

  async function onFinish(e) {
    e.preventDefault();
    const finishLabel = maternityRoutingButtonLabel({
      destination: draft.routing_destination,
      immediateTriage: draft.immediate_triage,
      loading: submitting,
      action: 'Finish & route',
    });
    const routeLabel = draft.immediate_triage
      ? 'Maternity ICU'
      : (draft.routing_destination || 'the selected queue');
    if (!(await confirmAction({
      title: 'Finish registration?',
      text: draft.immediate_triage
        ? `Register ${draft.first_name} ${draft.last_name} and route to Maternity ICU?`
        : `Register ${draft.first_name} ${draft.last_name} and route to ${routeLabel}?`,
      icon: 'question',
      confirmButtonText: finishLabel,
    }))) return;
    try {
      await submitRegistration();
    } catch {
      // Errors are handled in submitRegistration (inline message + toast).
    }
  }

  const isDuplicateError = submitError && /already registered/i.test(submitError);

  const finishLabel = maternityRoutingButtonLabel({
    destination: draft.routing_destination,
    immediateTriage: draft.immediate_triage,
    loading: submitting,
    action: 'Finish & route',
  });

  const canFinishRoute = Boolean(draft.routing_destination) || Boolean(draft.immediate_triage);

  return (
    <div className={fo.page}>
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

      <article className={fo.sectionPanel}>
        <h3 className={fo.sectionTitle}>Summary</h3>
        <ul className={`${fo.summaryList} mt-4`}>
          <li><strong>Name:</strong> {draft.first_name} {draft.last_name}</li>
          <li><strong>DOB:</strong> {draft.date_of_birth || '—'}</li>
          {ageLabel ? <li><strong>Age:</strong> {ageLabel}</li> : null}
          <li><strong>Sex:</strong> Female</li>
          <li><strong>National ID:</strong> {draft.id_number || '—'}</li>
          <li><strong>Phone:</strong> {draft.phone || '—'}</li>
          <li><strong>Payment:</strong> {draft.payment_type === 'private' ? 'Private' : 'Public'}</li>
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
          id="mfo-reg-step4-emergency"
          checked={Boolean(draft.is_emergency)}
          onChange={(v) => updateField('is_emergency', v)}
          disabled={submitting || draft.immediate_triage}
        />
        <ImmediateTriageToggle
          id="mfo-reg-step4-triage"
          checked={Boolean(draft.immediate_triage)}
          onChange={handleImmediateTriageChange}
          disabled={submitting}
        />
        <MaternityQueueRoutingForm
          destination={draft.routing_destination}
          onDestinationChange={(v) => updateField('routing_destination', v)}
          disabled={submitting || draft.immediate_triage}
          immediateTriage={draft.immediate_triage}
          hideWhenImmediateTriage
        />
      </article>

      {submitError ? (
        <div role="alert" className="space-y-2">
          <p className={fo.error}>{submitError}</p>
          {isDuplicateError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              This patient may already be on the register. Cancel registration and use{' '}
              <strong>Patient lookup</strong> on the dashboard to find and check them in instead
              of creating a duplicate record.
            </p>
          ) : null}
        </div>
      ) : null}

      <footer className={fo.actions}>
        <Link to="/maternity_front_officer/registration/step-3" className={fo.btnOutline}>Back</Link>
        {canFinishRoute ? (
          <button type="button" className={fo.btnPrimary} disabled={submitting} onClick={onFinish}>
            {finishLabel}
          </button>
        ) : (
          <p className="text-sm text-slate-500">
            Select a destination above to finish registration.
          </p>
        )}
      </footer>
    </div>
  );
}

export default function MaternityRegistrationStep4Page() {
  return (
    <MaternityRegistrationGuard>
      <Step4Form />
    </MaternityRegistrationGuard>
  );
}
