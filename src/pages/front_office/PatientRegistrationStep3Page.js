import { Link } from 'react-router-dom';
import RegistrationStepper from './RegistrationStepper';

export default function PatientRegistrationStep3Page() {
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
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>
          75% complete
        </span>
      </div>

      <div className="fo-reg-grid">
        <div>
          <div className="fo-card">
            <h3>Patient contact details</h3>
            <div className="fo-field">
              <label htmlFor="fo-phone">Primary phone</label>
              <input id="fo-phone" type="tel" placeholder="+264 00 000 0000" />
            </div>
            <div className="fo-field">
              <label htmlFor="fo-addr">Home address</label>
              <textarea id="fo-addr" placeholder="Street number, building name, apartment unit..." rows={3} />
            </div>
            <div className="fo-field-row">
              <div className="fo-field">
                <label htmlFor="fo-city">Town / city</label>
                <input id="fo-city" placeholder="e.g. Windhoek" />
              </div>
              <div className="fo-field">
                <label htmlFor="fo-region">Region</label>
                <select id="fo-region" defaultValue="">
                  <option value="" disabled>
                    Select region
                  </option>
                  <option value="khomas">Khomas</option>
                  <option value="erongo">Erongo</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
          <div className="fo-card">
            <h3>Next of kin details</h3>
            <div className="fo-field">
              <label htmlFor="fo-nok-name">Full name</label>
              <input id="fo-nok-name" placeholder="Legal guardian or relative name" />
            </div>
            <div className="fo-field">
              <label htmlFor="fo-nok-rel">Relationship</label>
              <select id="fo-nok-rel" defaultValue="">
                <option value="" disabled>
                  Select relationship
                </option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="fo-field">
              <label htmlFor="fo-nok-phone">Emergency contact number</label>
              <input id="fo-nok-phone" type="tel" placeholder="+264 00 000 0000" />
            </div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                padding: '0.65rem',
                border: '1px dashed #cbd5e1',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <input type="checkbox" /> Same as home address
            </label>
          </div>
          <div className="fo-reg-actions">
            <Link to="/front_office/registration/step-2" className="fo-btn fo-btn-outline">
              ← Back
            </Link>
            <Link to="/front_office/registration/step-4" className="fo-btn fo-btn-primary">
              Continue →
            </Link>
          </div>
        </div>

        <aside>
          <div className="fo-sidebar-card fo-sidebar-blue">
            <h3>Reachable contacts</h3>
            <p>
              Enter a mobile number the patient actually answers (not a landline that rings an empty house). For next
              of kin, prefer someone who lives locally or can reach the hospital within an hour. Wrong contacts delay
              consent, billing, and emergency outreach.
            </p>
          </div>
          <div className="fo-sidebar-card">
            <h3 style={{ fontSize: '0.7rem', letterSpacing: '0.08em', color: '#94a3b8' }}>Before you continue</h3>
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.1rem', fontSize: '0.8125rem', color: '#475569', lineHeight: 1.55 }}>
              <li>Read the phone number back to the patient and confirm one digit at a time.</li>
              <li>Confirm town and region match the patient&apos;s spoken address (postal codes are often mistyped).</li>
              <li>If next of kin is not present, verify relationship and name spelling with the patient.</li>
            </ul>
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
              The summary panel will later pull from steps 1–2 automatically; for now use this list as a manual
              double-check.
            </p>
          </div>
          <div className="fo-sidebar-card" style={{ background: '#1e293b', color: '#fff' }}>
            <h3 style={{ color: '#fff' }}>If systems are slow</h3>
            <p style={{ margin: 0, fontSize: '0.8125rem', opacity: 0.92, lineHeight: 1.5 }}>
              Issue a paper queue ticket and keep a paper scratch pad of name, ID, and phone until the screen catches
              up—never send a patient away without a traceable record of attendance.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
