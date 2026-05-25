import AdminDashboardCharts from '../components/AdminDashboardCharts';
import { admin as c } from '../styles/adminClasses';

const METRICS = [
  { key: 'totalFacilities', label: 'Total facilities', hint: 'Registered on the network' },
  { key: 'activeEmployees', label: 'Active employees', hint: 'Currently enabled accounts' },
  { key: 'pendingRequests', label: 'Pending requests', hint: 'Shift reviews & open social cases' },
];

export default function AdminDashboardView({ dashboard, loading, onNavigate }) {
  if (loading) {
    return <p className={c.hint}>Loading dashboard…</p>;
  }

  if (!dashboard) {
    return <p className={c.hint}>No dashboard data available.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className={c.hero}>
        <h1 className={c.heroTitle}>System administrator dashboard</h1>
        <p className={c.heroSub}>
          National overview — facilities, staff, and pending operational requests.
        </p>
        <div className={c.kpiGrid}>
          {METRICS.map((m) => (
            <div key={m.key} className={c.kpiCard}>
              <p className={c.kpiValue}>{dashboard[m.key] ?? 0}</p>
              <p className={c.kpiLabel}>{m.label}</p>
              <p className={c.kpiHint}>{m.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <AdminDashboardCharts analytics={dashboard.analytics} />

      <div className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Quick actions</h3>
        <p className={c.sectionDesc}>Jump to common administration tasks.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={c.btnPrimary} onClick={() => onNavigate('facilities')}>
            Manage facilities
          </button>
          <button type="button" className={c.btnSecondary} onClick={() => onNavigate('employees')}>
            Manage employees
          </button>
          <button type="button" className={c.btnSecondary} onClick={() => onNavigate('settings')}>
            Audit logs & settings
          </button>
        </div>
        {dashboard.inactiveEmployees > 0 ? (
          <p className="mt-4 text-xs text-slate-500">
            <span className="font-semibold text-teal-700">{dashboard.inactiveEmployees}</span> inactive
            employee{dashboard.inactiveEmployees === 1 ? '' : 's'} remain visible in the directory and
            audit trail.
          </p>
        ) : null}
      </div>
    </div>
  );
}
