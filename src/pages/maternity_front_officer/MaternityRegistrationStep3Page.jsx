import { Link, useNavigate } from 'react-router-dom';
import RegistrationStepper from '../front_office/RegistrationStepper';
import { useToast } from '../front_office/context/ToastContext';
import { validatePhone } from '../front_office/utils/validation';
import { fo } from '../front_office/styles/frontOfficeModuleClasses';
import MaternityRegistrationGuard from './MaternityRegistrationGuard';
import { useMaternityRegistration } from './MaternityRegistrationContext';

function Step3Form() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { draft, updateField } = useMaternityRegistration();

  function onNext(e) {
    e.preventDefault();
    if (!draft.immediate_triage) {
      const phoneError = validatePhone(draft.phone);
      if (phoneError) {
        showToast(phoneError, 'error');
        return;
      }
    }
    navigate('/maternity_front_officer/registration/step-4');
  }

  return (
    <div className={fo.page}>
      <header className={fo.header}>
        <p className={fo.kicker}>New admission</p>
        <h1 className={fo.title}>Patient registration</h1>
        <p className={fo.sub}>Step 3: Contact &amp; next of kin</p>
      </header>
      <RegistrationStepper activeStep={3} />
      <div className={fo.progressWrap}>
        <div className={fo.progressTrack} aria-hidden>
          <div className={fo.progressFill} style={{ width: '75%' }} />
        </div>
        <span className={fo.progressLabel}>75% complete</span>
      </div>
      <form onSubmit={onNext} className={fo.form}>
        <article className={fo.sectionPanel}>
          <h3 className={fo.sectionTitle}>Patient contact details</h3>
          <p className={`${fo.field} mt-4`}>
            <label className={fo.label} htmlFor="mfo-phone">Primary phone *</label>
            <input
              id="mfo-phone"
              type="tel"
              className={fo.input}
              required={!draft.immediate_triage}
              value={draft.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </p>
          <p className={fo.field}>
            <label className={fo.label} htmlFor="mfo-addr">Home address</label>
            <textarea
              id="mfo-addr"
              rows={3}
              className={fo.textarea}
              value={draft.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
          </p>
          <div className={`${fo.fieldRow} mt-4`}>
            <p className={fo.field}>
              <label className={fo.label} htmlFor="mfo-city">Town / city</label>
              <input
                id="mfo-city"
                className={fo.input}
                value={draft.city}
                onChange={(e) => updateField('city', e.target.value)}
              />
            </p>
            <p className={fo.field}>
              <label className={fo.label} htmlFor="mfo-region">Region</label>
              <select
                id="mfo-region"
                className={fo.select}
                value={draft.region}
                onChange={(e) => updateField('region', e.target.value)}
              >
                <option value="">Select region</option>
                <option value="khomas">Khomas</option>
                <option value="erongo">Erongo</option>
                <option value="other">Other</option>
              </select>
            </p>
          </div>
        </article>
        <article className={`${fo.sectionPanel} mt-4`}>
          <h3 className={fo.sectionTitle}>Next of kin</h3>
          <p className={`${fo.field} mt-4`}>
            <label className={fo.label} htmlFor="mfo-nok-name">Full name</label>
            <input
              id="mfo-nok-name"
              className={fo.input}
              value={draft.emergency_contact_name}
              onChange={(e) => updateField('emergency_contact_name', e.target.value)}
            />
          </p>
          <p className={fo.field}>
            <label className={fo.label} htmlFor="mfo-nok-phone">Emergency phone</label>
            <input
              id="mfo-nok-phone"
              type="tel"
              className={fo.input}
              value={draft.emergency_contact_phone}
              onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
            />
          </p>
        </article>
        <footer className={fo.actions}>
          <Link to="/maternity_front_officer/registration/step-2" className={fo.btnOutline}>Back</Link>
          <button type="submit" className={fo.btnPrimary}>Continue</button>
        </footer>
      </form>
    </div>
  );
}

export default function MaternityRegistrationStep3Page() {
  return (
    <MaternityRegistrationGuard>
      <Step3Form />
    </MaternityRegistrationGuard>
  );
}
