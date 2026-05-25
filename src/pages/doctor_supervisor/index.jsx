import { getDoctorSupervisorMetrics } from '../../api/clinicalSupervisor';
import ClinicalSupervisorPage from '../../supervisor/ClinicalSupervisorPage';

function doctorDashboardConfig(metrics) {
  const k = metrics.kpis;
  return {
    title: 'Doctor supervisor dashboard',
    subtitle:
      'Consultations, prescriptions, lab orders, and admissions — per doctor with first activity time.',
    kpiCards: [
      { value: k.consultationsToday, label: 'Consultations', sub: 'Today' },
      { value: k.prescriptionsToday, label: 'Prescriptions', sub: 'Sent to pharmacy' },
      { value: k.labOrdersToday, label: 'Lab orders', sub: 'Requested today' },
      { value: k.admissionsToday, label: 'Admissions', sub: 'Today' },
      { value: k.staffActiveToday, label: 'Doctors active', sub: `Of ${k.doctorStaffCount} staff` },
      { value: k.consultationsYesterday, label: 'Yesterday', sub: 'Consultations' },
    ],
    velocityTitle: 'Consultation velocity',
    velocitySubtitle: 'Consultations started by hour today',
    velocityData: metrics.registrationVelocity,
    donutTitle: 'Clinical actions today',
    donutSubtitle: 'Consultations, prescriptions, labs, admissions',
    donutData: metrics.visitsByAction,
    employeeTitle: 'Medical officers — today',
    employeeSubtitle: 'First activity is the first consultation of the day.',
    employeeColumns: [
      { key: 'name', label: 'Doctor' },
      { key: 'firstActivityTime', label: 'First patient' },
      { key: 'consultations', label: 'Consults' },
      { key: 'prescriptions', label: 'Rx' },
      { key: 'labOrders', label: 'Labs' },
      { key: 'totalProcessed', label: 'Total', bold: true },
    ],
    employees: metrics.employeesToday,
    recentTitle: 'Recent consultations',
    recentSubtitle: 'Latest doctor activity today',
    recentActivity: metrics.recentActivity,
  };
}

export default function DoctorSupervisorPage() {
  return (
    <ClinicalSupervisorPage
      fetchMetrics={getDoctorSupervisorMetrics}
      socketEvent="doctor:activity"
      moduleLabel="Doctor supervisor · Staff analytics"
      footerLabel="Doctor supervisor"
      dashboardConfig={doctorDashboardConfig}
    />
  );
}
