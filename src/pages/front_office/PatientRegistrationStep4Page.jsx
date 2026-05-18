import { Link } from 'react-router-dom';
import RegistrationGuard from './RegistrationGuard';
import { useRegistration } from './RegistrationContext';
import RegistrationStepper from './RegistrationStepper';

function Step4Form() {
  const { draft, submitRegistration, submitting, submitError } = useRegistration();

  async function onFinish(e) {
    e.preventDefault();
    await submitRegistration();
  }

  return (
    <>
      <header className="fo-reg-header">
        <h1 className="fo-reg-title">Patient registration</h1>
        <p className="fo-reg-sub">Step 4: Review &amp; submit to server</p>
      </header>
      <RegistrationStepper activeStep={4} />
      <div className="fo-progress">
        <div className="fo-progress-bar">
          <div className="fo-progress-fill" style={{ width: '100%' }} />
        </div>
        <span className="text-sm font-bold text-slate-500">Ready to submit</span>
      </div>

      <article className="fo-card">
        <h3>Summary</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>
            <strong>Name:</strong> {draft.first_name} {draft.last_name}
          </li>
          <li>
            <strong>DOB:</strong> {draft.date_of_birth || '?'}
          </li>
          <li>
            <strong>Sex:</strong> {draft.sex || '?'}
          </li>
          <li>
            <strong>National ID:</strong> {draft.id_number || '?'}
          </li>
          <li>
            <strong>Phone:</strong> {draft.phone || '?'}
          </li>
          <li>
            <strong>Payment:</strong> {draft.payment_type === 'private' ? 'Private' : 'Public'}
          </li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          Submitting creates the patient via the API, opens a visit, and queues nursing.
        </p>
      </article>

      {submitError ? (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      <footer className="fo-reg-actions">
        <Link to="/front_office/registration/step-3" className="fo-btn fo-btn-outline">
          Back
        </Link>
        <button type="button" className="fo-btn fo-btn-primary" disabled={submitting} onClick={onFinish}>
          {submitting ? 'Submitting?' : 'Finish registration'}
        </button>
      </footer>
    </>
  );
}

export default function PatientRegistrationStep4Page() {
  return (
    <RegistrationGuard>
      <Step4Form />
    </RegistrationGuard>
  );
}
