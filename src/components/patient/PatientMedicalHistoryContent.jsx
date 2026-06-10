import { useEffect, useMemo, useState } from 'react';
import { getPatient, getPatientHistory } from '../../api/patients';
import EhrDemographicsPanel from '../../pages/front_office/components/ehr/EhrDemographicsPanel';
import EhrLoadingSkeleton from '../../pages/front_office/components/ehr/EhrLoadingSkeleton';
import EhrPatientHeader from '../../pages/front_office/components/ehr/EhrPatientHeader';
import EhrStatsCards from '../../pages/front_office/components/ehr/EhrStatsCards';
import EhrVisitTimeline from '../../pages/front_office/components/ehr/EhrVisitTimeline';
import { ehr } from '../../pages/front_office/styles/ehrClasses';
import { computeEhrStats } from '../../pages/front_office/utils/ehrUtils';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'visits', label: 'Visits' },
  { id: 'profile', label: 'Profile' },
];

export default function PatientMedicalHistoryContent({ patientId, compact = false }) {
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!patientId) {
      setPatient(null);
      setVisits([]);
      setLoading(false);
      setError('');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setActiveTab('overview');

    (async () => {
      try {
        const [p, history] = await Promise.all([getPatient(patientId), getPatientHistory(patientId)]);
        if (cancelled) return;
        setPatient(p);
        setVisits(Array.isArray(history) ? history : []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load medical history');
          setPatient(null);
          setVisits([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const stats = useMemo(() => computeEhrStats(visits), [visits]);
  const recentVisits = useMemo(() => visits.slice(0, 3), [visits]);

  if (!patientId) {
    return <p className={ehr.empty}>No patient selected.</p>;
  }

  if (loading) {
    return <EhrLoadingSkeleton />;
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
        {error}
      </p>
    );
  }

  if (!patient) {
    return <p className={ehr.empty}>Patient record could not be loaded.</p>;
  }

  const pageClass = compact ? 'space-y-5' : ehr.page;

  return (
    <div className={pageClass}>
      <EhrPatientHeader patient={patient} />
      <EhrStatsCards stats={stats} />

      <nav className={ehr.tabBar} aria-label="Medical history sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? ehr.tabActive : ehr.tabInactive}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' ? (
        <div className={ehr.layout}>
          <EhrDemographicsPanel patient={patient} sticky={!compact} />
          <EhrVisitTimeline visits={recentVisits} title="Recent visits" />
        </div>
      ) : null}

      {activeTab === 'visits' ? <EhrVisitTimeline visits={visits} /> : null}

      {activeTab === 'profile' ? <EhrDemographicsPanel patient={patient} /> : null}

      {activeTab === 'overview' && visits.length > 3 ? (
        <p className="text-center text-sm text-slate-500">
          Showing 3 most recent visits. Open the{' '}
          <button
            type="button"
            className="font-semibold text-teal-700 hover:underline"
            onClick={() => setActiveTab('visits')}
          >
            Visits
          </button>{' '}
          tab for full history.
        </p>
      ) : null}
    </div>
  );
}
