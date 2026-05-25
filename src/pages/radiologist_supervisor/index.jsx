import { getRadiologistSupervisorMetrics } from '../../api/clinicalSupervisor';
import ClinicalSupervisorPage from '../../supervisor/ClinicalSupervisorPage';

function radiologyDashboardConfig(metrics) {
  const k = metrics.kpis;
  return {
    title: 'Radiology supervisor dashboard',
    subtitle:
      'Ultrasound referrals, pending queue, and sonographer productivity — first report time per radiologist.',
    kpiCards: [
      { value: k.referralsToday, label: 'Referrals today', sub: 'Doctor orders' },
      { value: k.completedToday, label: 'Completed today', sub: 'Reports finalized' },
      { value: k.pendingQueue, label: 'Pending queue', sub: 'Awaiting scan or report' },
      { value: k.emergencyToday, label: 'Emergency orders', sub: 'Today' },
      { value: k.staffActiveToday, label: 'Sonographers active', sub: `Of ${k.radiologistStaffCount} staff` },
      { value: k.completedYesterday, label: 'Yesterday', sub: 'Completed' },
    ],
    velocityTitle: 'Reports velocity',
    velocitySubtitle: 'Ultrasound reports completed by hour today',
    velocityData: metrics.registrationVelocity,
    donutTitle: 'Scan types today',
    donutSubtitle: 'Referrals by ultrasound study type',
    donutData: metrics.visitsByScanType,
    employeeTitle: 'Sonographers — today',
    employeeSubtitle: 'First activity is the first report submitted today.',
    employeeColumns: [
      { key: 'name', label: 'Sonographer' },
      { key: 'firstActivityTime', label: 'First report' },
      { key: 'reportsCompleted', label: 'Completed' },
      { key: 'emergencyReports', label: 'Emergency' },
      { key: 'totalProcessed', label: 'Total', bold: true },
    ],
    employees: metrics.employeesToday,
    recentTitle: 'Recent reports',
    recentSubtitle: 'Latest ultrasound reports submitted today',
    recentActivity: metrics.recentActivity,
  };
}

export default function RadiologistSupervisorPage() {
  return (
    <ClinicalSupervisorPage
      fetchMetrics={getRadiologistSupervisorMetrics}
      socketEvent="radiologist:activity"
      moduleLabel="Radiology supervisor · Staff analytics"
      footerLabel="Radiologist supervisor"
      dashboardConfig={radiologyDashboardConfig}
    />
  );
}
