import MetricKpiRow from './MetricKpiRow';
import RegistrationVelocityChart from './RegistrationVelocityChart';
import WardOccupancyDonut from './WardOccupancyDonut';
import AdmissionDischargeBarChart from './AdmissionDischargeBarChart';
import TriagePriorityChart from './TriagePriorityChart';
import { ws } from '../../styles/wardSupervisorClasses';

function LiveBadge({ live }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide ${
        live ? 'bg-emerald-500/20 text-emerald-100' : 'bg-white/10 text-teal-100'
      }`}
      title={live ? 'Connected — metrics refresh on ward events' : 'Polling metrics — sign in for socket updates'}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${live ? 'animate-pulse bg-emerald-300' : 'bg-teal-200'}`}
        aria-hidden
      />
      {live ? 'Live' : 'Updating'}
    </span>
  );
}

export default function WardSupervisorDashboard({ metrics, live, facilityStats, onCreateWard }) {
  if (!metrics) return null;

  return (
    <>
      <div className={`${ws.hero} ${ws.wardInfoHeader}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className={ws.heroTitle}>Ward supervisor dashboard</h1>
            <p className={ws.heroSub}>
              Real-time facility metrics — registrations, admissions, capacity, and triage.
              Select a ward from the list to manage beds.
            </p>
          </div>
          <LiveBadge live={live} />
        </div>
        <MetricKpiRow kpis={metrics.kpis} />
      </div>

      <div className={`${ws.workspaceScroll} pr-1`}>
        <div className={ws.chartGrid}>
          <RegistrationVelocityChart data={metrics.registrationVelocity} />
          <WardOccupancyDonut data={metrics.occupancyByArea} />
          <AdmissionDischargeBarChart data={metrics.hourlyAdmissionsVsDischarges} />
          <TriagePriorityChart data={metrics.triageDistribution} />
        </div>

        <div className={`${ws.sectionPanel} mt-3 flex flex-wrap items-center justify-between gap-3`}>
          <div>
            <p className={ws.sectionTitle}>Ward management</p>
            <p className="mt-0.5 text-xs text-slate-600">
              {facilityStats.wards} ward{facilityStats.wards === 1 ? '' : 's'} ·{' '}
              {facilityStats.available} beds available · {facilityStats.occupied} occupied
            </p>
          </div>
          <button type="button" className={ws.btnPrimary} onClick={onCreateWard}>
            + Create ward
          </button>
        </div>
      </div>
    </>
  );
}
