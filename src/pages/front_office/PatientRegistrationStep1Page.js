import { Link } from 'react-router-dom';
import RegistrationStepper from './RegistrationStepper';

export default function PatientRegistrationStep1Page() {
  return (
    <>
      <header className="fo-reg-header">
        <p className="fo-reg-kicker">New admission</p>
        <h1 className="fo-reg-title">New patient registration</h1>
        <p className="fo-reg-sub">Step 1: Personal information</p>
      </header>

      <RegistrationStepper activeStep={1} />

      <div className="fo-reg-grid">
        <div>
          <div className="fo-card">
            <h3>Personal details</h3>
            <div className="fo-field-row">
              <div className="fo-field">
                <label htmlFor="fo-fn">First name</label>
                <input id="fo-fn" placeholder="e.g. Jonathan" autoComplete="given-name" />
              </div>
              <div className="fo-field">
                <label htmlFor="fo-ln">Last name</label>
                <input id="fo-ln" placeholder="e.g. Doe" autoComplete="family-name" />
              </div>
            </div>
            <div className="fo-field">
              <label htmlFor="fo-dob">Date of birth</label>
              <input id="fo-dob" type="text" placeholder="MM/DD/YYYY" autoComplete="bday" />
            </div>
            <div className="fo-field">
              <label htmlFor="fo-sex">Sex</label>
              <select id="fo-sex" defaultValue="">
                <option value="" disabled>
                  Select sex
                </option>
                <option value="f">Female</option>
                <option value="m">Male</option>
                <option value="x">Other / prefer not to say</option>
              </select>
            </div>
          </div>
          <div className="fo-reg-actions">
            <Link to="/front_office" className="fo-btn fo-btn-outline">
              Cancel
            </Link>
            <Link to="/front_office/registration/step-2" className="fo-btn fo-btn-primary">
              Next step →
            </Link>
          </div>
        </div>

        <aside>
          <div className="fo-sidebar-card fo-sidebar-blue">
            <h3>Privacy at the desk</h3>
            <p>
              Do not leave a patient record open on an unattended screen. Lower your voice when confirming identifiers
              if others are waiting nearby. Only collect details needed for this visit—extra questions belong in the
              clinical area.
            </p>
          </div>
          <div className="fo-sidebar-card">
            <h3>Support &amp; escalation</h3>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.55 }}>
              <strong>Hospital switchboard:</strong> +264 61 203 2000 (example—replace with your facility PABX).
              <br />
              <strong>IT service desk:</strong> it.support@hospital.na (example—replace with your helpdesk).
              <br />
              <br />
              For urgent patient safety issues after handoff, use the ward or emergency escalation list—not informal
              messaging.
            </p>
            <button type="button" className="fo-btn fo-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
              Log a ticket / request callback
            </button>
          </div>
          <div className="fo-sidebar-card" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#1e40af', lineHeight: 1.5 }}>
              <strong>Spelling check:</strong> spell the surname back to the patient letter-by-letter to avoid
              duplicate charts (common with similar surnames). Match first name exactly to the ID—nicknames go in
              notes, not the legal name field.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
