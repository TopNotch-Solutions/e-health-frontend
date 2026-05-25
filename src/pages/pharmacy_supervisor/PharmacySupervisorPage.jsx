import { useCallback, useEffect, useState } from 'react';
import { getSocket } from '../../api/socket';
import InventoryWorkspace from './components/InventoryWorkspace';
import PharmacySupervisorDashboard from './components/metrics/PharmacySupervisorDashboard';
import PharmacySupervisorTopbar from './components/PharmacySupervisorTopbar';
import PharmacySupervisorViewTabs from './components/PharmacySupervisorViewTabs';
import { usePharmacySupervisorMetrics } from './hooks/usePharmacySupervisorMetrics';
import { usePharmacySupervisorSession } from './hooks/usePharmacySupervisorSession';
import { ps } from './styles/pharmacySupervisorClasses';

const KOPANO = 'https://kopanovertex.com/';

export default function PharmacySupervisorPage() {
  const { supervisorLabel, initials } = usePharmacySupervisorSession();
  const [mainTab, setMainTab] = useState('dashboard');
  const [stockAlertToast, setStockAlertToast] = useState('');

  const { metrics, loading, error, live, refresh } = usePharmacySupervisorMetrics();

  const onStockAlert = useCallback((payload) => {
    const name = payload?.medication_name || payload?.alerts?.[0]?.medication_name;
    if (name) {
      setStockAlertToast(`Low stock alert: ${name} needs replenishment.`);
      setMainTab('inventory');
    }
  }, []);

  useEffect(() => {
    if (!stockAlertToast) return undefined;
    const t = setTimeout(() => setStockAlertToast(''), 6000);
    return () => clearTimeout(t);
  }, [stockAlertToast]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    socket.on('notification:stock_alert', onStockAlert);
    return () => {
      socket.off('notification:stock_alert', onStockAlert);
    };
  }, [onStockAlert]);

  return (
    <div className={ps.page}>
      <PharmacySupervisorTopbar supervisorLabel={supervisorLabel} initials={initials} />

      {stockAlertToast ? (
        <div className={ps.toastLow} role="alert">
          {stockAlertToast}
        </div>
      ) : null}

      {error && mainTab === 'dashboard' ? (
        <p className={ps.alert} role="alert">
          {error}
        </p>
      ) : null}

      <div className={ps.body}>
        <main className={`${ps.main} !max-w-none`}>
          <PharmacySupervisorViewTabs activeTab={mainTab} onTabChange={setMainTab} />

          {mainTab === 'dashboard' ? (
            <div className={ps.mainInner}>
              {loading ? (
                <p className={ps.hint}>Loading dashboard…</p>
              ) : metrics ? (
                <PharmacySupervisorDashboard metrics={metrics} live={live} />
              ) : (
                <p className={ps.hint}>No metrics available.</p>
              )}
            </div>
          ) : (
            <div className={`${ps.mainInner} overflow-hidden`}>
              <InventoryWorkspace onStockUpdated={refresh} />
            </div>
          )}
        </main>
      </div>

      <footer className={ps.footer}>
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className={ps.footerLink}>
          Kopano-Vertex
        </a>{' '}
        | Pharmacy supervisor
      </footer>
    </div>
  );
}
