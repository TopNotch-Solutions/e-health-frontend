import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmAction } from '../../utils/confirmAction';
import { routeFromMaternityFrontOffice } from '../../api/maternity';
import LookupSearchCard from '../front_office/components/lookup/LookupSearchCard';
import TodaysRegistrationsPanel from '../front_office/components/TodaysRegistrationsPanel';
import { useToast } from '../front_office/context/ToastContext';
import { useFlashNotice } from '../front_office/hooks/useFlashNotice';
import { usePatientSearch } from '../front_office/hooks/usePatientSearch';
import { patientName } from '../front_office/patientUtils';
import { lookup } from '../front_office/styles/lookupClasses';
import { maternityRoutingLabel } from './constants/maternityRoutingOptions';
import MaternityLookupResultsView from './components/MaternityLookupResultsView';
import MaternityPageHero from './components/MaternityPageHero';
import { useMaternityRegistration } from './MaternityRegistrationContext';
import {
  isMaternityEligibleSex,
  MATERNITY_INELIGIBLE_SEX_MESSAGE,
} from './maternityPatientUtils';
import { MATERNITY_REGISTRATION_ALLOWED_KEY } from './registrationUtils';

export default function MaternityFrontOfficeDashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  useFlashNotice(showToast);
  const { loadPrefill } = useMaternityRegistration();

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
    onNavigateLogin: () => navigate('/login', { replace: true, state: { from: '/maternity_front_officer' } }),
  });

  const [routeLoading, setRouteLoading] = useState(false);
  const [routePatientId, setRoutePatientId] = useState(null);

  const completeMatches = useMemo(() => results.filter((p) => p.profile_complete), [results]);
  const partialMatches = useMemo(() => results.filter((p) => !p.profile_complete), [results]);

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
    navigate('/maternity_front_officer/registration/step-1');
  }

  function startCompleteRegistration(patient) {
    if (!isMaternityEligibleSex(patient.sex)) {
      showToast(MATERNITY_INELIGIBLE_SEX_MESSAGE, 'error');
      return;
    }
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
    sessionStorage.setItem(MATERNITY_REGISTRATION_ALLOWED_KEY, '1');
    navigate('/maternity_front_officer/registration/step-1');
  }

  async function handleRoute(patient, intake) {
    if (!isMaternityEligibleSex(patient.sex)) {
      showToast(MATERNITY_INELIGIBLE_SEX_MESSAGE, 'error');
      return;
    }
    const destLabel = intake.immediate_triage
      ? 'Maternity ICU'
      : maternityRoutingLabel(intake.routing_destination) || intake.routing_destination;
    if (!(await confirmAction({
      title: 'Check in patient?',
      text: intake.immediate_triage || intake.is_emergency
        ? `Route ${patientName(patient)} to ${destLabel} with emergency priority?`
        : `Check in ${patientName(patient)} and route to ${destLabel}?`,
      icon: 'question',
      confirmButtonText: 'Check in',
    }))) return;

    setRouteLoading(true);
    setRoutePatientId(patient.id);
    try {
      await routeFromMaternityFrontOffice({
        patient_id: patient.id,
        ...intake,
      });
      const msg = intake.immediate_triage || intake.is_emergency
        ? `${patientName(patient)} routed to ${destLabel} (emergency priority).`
        : `${patientName(patient)} routed to ${destLabel}.`;
      showToast(msg, 'success');
      resetSearch();
    } catch (err) {
      showToast(err.message || 'Routing failed', 'error');
    } finally {
      setRouteLoading(false);
      setRoutePatientId(null);
    }
  }

  const showResults = phase === 'results' || phase === 'returning';

  return (
    <div className={lookup.page}>
      <MaternityPageHero phase={phase} />

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
          <TodaysRegistrationsPanel
            compact
            limit={5}
            showHeaderLink
            todayPath="/maternity_front_officer/today"
          />
        </>
      ) : null}

      {showResults ? (
        <MaternityLookupResultsView
          results={results}
          phase={phase}
          completeMatches={completeMatches}
          partialMatches={partialMatches}
          onResetSearch={resetSearch}
          onRegisterNew={startNewRegistration}
          onCompleteRegistration={startCompleteRegistration}
          onRoute={handleRoute}
          routeLoading={routeLoading}
          routePatientId={routePatientId}
        />
      ) : null}
    </div>
  );
}
