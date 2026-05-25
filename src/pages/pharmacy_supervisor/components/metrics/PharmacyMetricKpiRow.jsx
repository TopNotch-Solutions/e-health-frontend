import { ps } from '../../styles/pharmacySupervisorClasses';

export default function PharmacyMetricKpiRow({ kpis }) {
  if (!kpis) return null;

  const cards = [
    { value: kpis.totalMedications, label: 'Medications in stock', sub: 'SKUs at facility' },
    { value: kpis.lowStockCount, label: 'Low stock alerts', sub: 'At or below reorder level' },
    { value: kpis.pendingPrescriptions, label: 'Pending prescriptions', sub: 'Awaiting dispense' },
    { value: kpis.unitsReceivedToday, label: 'Units received today', sub: 'Purchased / loaded stock' },
    { value: kpis.dispensedToday, label: 'Dispensed today', sub: 'Completed prescriptions' },
  ];

  return (
    <div className={`${ps.kpiGrid} sm:grid-cols-5`}>
      {cards.map((card) => (
        <div key={card.label} className={ps.kpiCard}>
          <p className={ps.kpiValue}>{card.value}</p>
          <p className={ps.kpiLabel}>{card.label}</p>
          <p className="mt-1 text-[0.65rem] text-teal-100/90">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
