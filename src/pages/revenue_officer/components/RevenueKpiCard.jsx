import { revenue as rc } from '../styles/revenueClasses';

export default function RevenueKpiCard({ title, value, hint, alert = false }) {
  return (
    <article className={alert ? rc.kpiCardAlert : rc.kpiCard}>
      <p className={alert ? rc.kpiLabelAlert : rc.kpiLabel}>{title}</p>
      <p className={rc.kpiValue}>{value}</p>
      {hint ? <p className={alert ? rc.kpiHintAlert : rc.kpiHint}>{hint}</p> : null}
    </article>
  );
}
