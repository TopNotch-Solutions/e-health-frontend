import AdminDashboardCharts from '../components/AdminDashboardCharts';
import { admin as c, facilityTypeLabel, isOperationalFacility } from '../styles/adminClasses';

const ALL_FACILITIES_METRICS = [
  { key: 'totalFacilities', label: 'Facilities', hint: 'Hospitals, clinics & health centers' },
  { key: 'activeEmployees', label: 'Active staff', hint: 'Across all operational facilities' },
  { key: 'todayVisits', label: 'Visits today', hint: 'Network-wide patient visits' },
  { key: 'pendingRequests', label: 'Pending requests', hint: 'Shift reviews & open social cases' },
];

const FACILITY_METRICS = [
  { key: 'activeEmployees', label: 'Active staff', hint: 'At this facility' },
  { key: 'todayVisits', label: 'Visits today', hint: 'Registered at this facility' },
  { key: 'totalPatients', label: 'Patients served', hint: 'Distinct patients with visits here' },
  { key: 'pendingRequests', label: 'Pending requests', hint: 'Shift reviews & open social cases' },
];

export default function AdminDashboardView({
  dashboard,
  loading,
  facilities,
  facilityFilter,
  onFacilityFilterChange,
  onNavigate,
  onSelectFacility,
}) {
  const operationalFacilities = (facilities || []).filter(isOperationalFacility);

  if (loading) {
    return <p className={c.hint}>Loading dashboard…</p>;
  }

  if (!dashboard) {
    return <p className={c.hint}>No dashboard data available.</p>;
  }

  const isFacilityScope = Boolean(dashboard.selectedFacility);
  const metrics = isFacilityScope ? FACILITY_METRICS : ALL_FACILITIES_METRICS;
  const summaries = dashboard.facilitySummaries || [];

  return (
    <div className="flex flex-col gap-3">
      <div className={c.hero}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className={c.heroTitle}>System administrator dashboard</h1>
            <p className={c.heroSub}>
              {isFacilityScope
                ? `${dashboard.selectedFacility.name} · ${dashboard.selectedFacility.type_label}${dashboard.selectedFacility.location ? ` · ${dashboard.selectedFacility.location}` : ''}`
                : 'Facility-based overview — compare and drill into every state hospital and clinic.'}
            </p>
          </div>
          <div className="min-w-[220px]">
            <label className="block text-[0.65rem] font-bold uppercase tracking-wide text-teal-100" htmlFor="dash-facility">
              View by facility
            </label>
            <select
              id="dash-facility"
              className="mt-1 w-full rounded-lg border border-white/30 bg-white/95 px-3 py-2 text-sm text-slate-800 shadow-sm"
              value={facilityFilter}
              onChange={(e) => onFacilityFilterChange(e.target.value)}
            >
              <option value="">All facilities</option>
              {operationalFacilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({facilityTypeLabel(f.type)})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={c.kpiGrid}>
          {metrics.map((m) => (
            <div key={m.key} className={c.kpiCard}>
              <p className={c.kpiValue}>{dashboard[m.key] ?? 0}</p>
              <p className={c.kpiLabel}>{m.label}</p>
              <p className={c.kpiHint}>{m.hint}</p>
            </div>
          ))}
        </div>
      </div>

      {!isFacilityScope && summaries.length > 0 ? (
        <div className={c.sectionPanel}>
          <h3 className={c.cardTitle}>Facilities at a glance</h3>
          <p className={c.cardDesc}>
            Click a row to open that facility&apos;s dashboard. Metrics reflect the last 14 days where noted.
          </p>
          <div className={`${c.tableWrap} mt-3 border-0 bg-white/10 shadow-none`}>
            <table className={c.table}>
              <thead>
                <tr>
                  <th className={c.th}>Facility</th>
                  <th className={c.th}>Type</th>
                  <th className={c.th}>Active staff</th>
                  <th className={c.th}>Visits today</th>
                  <th className={c.th}>Visits (14d)</th>
                  <th className={c.th}>Queue waiting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {summaries.map((row) => (
                  <tr key={row.id}>
                    <td className={`${c.td} font-medium`}>
                      <button
                        type="button"
                        className={c.cardLink}
                        onClick={() => onSelectFacility(row.id)}
                      >
                        {row.name}
                      </button>
                    </td>
                    <td className={c.td}>{row.type_label || facilityTypeLabel(row.type)}</td>
                    <td className={c.td}>{row.active_staff}</td>
                    <td className={c.td}>{row.today_visits}</td>
                    <td className={c.td}>{row.visits_14d}</td>
                    <td className={c.td}>{row.queue_waiting}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <AdminDashboardCharts
        analytics={dashboard.analytics}
        facilityScope={isFacilityScope}
        selectedFacilityName={dashboard.selectedFacility?.name}
      />

      <div className={c.sectionPanel}>
        <h3 className={c.cardTitle}>Quick actions</h3>
        <p className={c.cardDesc}>Manage facilities and staff across the network.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={c.btnPrimary} onClick={() => onNavigate('facilities')}>
            Manage facilities
          </button>
          <button type="button" className={c.btnSecondary} onClick={() => onNavigate('employees')}>
            Manage employees
          </button>
          <button type="button" className={c.btnSecondary} onClick={() => onNavigate('admins')}>
            System administrators
          </button>
          <button type="button" className={c.btnSecondary} onClick={() => onNavigate('settings')}>
            Audit logs & settings
          </button>
        </div>
        {dashboard.inactiveEmployees > 0 ? (
          <p className="mt-4 text-xs text-emerald-100">
            <span className="font-semibold text-white">{dashboard.inactiveEmployees}</span> inactive
            employee{dashboard.inactiveEmployees === 1 ? '' : 's'} remain visible in the directory and
            audit trail.
          </p>
        ) : null}
      </div>
    </div>
  );
}
