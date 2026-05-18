import { ehr } from '../../styles/ehrClasses';
import EhrVisitCard from './EhrVisitCard';

export default function EhrVisitTimeline({ visits, title = 'Visit history' }) {
  if (!visits.length) {
    return (
      <section className={ehr.panel} aria-labelledby="ehr-visits-title">
        <h2 id="ehr-visits-title" className={ehr.panelTitle}>
          {title}
        </h2>
        <p className={`${ehr.empty} mt-4`}>No visits on file for this patient.</p>
      </section>
    );
  }

  return (
    <section className={ehr.panel} aria-labelledby="ehr-visits-title">
      <div className={ehr.timelineHead}>
        <h2 id="ehr-visits-title" className={ehr.timelineTitle}>
          {title}
        </h2>
        <p className="text-sm text-slate-500">{visits.length} visit{visits.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="space-y-3" role="list">
        {visits.map((visit, index) => (
          <div key={visit.id} role="listitem">
            <EhrVisitCard visit={visit} defaultOpen={index === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}
