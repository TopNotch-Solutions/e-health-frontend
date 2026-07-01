import { Link, useNavigate } from 'react-router-dom';
import RegistrationGuard from './RegistrationGuard';
import { useRegistration } from './RegistrationContext';
import RegistrationStepper from './RegistrationStepper';
import { fo } from './styles/frontOfficeModuleClasses';

function Step2Form() {
  const navigate = useNavigate();
  const { draft, updateField } = useRegistration();

  function onNext(e) {
    e.preventDefault();
    navigate('/front_office/registration/step-3');
  }

  return (
    <div className={fo.page}>
      <div className={fo.registrationIntro}>
        <header className={fo.header}>
          <h1 className={fo.title}>Patient registration</h1>
          <p className={fo.sub}>Step 2: Identity &amp; payment</p>
        </header>
        <RegistrationStepper activeStep={2} />
      </div>
      <form onSubmit={onNext} className={fo.form}>
        <article className={fo.sectionPanel}>
          <h3 className={fo.sectionTitle}>Official identification</h3>
          <p className={`${fo.field} mt-4`}>
            <label className={fo.label} htmlFor="fo-govid">
              Government ID number <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              id="fo-govid"
              className={fo.input}
              value={draft.id_number}
              onChange={(e) => updateField('id_number', e.target.value)}
            />
          </p>
          <p className={fo.field}>
            <label className={fo.label} htmlFor="fo-sector">
              Health care sector
            </label>
            <select
              id="fo-sector"
              className={fo.select}
              value={draft.payment_type}
              onChange={(e) => updateField('payment_type', e.target.value)}
            >
              <option value="state">Public healthcare</option>
              <option value="private">Private healthcare</option>
            </select>
          </p>
        </article>
        <article className={`${fo.sectionPanel} mt-4`}>
          <h3 className={fo.sectionTitle}>Physical description (stored in address notes)</h3>
          <p className={`${fo.field} mt-4`}>
            <label className={fo.label} htmlFor="fo-phys">
              Distinguishing marks
            </label>
            <textarea
              id="fo-phys"
              rows={3}
              className={fo.textarea}
              value={draft.physical_notes}
              onChange={(e) => updateField('physical_notes', e.target.value)}
            />
          </p>
        </article>
        <footer className={fo.actions}>
          <Link to="/front_office/registration/step-1" className={fo.btnOutline}>
            ← Back
          </Link>
          <button type="submit" className={fo.btnPrimary}>
            Save and continue →
          </button>
        </footer>
      </form>
    </div>
  );
}

export default function PatientRegistrationStep2Page() {
  return (
    <RegistrationGuard>
      <Step2Form />
    </RegistrationGuard>
  );
}
