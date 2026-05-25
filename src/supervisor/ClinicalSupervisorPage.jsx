import { useMemo } from 'react';
import { getStoredUser } from '../api/authSession';
import ClinicalSupervisorDashboard from './components/ClinicalSupervisorDashboard';
import SupervisorTopbar from './components/SupervisorTopbar';
import { useSupervisorMetrics } from './hooks/useSupervisorMetrics';
import { sup } from './supervisorClasses';

const KOPANO = 'https://kopanovertex.com/';

export default function ClinicalSupervisorPage({
  fetchMetrics,
  socketEvent,
  moduleLabel,
  footerLabel,
  dashboardConfig,
}) {
  const user = getStoredUser();
  const supervisorLabel =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || footerLabel;
  const initials =
    supervisorLabel
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'SV';

  const { metrics, loading, error, live } = useSupervisorMetrics(fetchMetrics, socketEvent);

  const dashboardProps = useMemo(() => {
    if (!metrics) return null;
    return dashboardConfig(metrics);
  }, [metrics, dashboardConfig]);

  return (
    <div className={sup.page}>
      <SupervisorTopbar
        supervisorLabel={supervisorLabel}
        initials={initials}
        moduleLabel={moduleLabel}
      />

      {error ? (
        <p className={sup.alert} role="alert">
          {error}
        </p>
      ) : null}

      <div className={sup.body}>
        <main className={`${sup.main} !max-w-none`}>
          <div className={sup.mainInner}>
            {loading ? (
              <p className={sup.hint}>Loading dashboard…</p>
            ) : dashboardProps ? (
              <ClinicalSupervisorDashboard live={live} {...dashboardProps} />
            ) : (
              <p className={sup.hint}>No metrics available.</p>
            )}
          </div>
        </main>
      </div>

      <footer className={sup.footer}>
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className={sup.footerLink}>
          Kopano-Vertex
        </a>{' '}
        | {footerLabel}
      </footer>
    </div>
  );
}
