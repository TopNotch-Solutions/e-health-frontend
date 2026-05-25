import { getLaboratorySupervisorMetrics } from '../../api/clinicalSupervisor';
import ClinicalSupervisorPage from '../../supervisor/ClinicalSupervisorPage';

function labDashboardConfig(metrics) {
  const k = metrics.kpis;
  return {
    title: 'Laboratory supervisor dashboard',
    subtitle:
      'Lab completions, pending queue, and technician productivity — first result time per tech.',
    kpiCards: [
      { value: k.completedToday, label: 'Completed today', sub: 'Requests finished' },
      { value: k.pendingQueue, label: 'Pending queue', sub: 'Awaiting processing' },
      { value: k.emergencyToday, label: 'Emergency orders', sub: 'Today' },
      { value: k.staffActiveToday, label: 'Techs active', sub: `Of ${k.labStaffCount} staff` },
      { value: k.completedYesterday, label: 'Yesterday', sub: 'Completed' },
    ],
    velocityTitle: 'Results velocity',
    velocitySubtitle: 'Lab results completed by hour today',
    velocityData: metrics.registrationVelocity,
    donutTitle: 'Request status today',
    donutSubtitle: 'All lab requests created today',
    donutData: metrics.visitsByStatus,
    employeeTitle: 'Laboratory technicians — today',
    employeeSubtitle: 'First activity is the first result submitted today.',
    employeeColumns: [
      { key: 'name', label: 'Technician' },
      { key: 'firstActivityTime', label: 'First result' },
      { key: 'resultsCompleted', label: 'Completed' },
      { key: 'emergencyResults', label: 'Emergency' },
      { key: 'totalProcessed', label: 'Total', bold: true },
    ],
    employees: metrics.employeesToday,
    recentTitle: 'Recent results',
    recentSubtitle: 'Latest lab results submitted today',
    recentActivity: metrics.recentActivity,
  };
}

export default function LaboratorySupervisorPage() {
  return (
    <ClinicalSupervisorPage
      fetchMetrics={getLaboratorySupervisorMetrics}
      socketEvent="laboratory:activity"
      moduleLabel="Laboratory supervisor · Staff analytics"
      footerLabel="Laboratory supervisor"
      dashboardConfig={labDashboardConfig}
    />
  );
}
