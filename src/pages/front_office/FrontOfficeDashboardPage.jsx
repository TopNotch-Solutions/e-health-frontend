import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPatientVisit, registerEmergencyPatient } from '../../api/patients';
import LookupEmergencyBanner from './components/lookup/LookupEmergencyBanner';
import LookupPageHero from './components/lookup/LookupPageHero';
import LookupResultsView from './components/lookup/LookupResultsView';
import LookupSearchCard from './components/lookup/LookupSearchCard';
import { useToast } from './context/ToastContext';
import { usePatientSearch } from './hooks/usePatientSearch';
import { useRegistration } from './RegistrationContext';
import { lookup } from './styles/lookupClasses';
import { patientName, REGISTRATION_ALLOWED_KEY } from './patientUtils';

export default function FrontOfficeDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { loadPrefill } = useRegistration();

  const {
    searchMode,
    setSearchMode,
    phase,
    nationalId,
    setNationalId,
    dob,
    setDob,
    name,
    setName,
    results,
    loading,
    resetSearch,
    runSearch,
  } = usePatientSearch({
    onNavigateLogin: () => navigate('/login', { replace: true, state: { from: '/front_office' } }),
  });

  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInPatientId, setCheckInPatientId] = useState(null);
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  const completeMatches = useMemo(() => results.filter((p) => p.profile_complete), [results]);
  const partialMatches = useMemo(() => results.filter((p) => !p.profile_complete), [results]);

  useEffect(() => {
    if (location.state?.notice) {
      showToast(location.state.notice, 'success');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.notice, location.pathname, navigate, showToast]);

  function startNewRegistration() {
    const prefill = {};
    if (searchMode === 'id' && nationalId.trim()) {
      prefill.id_number = nationalId.trim();
    } else {
      prefill.date_of_birth = dob;
      const parts = name.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        prefill.first_name = parts[0];
        prefill.last_name = parts.slice(1).join(' ');
      } else if (parts.length === 1) {
        prefill.first_name = parts[0];
      }
    }
    loadPrefill(prefill);
    navigate('/front_office/registration/step-1');
  }

  function startCompleteRegistration(patient) {
    loadPrefill({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      date_of_birth: patient.date_of_birth || '',
      sex: patient.sex === 'female' ? 'f' : patient.sex === 'male' ? 'm' : 'x',
      id_number: patient.id_number || '',
      phone: patient.phone || '',
      address: patient.address || '',
      payment_type: patient.payment_type === 'private' ? 'private' : 'state',
    });
    sessionStorage.setItem(REGISTRATION_ALLOWED_KEY, '1');
    navigate('/front_office/registration/step-1');
  }

  async function handleCheckIn(patient, intake) {
    setCheckInLoading(true);
    setCheckInPatientId(patient.id);
    try {
      await createPatientVisit(patient.id, intake);
      const msg = intake.is_emergency
        ? `${patientName(patient)} checked in as emergency and prioritized in the nurse queue.`
        : `${patientName(patient)} checked in and sent to the nurse queue.`;
      showToast(msg, 'success');
      resetSearch();
    } catch (err) {
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setCheckInLoading(false);
      setCheckInPatientId(null);
    }
  }

  async function handleEmergency() {
    setEmergencyLoading(true);
    try {
      await registerEmergencyPatient({ sex: 'other' });
      showToast('Emergency patient registered and prioritized at the top of the nurse queue.', 'success');
      resetSearch();
    } catch (err) {
      showToast(err.message || 'Emergency registration failed', 'error');
    } finally {
      setEmergencyLoading(false);
    }
  }

  const showResults = phase === 'results' || phase === 'returning';

  return (
    <div className={lookup.page}>
      <LookupPageHero phase={phase} />

      {phase === 'find' ? (
        <>
          <LookupSearchCard
            searchMode={searchMode}
            onSearchModeChange={setSearchMode}
            nationalId={nationalId}
            onNationalIdChange={setNationalId}
            dob={dob}
            onDobChange={setDob}
            name={name}
            onNameChange={setName}
            onSubmit={runSearch}
            loading={loading}
          />
          <LookupEmergencyBanner loading={emergencyLoading} onEmergency={handleEmergency} />
        </>
      ) : null}

      {showResults ? (
        <LookupResultsView
          results={results}
          phase={phase}
          completeMatches={completeMatches}
          partialMatches={partialMatches}
          onResetSearch={resetSearch}
          onRegisterNew={startNewRegistration}
          onEmergency={handleEmergency}
          onCompleteRegistration={startCompleteRegistration}
          onCheckIn={handleCheckIn}
          emergencyLoading={emergencyLoading}
          checkInLoading={checkInLoading}
          checkInPatientId={checkInPatientId}
        />
      ) : null}
    </div>
  );
}
