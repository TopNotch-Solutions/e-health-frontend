import { useEffect, useMemo, useState } from 'react';
import { confirmAction } from '../../utils/confirmAction';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPatientVisit, registerEmergencyPatient } from '../../api/patients';
import { routingLabel } from './constants/routingOptions';
import { useClinicRoutingOptions } from '../../hooks/useClinicRoutingOptions';
import LookupEmergencyBanner from './components/lookup/LookupEmergencyBanner';
import LookupPageHero from './components/lookup/LookupPageHero';
import LookupResultsView from './components/lookup/LookupResultsView';
import LookupSearchCard from './components/lookup/LookupSearchCard';
import TodaysRegistrationsPanel from './components/TodaysRegistrationsPanel';
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
  const { options: routingOptions } = useClinicRoutingOptions();
  const isHospital = Boolean(routingOptions?.is_hospital);

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
    const destLabel = intake.immediate_triage
      ? 'Emergency Unit'
      : routingLabel(intake.routing_destination) || intake.routing_destination;
    if (!(await confirmAction({
      title: 'Check in patient?',
      text: intake.immediate_triage || intake.is_emergency
        ? `Route ${patientName(patient)} to ${destLabel} with emergency priority?`
        : `Check in ${patientName(patient)} and route to ${destLabel}?`,
      icon: 'question',
      confirmButtonText: 'Check in',
    }))) return;
    setCheckInLoading(true);
    setCheckInPatientId(patient.id);
    try {
      const result = await createPatientVisit(patient.id, intake);
      const dept = result.queueEntry?.department || intake.routing_destination;
      const destLabel = intake.immediate_triage
        ? 'Emergency Unit'
        : routingLabel(dept) || dept;
      const msg = intake.immediate_triage || intake.is_emergency
        ? `${patientName(patient)} routed to ${destLabel} (emergency priority).`
        : `${patientName(patient)} routed to ${destLabel}.`;
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
    if (!(await confirmAction({
      title: 'Register emergency patient?',
      text: 'Register an unknown emergency patient and route them to the Emergency Unit?',
      icon: 'warning',
      confirmButtonText: 'Register & route',
    }))) return;
    setEmergencyLoading(true);
    try {
      await registerEmergencyPatient({ sex: 'other' });
      showToast('Unknown emergency patient registered and routed to Emergency Unit.', 'success');
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
          <LookupEmergencyBanner loading={emergencyLoading} onEmergency={handleEmergency} hidden={isHospital} />
          <TodaysRegistrationsPanel compact limit={5} showHeaderLink />
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
          onEmergency={isHospital ? undefined : handleEmergency}
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
