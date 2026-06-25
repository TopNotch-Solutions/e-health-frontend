import FrontOfficeSupervisorDashboard from './components/metrics/FrontOfficeSupervisorDashboard';
import ExternalPickupRequestPanel from './components/ExternalPickupRequestPanel';
import FrontOfficeSupervisorTopbar from './components/FrontOfficeSupervisorTopbar';
import { useFrontOfficeSupervisorMetrics } from './hooks/useFrontOfficeSupervisorMetrics';
import { useFrontOfficeSupervisorSession } from './hooks/useFrontOfficeSupervisorSession';
import { getStoredUser } from '../../api/authSession';
import { fos } from './styles/frontOfficeSupervisorClasses';

const KOPANO = 'https://kopanovertex.com/';

export default function FrontOfficeSupervisorPage() {
  const { supervisorLabel, initials } = useFrontOfficeSupervisorSession();
  const { metrics, loading, error, live } = useFrontOfficeSupervisorMetrics();
  const facilityType = getStoredUser()?.facility_type;
  const isStateHospital = facilityType === 'hospital' || facilityType === 'health_center';

  return (
    <div className={fos.page}>
      <FrontOfficeSupervisorTopbar supervisorLabel={supervisorLabel} initials={initials} />

      {error ? (
        <p className={fos.alert} role="alert">
          {error}
        </p>
      ) : null}

      <div className={fos.body}>
        <main className={`${fos.main} !max-w-none`}>
          <div className={fos.mainInner}>
            {loading ? (
              <p className={fos.hint}>Loading dashboard…</p>
            ) : metrics ? (
              <>
                <FrontOfficeSupervisorDashboard metrics={metrics} live={live} />
                {isStateHospital ? <ExternalPickupRequestPanel /> : null}
              </>
            ) : (
              <p className={fos.hint}>No metrics available.</p>
            )}
          </div>
        </main>
      </div>

      <footer className={fos.footer}>
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className={fos.footerLink}>
          Kopano-Vertex
        </a>{' '}
        | Front office supervisor
      </footer>
    </div>
  );
}
