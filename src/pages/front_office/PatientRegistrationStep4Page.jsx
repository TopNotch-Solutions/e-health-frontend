import { Link } from 'react-router-dom';
import RegistrationGuard from './RegistrationGuard';
import { useRegistration } from './RegistrationContext';
import RegistrationStepper from './RegistrationStepper';
import { fo } from './styles/frontOfficeModuleClasses';

function Step4Form() {
  const { draft, submitRegistration, submitting, submitError } = useRegistration();

  async function onFinish(e) {
    e.preventDefault();
    await submitRegistration();
  }

  return (
    <div className={fo.page}>
      <header className={fo.header}>
        <h1 className={fo.title}>Patient registration</h1>
        <p className={fo.sub}>Step 4: Review &amp; submit to server</p>
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
            <strong>Emergency:</strong>{' '}
            {draft.is_emergency ? (
              <span className="font-semibold text-rose-700">Yes</span>
            ) : (
              'No'
            )}
          </li>
        </ul>
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
        <button type="button" className={fo.btnPrimary} disabled={submitting} onClick={onFinish}>
          {submitting ? 'Submitting…' : 'Finish registration'}
        </button>
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
