import { Link, useNavigate } from 'react-router-dom';
import RegistrationGuard from './RegistrationGuard';
import { useRegistration } from './RegistrationContext';
import RegistrationStepper from './RegistrationStepper';

function Step3Form() {
  const navigate = useNavigate();
  const { draft, updateField } = useRegistration();

  function onNext(e) {
    e.preventDefault();
    navigate('/front_office/registration/step-4');
  }

  return (
    <>
      <header className="fo-reg-header">
        <p className="fo-reg-kicker">New admission</p>
        <h1 className="fo-reg-title">Patient registration</h1>
        <p className="fo-reg-sub">Step 3: Contact &amp; next of kin</p>
      </header>
      <RegistrationStepper activeStep={3} />
      <div className="fo-progress">
        <div className="fo-progress-bar">
          <div className="fo-progress-fill" style={{ width: '75%' }} />
        </div>
        <span className="text-sm font-bold text-slate-500">75% complete</span>
      </div>
      <form onSubmit={onNext} className="fo-reg-grid">
        <section>
          <article className="fo-card">
            <h3>Patient contact details</h3>
            <div className="fo-field">
              <label htmlFor="fo-phone">Primary phone</label>
              <input
                id="fo-phone"
                type="tel"
                value={draft.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
            <div className="fo-field">
              <label htmlFor="fo-addr">Home address</label>
              <textarea
                id="fo-addr"
                rows={3}
                value={draft.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>
            <div className="fo-field-row">
              <div className="fo-field">
                <label htmlFor="fo-city">Town / city</label>
                <input id="fo-city" value={draft.city} onChange={(e) => updateField('city', e.target.value)} />
              </div>
              <div className="fo-field">
                <label htmlFor="fo-region">Region</label>
                <select id="fo-region" value={draft.region} onChange={(e) => updateField('region', e.target.value)}>
                  <option value="">Select region</option>
                  <option value="khomas">Khomas</option>
                  <option value="erongo">Erongo</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </article>
          <article className="fo-card">
            <h3>Next of kin</h3>
            <div className="fo-field">
              <label htmlFor="fo-nok-name">Full name</label>
              <input
                id="fo-nok-name"
                value={draft.emergency_contact_name}
                onChange={(e) => updateField('emergency_contact_name', e.target.value)}
              />
            </div>
            <div className="fo-field">
              <label htmlFor="fo-nok-phone">Emergency phone</label>
              <input
                id="fo-nok-phone"
                type="tel"
                value={draft.emergency_contact_phone}
                onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
              />
            </div>
          </article>
          <footer className="fo-reg-actions">
            <Link to="/front_office/registration/step-2" className="fo-btn fo-btn-outline">
              Back
            </Link>
            <button type="submit" className="fo-btn fo-btn-primary">
              Continue
            </button>
          </footer>
        </section>
      </form>
    </>
  );
}

export default function PatientRegistrationStep3Page() {
  return (
    <RegistrationGuard>
      <Step3Form />
    </RegistrationGuard>
  );
}
