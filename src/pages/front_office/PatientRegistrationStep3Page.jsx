import { Link, useNavigate } from 'react-router-dom';
import RegistrationGuard from './RegistrationGuard';
import { useRegistration } from './RegistrationContext';
import RegistrationStepper from './RegistrationStepper';
import NamibiaTownRegionFields from './components/NamibiaTownRegionFields';
import { useToast } from './context/ToastContext';
import { validatePhone, validateRequiredText } from './utils/validation';
import { fo } from './styles/frontOfficeModuleClasses';

function Step3Form() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { draft, updateField, patchDraft } = useRegistration();

  function onNext(e) {
    e.preventDefault();
    const nameError = validateRequiredText(draft.emergency_contact_name, {
      label: 'next of kin full name',
    });
    if (nameError) {
      showToast(nameError, 'error');
      return;
    }
    const phoneError = validatePhone(draft.emergency_contact_phone || '', {
      label: 'emergency phone number',
    });
    if (phoneError) {
      showToast(phoneError, 'error');
      return;
    }
    navigate('/front_office/registration/step-4');
  }

  return (
    <div className={fo.page}>
      <div className={fo.registrationIntro}>
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
      </div>
      <form onSubmit={onNext} className={fo.form}>
        <article className={fo.sectionPanel}>
          <h3 className={fo.sectionTitle}>Patient contact details</h3>
          <p className={`${fo.field} mt-4`}>
            <label className={fo.label} htmlFor="fo-phone">
              Primary phone <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              id="fo-phone"
              type="tel"
              className={fo.input}
              value={draft.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </p>
          <p className={fo.field}>
            <label className={fo.label} htmlFor="fo-addr">
              Home address
            </label>
            <textarea
              id="fo-addr"
              rows={3}
              className={fo.textarea}
              value={draft.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
          </p>
          <NamibiaTownRegionFields
            city={draft.city}
            region={draft.region}
            onChange={patchDraft}
          />
        </article>
        <article className={`${fo.sectionPanel} mt-4`}>
          <h3 className={fo.sectionTitle}>Next of kin</h3>
          <p className={`${fo.field} mt-4`}>
            <label className={fo.label} htmlFor="fo-nok-name">
              Full name *
            </label>
            <input
              id="fo-nok-name"
              className={fo.input}
              value={draft.emergency_contact_name}
              onChange={(e) => updateField('emergency_contact_name', e.target.value)}
            />
          </p>
          <p className={fo.field}>
            <label className={fo.label} htmlFor="fo-nok-phone">
              Emergency phone *
            </label>
            <input
              id="fo-nok-phone"
              type="tel"
              className={fo.input}
              value={draft.emergency_contact_phone}
              onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
            />
          </p>
        </article>
        <footer className={fo.actions}>
          <Link to="/front_office/registration/step-2" className={fo.btnOutline}>
            Back
          </Link>
          <button type="submit" className={fo.btnPrimary}>
            Continue
          </button>
        </footer>
      </form>
    </div>
  );
}

export default function PatientRegistrationStep3Page() {
  return (
    <RegistrationGuard>
      <Step3Form />
    </RegistrationGuard>
  );
}
