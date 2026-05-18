import { ehr } from '../../styles/ehrClasses';
import { formatDateTime } from '../../utils/ehrUtils';

export default function EhrStatsCards({ stats }) {
  const lastLabel = stats.lastVisit ? formatDateTime(stats.lastVisit) : 'No visits yet';

  return (
    <div className={ehr.statsGrid} aria-label="Record summary">
      <div className={ehr.statCard}>
        <p className={ehr.statLabel}>Total visits</p>
        <p className={ehr.statValue}>{stats.total}</p>
      </div>
      <div className={ehr.statCard}>
        <p className={ehr.statLabel}>Active visits</p>
        <p className={`${ehr.statValue} ${stats.active > 0 ? 'text-sky-600' : ''}`}>{stats.active}</p>
      </div>
      <div className={ehr.statCard}>
        <p className={ehr.statLabel}>Last visit</p>
        <p className="mt-1 text-sm font-semibold leading-snug text-slate-900">{lastLabel}</p>
      </div>
    </div>
  );
}
