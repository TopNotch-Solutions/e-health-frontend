import { Link, useNavigate } from 'react-router-dom';
import RegistrationStepper from '../front_office/RegistrationStepper';
import { useToast } from '../front_office/context/ToastContext';
import { validateNationalId } from '../front_office/utils/validation';
import { fo } from '../front_office/styles/frontOfficeModuleClasses';
import MaternityRegistrationGuard from './MaternityRegistrationGuard';
import { useMaternityRegistration } from './MaternityRegistrationContext';

function Step2Form() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { draft, updateField } = useMaternityRegistration();

  function onNext(e) {
    e.preventDefault();
    if (!draft.immediate_triage) {
      const idError = validateNationalId(draft.id_number);
      if (idError) {
        showToast(idError, 'error');
        return;
      }
    }
    navigate('/maternity_front_officer/registration/step-3');
  }

  return (
    <div className={fo.page}>
      <header className={fo.header}>
        <h1 className={fo.title}>Patient registration</h1>
        <p className={fo.sub}>Step 2: Identity &amp; payment</p>
      </header>
      <RegistrationStepper activeStep={2} />
      <form onSubmit={onNext} className={fo.form}>
        <article className={fo.sectionPanel}>
          <h3 className={fo.sectionTitle}>Official identification</h3>
          <p className={`${fo.field} mt-4`}>
            <label className={fo.label} htmlFor="mfo-govid">Government ID number *</label>
            <input
              id="mfo-govid"
              className={fo.input}
              required={!draft.immediate_triage}
              value={draft.id_number}
              onChange={(e) => updateField('id_number', e.target.value)}
            />
          </p>
          <p className={fo.field}>
            <label className={fo.label} htmlFor="mfo-sector">Health care sector</label>
            <select
              id="mfo-sector"
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
            <label className={fo.label} htmlFor="mfo-phys">Distinguishing marks</label>
            <textarea
              id="mfo-phys"
              rows={3}
              className={fo.textarea}
              value={draft.physical_notes}
              onChange={(e) => updateField('physical_notes', e.target.value)}
            />
          </p>
        </article>
        <footer className={fo.actions}>
          <Link to="/maternity_front_officer/registration/step-1" className={fo.btnOutline}>← Back</Link>
          <button type="submit" className={fo.btnPrimary}>Save and continue →</button>
        </footer>
      </form>
    </div>
  );
}

export default function MaternityRegistrationStep2Page() {
  return (
    <MaternityRegistrationGuard>
      <Step2Form />
    </MaternityRegistrationGuard>
  );
}
