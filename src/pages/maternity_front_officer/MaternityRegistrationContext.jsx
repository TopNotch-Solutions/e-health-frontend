import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerMaternityPatient } from '../../api/maternity';
import { useToast } from '../front_office/context/ToastContext';
import { mapSexToApi } from '../front_office/patientUtils';
import { validateNationalId, validatePhone } from '../front_office/utils/validation';
import {
  isMaternityEligibleSex,
  MATERNITY_INELIGIBLE_SEX_MESSAGE,
} from './maternityPatientUtils';
import {
  MATERNITY_REGISTRATION_ALLOWED_KEY,
  MATERNITY_REGISTRATION_STORAGE_KEY,
} from './registrationUtils';

const defaultDraft = () => ({
  first_name: '',
  last_name: '',
  date_of_birth: '',
  sex: 'f',
  id_number: '',
  payment_type: 'state',
  physical_notes: '',
  phone: '',
  address: '',
  city: '',
  region: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  is_emergency: false,
  immediate_triage: false,
  routing_destination: '',
});

const MaternityRegistrationContext = createContext(null);

export function MaternityRegistrationProvider({ children }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [draft, setDraft] = useState(() => {
    try {
      const raw = sessionStorage.getItem(MATERNITY_REGISTRATION_STORAGE_KEY);
      return raw ? { ...defaultDraft(), ...JSON.parse(raw) } : defaultDraft();
    } catch {
      return defaultDraft();
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const persist = useCallback((next) => {
    setDraft(next);
    sessionStorage.setItem(MATERNITY_REGISTRATION_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const updateField = useCallback(
    (key, value) => {
      persist({ ...draft, [key]: value });
    },
    [draft, persist]
  );

  const loadPrefill = useCallback(
    (prefill) => {
      const next = { ...defaultDraft(), ...prefill };
      persist(next);
      sessionStorage.setItem(MATERNITY_REGISTRATION_ALLOWED_KEY, '1');
    },
    [persist]
  );

  const clearDraft = useCallback(() => {
    const empty = defaultDraft();
    setDraft(empty);
    sessionStorage.removeItem(MATERNITY_REGISTRATION_STORAGE_KEY);
    sessionStorage.removeItem(MATERNITY_REGISTRATION_ALLOWED_KEY);
  }, []);

  const buildPayload = useCallback(() => ({
    first_name: draft.first_name.trim(),
    last_name: draft.last_name.trim(),
    sex: mapSexToApi(draft.sex),
    date_of_birth: draft.date_of_birth || null,
    id_number: draft.id_number.trim() || null,
    phone: draft.phone.trim() || null,
    address: draft.address.trim() || null,
    city: draft.city.trim() || null,
    region: draft.region.trim() || null,
    physical_notes: draft.physical_notes.trim() || null,
    payment_type: draft.payment_type === 'private' ? 'private' : 'state',
    emergency_contact_name: draft.emergency_contact_name.trim() || null,
    emergency_contact_phone: draft.emergency_contact_phone.trim() || null,
    is_emergency: Boolean(draft.is_emergency),
    immediate_triage: Boolean(draft.immediate_triage),
    routing_destination: draft.routing_destination || undefined,
  }), [draft]);

  const submitRegistration = useCallback(async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = buildPayload();
      if (!payload.first_name || !payload.last_name || !payload.sex) {
        throw new Error('First name, last name, and sex are required.');
      }
      if (!payload.date_of_birth) {
        throw new Error('Date of birth is required.');
      }
      if (!isMaternityEligibleSex(payload.sex)) {
        throw new Error(MATERNITY_INELIGIBLE_SEX_MESSAGE);
      }
      if (!payload.immediate_triage && !payload.routing_destination) {
        throw new Error('Select a routing destination before finishing registration.');
      }
      if (!payload.immediate_triage) {
        const idError = validateNationalId(payload.id_number || '');
        if (idError) throw new Error(idError);
        const phoneError = validatePhone(payload.phone || '');
        if (phoneError) throw new Error(phoneError);
      }
      const data = await registerMaternityPatient(payload);
      clearDraft();
      const routeMsg = payload.immediate_triage
        ? 'routed to Maternity ICU'
        : 'routed to queue';
      navigate('/maternity_front_officer', {
        replace: true,
        state: {
          notice: `Patient ${payload.first_name} ${payload.last_name} registered (${data.patient?.patient_number || ''}) and ${routeMsg}.`,
        },
      });
      return data;
    } catch (err) {
      const message = err.message || 'Registration failed';
      setSubmitError(message);
      showToast(message, 'error');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [buildPayload, clearDraft, navigate, showToast]);

  const value = useMemo(
    () => ({
      draft,
      updateField,
      loadPrefill,
      clearDraft,
      submitRegistration,
      submitting,
      submitError,
    }),
    [draft, updateField, loadPrefill, clearDraft, submitRegistration, submitting, submitError]
  );

  return (
    <MaternityRegistrationContext.Provider value={value}>
      {children}
    </MaternityRegistrationContext.Provider>
  );
}

export function useMaternityRegistration() {
  const ctx = useContext(MaternityRegistrationContext);
  if (!ctx) {
    throw new Error('useMaternityRegistration must be used within MaternityRegistrationProvider');
  }
  return ctx;
}
