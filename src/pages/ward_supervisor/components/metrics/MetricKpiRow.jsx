import { ws } from '../../styles/wardSupervisorClasses';

function DeltaBadge({ today, yesterday }) {
  const diff = today - yesterday;
  if (diff === 0) {
    return <span className="text-[0.65rem] text-teal-100/90">Same as yesterday</span>;
  }
  const up = diff > 0;
  return (
    <span className={`text-[0.65rem] font-semibold ${up ? 'text-emerald-200' : 'text-amber-200'}`}>
      {up ? '+' : ''}
      {diff} vs yesterday ({yesterday})
    </span>
  );
}

export default function MetricKpiRow({ kpis }) {
  if (!kpis) return null;

  const cards = [
    {
      value: kpis.registrationsToday,
      label: "Today's registrations",
      sub: <DeltaBadge today={kpis.registrationsToday} yesterday={kpis.registrationsYesterday} />,
    },
    {
      value: kpis.activeAdmissions,
      label: 'Active admissions',
      sub: <span className="text-[0.65rem] text-teal-100/90">Patients on beds now</span>,
    },
    {
      value: kpis.dischargesToday,
      label: 'Discharges today',
      sub: <span className="text-[0.65rem] text-teal-100/90">Successfully discharged</span>,
    },
    {
      value: kpis.avgTriageWaitMinutes,
      label: 'Avg triage wait',
      sub: (
        <span className="text-[0.65rem] text-teal-100/90">
          Registration → bed (min)
        </span>
      ),
      suffix: ' min',
    },
  ];

  return (
    <div className={ws.kpiGrid}>
      {cards.map((card) => (
        <div key={card.label} className={ws.kpiCard}>
          <p className={ws.kpiValue}>
            {card.value}
            {card.suffix || ''}
          </p>
          <p className={ws.kpiLabel}>{card.label}</p>
          <div className="mt-1">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
