import { Link } from 'react-router-dom';
import RegistrationStepper from './RegistrationStepper';

export default function PatientRegistrationStep2Page() {
  return (
    <>
      <header className="fo-reg-header">
        <h1 className="fo-reg-title">Patient registration</h1>
        <p className="fo-reg-sub">Step 2: Physical &amp; identity details</p>
      </header>

      <RegistrationStepper activeStep={2} />

      <div className="fo-reg-grid">
        <div>
          <div className="fo-card">
            <h3>Official identification</h3>
            <div className="fo-field">
              <label htmlFor="fo-govid">Government ID number</label>
              <input id="fo-govid" placeholder="e.g. 123-456-789" />
            </div>
            <div className="fo-field">
              <label htmlFor="fo-sector">Health care sector</label>
              <select id="fo-sector" defaultValue="public">
                <option value="public">Public healthcare</option>
                <option value="private">Private healthcare</option>
              </select>
            </div>
          </div>
          <div className="fo-card">
            <h3>Physical description</h3>
            <div className="fo-field">
              <label htmlFor="fo-phys">Distinguishing marks / height / build</label>
              <textarea
                id="fo-phys"
                placeholder="Describe any visible marks, approximate height (cm), and body build for emergency identification..."
              />
            </div>
          </div>
          <div className="fo-reg-actions">
            <Link to="/front_office/registration/step-1" className="fo-btn fo-btn-outline">
              ← Back
            </Link>
            <Link to="/front_office/registration/step-3" className="fo-btn fo-btn-primary">
              Save and continue →
            </Link>
          </div>
        </div>

        <aside>
          <div className="fo-sidebar-card fo-sidebar-blue">
            <h3>Physical ID check</h3>
            <p>
              Inspect the original ID in person: confirm the number is legible, dates are valid, and the photo matches
              the patient in front of you. For cracked, faded, or laminated cards, ask for a second approved document
              before continuing.
            </p>
            <p style={{ marginTop: '0.75rem', marginBottom: 0 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.15)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                Check ID expiry before save
              </span>
            </p>
          </div>
          <div className="fo-sidebar-card">
            <h3>Identity checks</h3>
            <ol style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8125rem', color: '#475569', lineHeight: 1.55 }}>
              <li>Government ID number must match the legal name captured in step 1—fix discrepancies now, not later.</li>
              <li>Examine the physical ID in good light—tilt the card if needed to read embossed or holographic fields.</li>
              <li>For minors or dependents, confirm whose ID you are capturing (patient vs. guardian).</li>
            </ol>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
              <strong>Unsure?</strong>
              <div style={{ color: '#94a3b8', fontWeight: 600, letterSpacing: '0.02em', marginTop: '0.25rem' }}>
                Ask the on-call registrar or charge nurse if the ID is damaged, foreign, or without a standard number.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
