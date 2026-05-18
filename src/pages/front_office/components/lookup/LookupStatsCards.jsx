import { lookup } from '../../styles/lookupClasses';

export default function LookupStatsCards({ stats }) {
  return (
    <section className={lookup.statsGrid} aria-label="Search results summary">
      <article className={lookup.statCard}>
        <p className={lookup.statLabel}>Matches</p>
        <p className={lookup.statValue}>{stats.total}</p>
      </article>
      <article className={lookup.statCard}>
        <p className={lookup.statLabel}>Returning</p>
        <p className={`${lookup.statValue} ${stats.returning > 0 ? 'text-teal-600' : ''}`}>
          {stats.returning}
        </p>
      </article>
      <article className={lookup.statCard}>
        <p className={lookup.statLabel}>Incomplete</p>
        <p className={`${lookup.statValue} ${stats.incomplete > 0 ? 'text-amber-600' : ''}`}>
          {stats.incomplete}
        </p>
      </article>
    </section>
  );
}
