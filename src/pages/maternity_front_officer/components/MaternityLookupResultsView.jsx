import LookupPartialMatchRow from '../../front_office/components/lookup/LookupPartialMatchRow';
import LookupStatsCards from '../../front_office/components/lookup/LookupStatsCards';
import {
  computeLookupStats,
  getResultsTitle,
} from '../../front_office/utils/lookupUtils';
import { lookup } from '../../front_office/styles/lookupClasses';
import MaternityNoMatchActions from './MaternityNoMatchActions';
import MaternityReturningPatientCard from './MaternityReturningPatientCard';

function getMaternityResultsSubtitle(stats, phase) {
  if (stats.total === 0) {
    return 'No match in the register. Register a new maternity patient and route to ANC or ANW.';
  }
  if (phase === 'returning' && stats.returning === 1) {
    return 'Returning patient identified. Select ANC or ANW and route to the maternity queue.';
  }
  if (stats.returning > 1) {
    return 'Select the correct patient. Do not start a new registration.';
  }
  return 'These records are missing required fields. Complete registration before routing.';
}

export default function MaternityLookupResultsView({
  results,
  phase,
  completeMatches,
  partialMatches,
  onResetSearch,
  onRegisterNew,
  onCompleteRegistration,
  onRoute,
  routeLoading,
  routePatientId,
}) {
  const stats = computeLookupStats(results);
  const title = getResultsTitle(stats);
  const subtitle = getMaternityResultsSubtitle(stats, phase);

  return (
    <>
      <LookupStatsCards stats={stats} />

      <section className={lookup.resultsPanel} aria-labelledby="mfo-lookup-results-title">
        <header className={lookup.resultsHead}>
          <div>
            <h2 id="mfo-lookup-results-title" className={lookup.resultsTitle}>
              {title}
            </h2>
            <p className={lookup.resultsSubtitle}>{subtitle}</p>
          </div>
          <button type="button" className={lookup.btnSecondary} onClick={onResetSearch}>
            New search
          </button>
        </header>

        {results.length === 0 ? (
          <MaternityNoMatchActions onRegisterNew={onRegisterNew} />
        ) : null}

        {completeMatches.length > 0 ? (
          <div className={`grid gap-5 ${completeMatches.length === 1 ? 'max-w-3xl' : 'md:grid-cols-2'}`}>
            {completeMatches.map((p) => (
              <MaternityReturningPatientCard
                key={p.id}
                patient={p}
                onRoute={onRoute}
                routeLoading={routeLoading}
                routePatientId={routePatientId}
              />
            ))}
          </div>
        ) : null}

        {partialMatches.length > 0 ? (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-amber-800">
              Incomplete profiles
            </h3>
            {partialMatches.map((p) => (
              <LookupPartialMatchRow
                key={p.id}
                patient={p}
                onCompleteRegistration={onCompleteRegistration}
              />
            ))}
          </div>
        ) : null}

        {results.length > 1 && completeMatches.length > 0 && phase === 'results' ? (
          <p className={`${lookup.hint} mt-5`}>
            Multiple matches found. Select the correct patient above — do not register a duplicate.
          </p>
        ) : null}
      </section>
    </>
  );
}
