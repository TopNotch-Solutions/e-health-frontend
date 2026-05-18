import { ehr } from '../../styles/ehrClasses';

export default function EhrLoadingSkeleton() {
  return (
    <div className={ehr.page} aria-busy="true" aria-label="Loading health record">
      <div className={`${ehr.skeleton} h-40 w-full rounded-2xl`} />
      <div className={ehr.statsGrid}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${ehr.skeleton} h-24 rounded-xl`} />
        ))}
      </div>
      <div className={`${ehr.skeleton} h-96 w-full rounded-2xl`} />
    </div>
  );
}
