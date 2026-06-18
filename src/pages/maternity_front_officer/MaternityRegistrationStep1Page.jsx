import { Link, useNavigate } from 'react-router-dom';
import EmergencyPatientToggle from '../front_office/components/EmergencyPatientToggle';
import RegistrationStepper from '../front_office/RegistrationStepper';
import { useToast } from '../front_office/context/ToastContext';
import { fo } from '../front_office/styles/frontOfficeModuleClasses';
import {
  formatMaternityAgeLabel,
  MATERNITY_INELIGIBLE_SEX_MESSAGE,
} from './maternityPatientUtils';
import MaternityRegistrationGuard from './MaternityRegistrationGuard';
import { useMaternityRegistration } from './MaternityRegistrationContext';

function Step1Form() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { draft, updateField } = useMaternityRegistration();
  const ageLabel = formatMaternityAgeLabel(draft.date_of_birth);

  function onNext(e) {
    e.preventDefault();
    if (!draft.first_name.trim() || !draft.last_name.trim() || draft.sex !== 'f') {
      if (draft.sex !== 'f') {
        showToast(MATERNITY_INELIGIBLE_SEX_MESSAGE, 'error');
      }
      return;
    }
    if (!draft.date_of_birth) {
      showToast('Date of birth is required.', 'error');
      return;
    }
    navigate('/maternity_front_officer/registration/step-2');
  }

  return (
    <div className={fo.page}>
      <header className={fo.header}>
        <p className={fo.kicker}>New admission</p>
        <h1 className={fo.title}>New patient registration</h1>
        <p className={fo.sub}>Step 1: Personal information</p>
      </header>
      <RegistrationStepper activeStep={1} />
      <form onSubmit={onNext} className={fo.form}>
        <article className={fo.sectionPanel}>
          <h3 className={fo.sectionTitle}>Personal details</h3>
          <div className={`${fo.fieldRow} mt-4`}>
            <p className={fo.field}>
              <label className={fo.label} htmlFor="mfo-fn">First name *</label>
              <input
                id="mfo-fn"
                className={fo.input}
                required
                value={draft.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
              />
            </p>
            <p className={fo.field}>
              <label className={fo.label} htmlFor="mfo-ln">Last name *</label>
              <input
                id="mfo-ln"
                className={fo.input}
                required
                value={draft.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
              />
            </p>
          </div>
          <p className={`${fo.field} mt-4`}>
            <label className={fo.label} htmlFor="mfo-dob">Date of birth *</label>
            <input
              id="mfo-dob"
              type="date"
              className={fo.input}
              required
              value={draft.date_of_birth}
              onChange={(e) => updateField('date_of_birth', e.target.value)}
            />
            {ageLabel ? (
              <span className="mt-1 block text-sm font-medium text-teal-800">Age: {ageLabel}</span>
            ) : null}
          </p>
          <p className={fo.field}>
            <label className={fo.label} htmlFor="mfo-sex">Sex *</label>
            <select
              id="mfo-sex"
              className={fo.select}
              required
              value={draft.sex}
              onChange={(e) => updateField('sex', e.target.value)}
            >
              <option value="f">Female</option>
            </select>
            <span className="mt-1 block text-xs text-slate-500">
              Maternity front office registration is for female patients only.
            </span>
          </p>
        </article>
        <article className={`${fo.sectionPanel} mt-4`}>
          <EmergencyPatientToggle
            id="mfo-reg-emergency"
            checked={Boolean(draft.is_emergency)}
            onChange={(v) => updateField('is_emergency', v)}
          />
        </article>
        <footer className={fo.actions}>
          <Link to="/maternity_front_officer" className={fo.btnOutline}>Cancel</Link>
          <button type="submit" className={fo.btnPrimary}>Next step →</button>
        </footer>
      </form>
    </div>
  );
}

export default function MaternityRegistrationStep1Page() {
  return (
    <MaternityRegistrationGuard>
      <Step1Form />
    </MaternityRegistrationGuard>
  );
}
