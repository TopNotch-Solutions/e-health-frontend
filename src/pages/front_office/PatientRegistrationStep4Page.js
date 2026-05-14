import { Link, useNavigate } from 'react-router-dom';
import RegistrationStepper from './RegistrationStepper';

export default function PatientRegistrationStep4Page() {
  const navigate = useNavigate();

  return (
    <>
      <header className="fo-reg-header">
        <h1 className="fo-reg-title">Patient registration</h1>
        <p className="fo-reg-sub">Step 4: Additional details</p>
      </header>

      <RegistrationStepper activeStep={4} />

      <div className="fo-progress">
        <div className="fo-progress-bar">
          <div className="fo-progress-fill" style={{ width: '100%' }} />
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>
          100% complete
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div className="fo-card" style={{ marginBottom: 0 }}>
          <h3>Occupational background</h3>
          <div className="fo-field">
            <label htmlFor="fo-job">Current occupation</label>
            <input id="fo-job" placeholder="e.g. Software engineer" />
          </div>
          <div className="fo-field">
            <label htmlFor="fo-emp">Employer</label>
            <input id="fo-emp" placeholder="Company name" />
          </div>
          <div className="fo-field">
            <label htmlFor="fo-env">Work environment</label>
            <select id="fo-env" defaultValue="">
              <option value="" disabled>
                Select environment type
              </option>
              <option value="office">Office</option>
              <option value="field">Field / outdoor</option>
              <option value="clinical">Clinical</option>
            </select>
          </div>
        </div>
        <div className="fo-card" style={{ marginBottom: 0 }}>
          <h3>Self-reported sensitivities</h3>
          <div className="fo-field">
            <label>Allergies (press Enter to add)</label>
            <div className="fo-tag-input">
              <span className="fo-tag">Penicillin ×</span>
              <span className="fo-tag">Peanuts ×</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#b91c1c', lineHeight: 1.45 }}>
            <strong>Hospital tip:</strong> enter drug allergies exactly as on the patient&apos;s wallet card or clinic
            letter—avoid abbreviations your pharmacy system might not recognise. If the patient is unsure, record
            &quot;unknown&quot; and flag nursing to reconcile before any medication is ordered.
          </p>
        </div>
        <div className="fo-card" style={{ marginBottom: 0 }}>
          <h3>Communication</h3>
          <div className="fo-field">
            <label htmlFor="fo-lang1">Primary language</label>
            <input id="fo-lang1" defaultValue="English" />
          </div>
          <div className="fo-field">
            <label htmlFor="fo-lang2">Secondary languages</label>
            <input id="fo-lang2" placeholder="Oshiwambo, Afrikaans, etc." />
          </div>
          <div className="fo-toggle-row">
            <span>Interpreter required for consultations?</span>
            <input type="checkbox" aria-label="Interpreter required" />
          </div>
        </div>
        <div className="fo-card" style={{ marginBottom: 0 }}>
          <h3>Cultural &amp; religious preferences</h3>
          <div className="fo-field">
            <label htmlFor="fo-rel">Religious affiliation (optional)</label>
            <input id="fo-rel" placeholder="Select or specify" />
          </div>
          <div className="fo-field">
            <label htmlFor="fo-care">Care preferences</label>
            <textarea
              id="fo-care"
              rows={3}
              placeholder="Dietary restrictions, gender preferences for staff, holiday observances, etc."
            />
          </div>
        </div>
      </div>

      <div className="fo-reg-actions">
        <Link to="/front_office/registration/step-3" className="fo-btn fo-btn-outline">
          ← Back
        </Link>
        <button
          type="button"
          className="fo-btn fo-btn-primary"
          onClick={() => navigate('/front_office')}
        >
          Finish registration ✓
        </button>
      </div>
    </>
  );
}
