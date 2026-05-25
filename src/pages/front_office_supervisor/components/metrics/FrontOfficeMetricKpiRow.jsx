import { fos } from '../../styles/frontOfficeSupervisorClasses';

export default function FrontOfficeMetricKpiRow({ kpis }) {
  if (!kpis) return null;

  const cards = [
    { value: kpis.processedToday, label: 'Processed today', sub: 'All registrations & check-ins' },
    { value: kpis.newRegistrationsToday, label: 'New registrations', sub: 'First-time patients today' },
    { value: kpis.returningToday, label: 'Returning check-ins', sub: 'Follow-up visits today' },
    { value: kpis.emergencyToday, label: 'Emergency', sub: 'Emergency visits today' },
    { value: kpis.staffActiveToday, label: 'Staff active today', sub: `Of ${kpis.frontOfficeStaffCount} front office` },
    { value: kpis.processedYesterday, label: 'Yesterday', sub: 'Total processed prior day' },
  ];

  return (
    <div className={fos.kpiGrid}>
      {cards.map((card) => (
        <div key={card.label} className={fos.kpiCard}>
          <p className={fos.kpiValue}>{card.value}</p>
          <p className={fos.kpiLabel}>{card.label}</p>
          <p className="mt-1 text-[0.65rem] text-teal-100/90">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
