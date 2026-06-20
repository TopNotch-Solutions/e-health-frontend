import { Link, useNavigate } from 'react-router-dom';
import RegistrationGuard from './RegistrationGuard';
import { useRegistration } from './RegistrationContext';
import RegistrationStepper from './RegistrationStepper';
import EmergencyPatientToggle from './components/EmergencyPatientToggle';
import { fo } from './styles/frontOfficeModuleClasses';

function Step1Form() {
  const navigate = useNavigate();
  const { draft, updateField } = useRegistration();

  function onNext(e) {
    e.preventDefault();
    if (!draft.first_name.trim() || !draft.last_name.trim() || !draft.sex) return;
    navigate('/front_office/registration/step-2');
  }

  return (
    <div className={fo.page}>
      <div className={fo.registrationIntro}>
        <header className={fo.header}>
          <p className={fo.kicker}>New admission</p>
          <h1 className={fo.title}>New patient registration</h1>
          <p className={fo.sub}>Step 1: Personal information</p>
        </header>
        <RegistrationStepper activeStep={1} />
      </div>
      <form onSubmit={onNext} className={fo.form}>
        <article className={fo.sectionPanel}>
          <h3 className={fo.sectionTitle}>Personal details</h3>
          <div className={`${fo.fieldRow} mt-4`}>
            <p className={fo.field}>
              <label className={fo.label} htmlFor="fo-fn">
                First name *
              </label>
              <input
                id="fo-fn"
                className={fo.input}
                required
                value={draft.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
              />
            </p>
            <p className={fo.field}>
              <label className={fo.label} htmlFor="fo-ln">
                Last name *
              </label>
              <input
                id="fo-ln"
                className={fo.input}
                required
                value={draft.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
              />
            </p>
          </div>
          <p className={`${fo.field} mt-4`}>
            <label className={fo.label} htmlFor="fo-dob">
              Date of birth
            </label>
            <input
              id="fo-dob"
              type="date"
              className={fo.input}
              value={draft.date_of_birth}
              onChange={(e) => updateField('date_of_birth', e.target.value)}
            />
          </p>
          <p className={fo.field}>
            <label className={fo.label} htmlFor="fo-sex">
              Sex *
            </label>
            <select
              id="fo-sex"
              className={fo.select}
              required
              value={draft.sex}
              onChange={(e) => updateField('sex', e.target.value)}
            >
              <option value="" disabled>
                Select sex
              </option>
              <option value="f">Female</option>
              <option value="m">Male</option>
              <option value="x">Other</option>
            </select>
          </p>
        </article>
        <article className={`${fo.sectionPanel} mt-4`}>
          <EmergencyPatientToggle
            id="fo-reg-emergency"
            checked={Boolean(draft.is_emergency)}
            onChange={(v) => updateField('is_emergency', v)}
          />
        </article>
        <footer className={fo.actions}>
          <Link to="/front_office" className={fo.btnOutline}>
            Cancel
          </Link>
          <button type="submit" className={fo.btnPrimary}>
            Next step →
          </button>
        </footer>
      </form>
    </div>
  );
}

export default function PatientRegistrationStep1Page() {
  return (
    <RegistrationGuard>
      <Step1Form />
    </RegistrationGuard>
  );
}
