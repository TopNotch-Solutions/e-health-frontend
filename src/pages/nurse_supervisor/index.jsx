import {
  getNurseSupervisorMetrics,
} from '../../api/clinicalSupervisor';
import ClinicalSupervisorPage from '../../supervisor/ClinicalSupervisorPage';

function nurseDashboardConfig(metrics) {
  const k = metrics.kpis;
  return {
    title: 'Nurse supervisor dashboard',
    subtitle:
      'Daily nursing activity — vitals recorded, first patient of the day per nurse, and queue load.',
    kpiCards: [
      { value: k.vitalsToday, label: 'Vitals today', sub: 'Patients triaged' },
      { value: k.emergencyVitalsToday, label: 'Emergency triage', sub: 'Emergency patients' },
      { value: k.nurseQueueWaiting, label: 'Nurse queue', sub: 'Waiting for vitals' },
      { value: k.staffActiveToday, label: 'Nurses active', sub: `Of ${k.nurseStaffCount} staff` },
      { value: k.vitalsYesterday, label: 'Yesterday', sub: 'Vitals recorded' },
    ],
    velocityTitle: 'Triage velocity',
    velocitySubtitle: 'Vitals recorded by hour today',
    velocityData: metrics.registrationVelocity,
    donutTitle: '',
    donutSubtitle: '',
    donutData: [],
    employeeTitle: 'Nursing staff — today',
    employeeSubtitle: 'First activity is the first vitals record of the day.',
    employeeColumns: [
      { key: 'name', label: 'Nurse' },
      { key: 'firstActivityTime', label: 'First patient' },
      { key: 'vitalsRecorded', label: 'Vitals' },
      { key: 'emergencyPatients', label: 'Emergency' },
      { key: 'totalProcessed', label: 'Total', bold: true },
    ],
    employees: metrics.employeesToday,
    recentTitle: 'Recent triage',
    recentSubtitle: 'Latest vitals recorded today',
    recentActivity: metrics.recentActivity,
  };
}

export default function NurseSupervisorPage() {
  return (
    <ClinicalSupervisorPage
      fetchMetrics={getNurseSupervisorMetrics}
      socketEvent="nurse:activity"
      moduleLabel="Nurse supervisor · Staff analytics"
      footerLabel="Nurse supervisor"
      dashboardConfig={nurseDashboardConfig}
    />
  );
}
