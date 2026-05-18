import { Link, useNavigate } from 'react-router-dom';
import RegistrationGuard from './RegistrationGuard';
import { useRegistration } from './RegistrationContext';
import RegistrationStepper from './RegistrationStepper';

function Step1Form() {
  const navigate = useNavigate();
  const { draft, updateField } = useRegistration();

  function onNext(e) {
    e.preventDefault();
    if (!draft.first_name.trim() || !draft.last_name.trim() || !draft.sex) return;
    navigate('/front_office/registration/step-2');
  }

  return (
    <>
      <header className="fo-reg-header">
        <p className="fo-reg-kicker">New admission</p>
        <h1 className="fo-reg-title">New patient registration</h1>
        <p className="fo-reg-sub">Step 1: Personal information</p>
      </header>
      <RegistrationStepper activeStep={1} />
      <form onSubmit={onNext} className="fo-reg-grid">
        <section>
          <article className="fo-card">
            <h3>Personal details</h3>
            <div className="fo-field-row">
              <p className="fo-field">
                <label htmlFor="fo-fn">First name *</label>
                <input
                  id="fo-fn"
                  required
                  value={draft.first_name}
                  onChange={(e) => updateField('first_name', e.target.value)}
                />
              </p>
              <p className="fo-field">
                <label htmlFor="fo-ln">Last name *</label>
                <input
                  id="fo-ln"
                  required
                  value={draft.last_name}
                  onChange={(e) => updateField('last_name', e.target.value)}
                />
              </p>
            </div>
            <p className="fo-field">
              <label htmlFor="fo-dob">Date of birth</label>
              <input
                id="fo-dob"
                type="date"
                value={draft.date_of_birth}
                onChange={(e) => updateField('date_of_birth', e.target.value)}
              />
            </p>
            <p className="fo-field">
              <label htmlFor="fo-sex">Sex *</label>
              <select id="fo-sex" required value={draft.sex} onChange={(e) => updateField('sex', e.target.value)}>
                <option value="" disabled>
                  Select sex
                </option>
                <option value="f">Female</option>
                <option value="m">Male</option>
                <option value="x">Other</option>
              </select>
            </p>
          </article>
          <footer className="fo-reg-actions">
            <Link to="/front_office" className="fo-btn fo-btn-outline">
              Cancel
            </Link>
            <button type="submit" className="fo-btn fo-btn-primary">
              Next step ?
            </button>
          </footer>
        </section>
      </form>
    </>
  );
}

export default function PatientRegistrationStep1Page() {
  return (
    <RegistrationGuard>
      <Step1Form />
    </RegistrationGuard>
  );
}
