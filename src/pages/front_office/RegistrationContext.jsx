import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerPatient } from '../../api/patients';
import { mapSexToApi, REGISTRATION_ALLOWED_KEY, REGISTRATION_STORAGE_KEY } from './patientUtils';

const defaultDraft = () => ({
  first_name: '',
  last_name: '',
  date_of_birth: '',
  sex: '',
  id_number: '',
  payment_type: 'state',
  physical_notes: '',
  phone: '',
  address: '',
  city: '',
  region: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  is_emergency: false,
  immediate_triage: false,
  routing_destination: '',
});

const RegistrationContext = createContext(null);

export function RegistrationProvider({ children }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => {
    try {
      const raw = sessionStorage.getItem(REGISTRATION_STORAGE_KEY);
      return raw ? { ...defaultDraft(), ...JSON.parse(raw) } : defaultDraft();
    } catch {
      return defaultDraft();
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const persist = useCallback((next) => {
    setDraft(next);
    sessionStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const updateField = useCallback(
    (key, value) => {
      persist({ ...draft, [key]: value });
    },
    [draft, persist]
  );

  const loadPrefill = useCallback(
    (prefill) => {
      const next = {
        ...defaultDraft(),
        ...prefill,
      };
      persist(next);
      sessionStorage.setItem(REGISTRATION_ALLOWED_KEY, '1');
    },
    [persist]
  );

  const clearDraft = useCallback(() => {
    const empty = defaultDraft();
    setDraft(empty);
    sessionStorage.removeItem(REGISTRATION_STORAGE_KEY);
    sessionStorage.removeItem(REGISTRATION_ALLOWED_KEY);
  }, []);

  const buildPayload = useCallback(() => {
    const addressParts = [draft.address, draft.city, draft.region].filter(Boolean);
    const address =
      addressParts.join(', ') +
      (draft.physical_notes ? `\n[Physical notes: ${draft.physical_notes}]` : '');

    return {
      first_name: draft.first_name.trim(),
      last_name: draft.last_name.trim(),
      sex: mapSexToApi(draft.sex),
      date_of_birth: draft.date_of_birth || null,
      id_number: draft.id_number.trim() || null,
      phone: draft.phone.trim() || null,
      address: address.trim() || null,
      payment_type: draft.payment_type === 'private' ? 'private' : 'state',
      emergency_contact_name: draft.emergency_contact_name.trim() || null,
      emergency_contact_phone: draft.emergency_contact_phone.trim() || null,
      category: 'known',
      is_emergency: Boolean(draft.is_emergency),
      immediate_triage: Boolean(draft.immediate_triage),
      routing_destination: draft.routing_destination || undefined,
    };
  }, [draft]);

  const submitRegistration = useCallback(async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = buildPayload();
      if (!payload.first_name || !payload.last_name || !payload.sex) {
        throw new Error('First name, last name, and sex are required.');
      }
      if (!payload.immediate_triage && !payload.routing_destination) {
        throw new Error('Select a routing destination before finishing registration.');
      }
      const data = await registerPatient(payload);
      clearDraft();
      const routeMsg = payload.immediate_triage
        ? 'routed to Emergency Unit'
        : `routed to queue`;
      navigate('/front_office', {
        replace: true,
        state: {
          notice: `Patient ${payload.first_name} ${payload.last_name} registered (${data.patient?.patient_number || ''}) and ${routeMsg}.`,
        },
      });
      return data;
    } catch (err) {
      setSubmitError(err.message || 'Registration failed');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [buildPayload, clearDraft, navigate]);

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

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export function useRegistration() {
  const ctx = useContext(RegistrationContext);
  if (!ctx) throw new Error('useRegistration must be used within RegistrationProvider');
  return ctx;
}
