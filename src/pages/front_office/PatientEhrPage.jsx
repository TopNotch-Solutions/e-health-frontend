import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPatient, getPatientHistory } from '../../api/patients';
import EhrDemographicsPanel from './components/ehr/EhrDemographicsPanel';
import EhrLoadingSkeleton from './components/ehr/EhrLoadingSkeleton';
import EhrPatientHeader from './components/ehr/EhrPatientHeader';
import EhrStatsCards from './components/ehr/EhrStatsCards';
import EhrVisitTimeline from './components/ehr/EhrVisitTimeline';
import { useToast } from './context/ToastContext';
import { ehr } from './styles/ehrClasses';
import { computeEhrStats } from './utils/ehrUtils';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'visits', label: 'Visits' },
  { id: 'profile', label: 'Profile' },
];

export default function PatientEhrPage() {
  const { patientId } = useParams();
  const { showToast } = useToast();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [p, history] = await Promise.all([getPatient(patientId), getPatientHistory(patientId)]);
        if (!cancelled) {
          setPatient(p);
          setVisits(Array.isArray(history) ? history : []);
        }
      } catch (err) {
        if (!cancelled) {
          showToast(err.message || 'Failed to load electronic health record', 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId, showToast]);

  const stats = useMemo(() => computeEhrStats(visits), [visits]);
  const recentVisits = useMemo(() => visits.slice(0, 3), [visits]);

  if (loading) {
    return <EhrLoadingSkeleton />;
  }

  if (!patient) {
    return (
      <div className={ehr.page}>
        <p className={ehr.empty}>Patient record could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className={ehr.page}>
      <EhrPatientHeader patient={patient} />
      <EhrStatsCards stats={stats} />

      <nav className={ehr.tabBar} aria-label="EHR sections">
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
          <EhrDemographicsPanel patient={patient} sticky />
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
