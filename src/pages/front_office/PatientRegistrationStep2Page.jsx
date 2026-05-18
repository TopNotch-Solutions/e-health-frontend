import { Link, useNavigate } from 'react-router-dom';
import RegistrationGuard from './RegistrationGuard';
import { useRegistration } from './RegistrationContext';
import RegistrationStepper from './RegistrationStepper';

function Step2Form() {
  const navigate = useNavigate();
  const { draft, updateField } = useRegistration();

  function onNext(e) {
    e.preventDefault();
    navigate('/front_office/registration/step-3');
  }

  return (
    <>
      <header className="fo-reg-header">
        <h1 className="fo-reg-title">Patient registration</h1>
        <p className="fo-reg-sub">Step 2: Identity &amp; payment</p>
      </header>
      <RegistrationStepper activeStep={2} />
      <form onSubmit={onNext} className="fo-reg-grid">
        <section>
          <article className="fo-card">
            <h3>Official identification</h3>
            <div className="fo-field">
              <label htmlFor="fo-govid">Government ID number</label>
              <input
                id="fo-govid"
                value={draft.id_number}
                onChange={(e) => updateField('id_number', e.target.value)}
              />
            </div>
            <div className="fo-field">
              <label htmlFor="fo-sector">Health care sector</label>
              <select
                id="fo-sector"
                value={draft.payment_type}
                onChange={(e) => updateField('payment_type', e.target.value)}
              >
                <option value="state">Public healthcare</option>
                <option value="private">Private healthcare</option>
              </select>
            </div>
          </article>
          <article className="fo-card">
            <h3>Physical description (stored in address notes)</h3>
            <div className="fo-field">
              <label htmlFor="fo-phys">Distinguishing marks</label>
              <textarea
                id="fo-phys"
                rows={3}
                value={draft.physical_notes}
                onChange={(e) => updateField('physical_notes', e.target.value)}
              />
            </div>
          </article>
          <footer className="fo-reg-actions">
            <Link to="/front_office/registration/step-1" className="fo-btn fo-btn-outline">
              ← Back
            </Link>
            <button type="submit" className="fo-btn fo-btn-primary">
              Save and continue →
            </button>
          </footer>
        </section>
      </form>
    </>
  );
}

export default function PatientRegistrationStep2Page() {
  return (
    <RegistrationGuard>
      <Step2Form />
    </RegistrationGuard>
  );
}
