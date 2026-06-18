import { lookup } from '../../styles/lookupClasses';
import {
  computeLookupStats,
  getResultsSubtitle,
  getResultsTitle,
} from '../../utils/lookupUtils';
import LookupNoMatchActions from './LookupNoMatchActions';
import LookupPartialMatchRow from './LookupPartialMatchRow';
import LookupStatsCards from './LookupStatsCards';
import ReturningPatientCard from './ReturningPatientCard';

export default function LookupResultsView({
  results,
  phase,
  completeMatches,
  partialMatches,
  onResetSearch,
  onRegisterNew,
  onEmergency,
  onCompleteRegistration,
  onCheckIn,
  emergencyLoading,
  checkInLoading,
  checkInPatientId,
}) {
  const stats = computeLookupStats(results);
  const title = getResultsTitle(stats);
  const subtitle = getResultsSubtitle(stats, phase);

  return (
    <>
      <LookupStatsCards stats={stats} />

      <section className={lookup.resultsPanel} aria-labelledby="lookup-results-title">
        <header className={lookup.resultsHead}>
          <div>
            <h2 id="lookup-results-title" className={lookup.resultsTitle}>
              {title}
            </h2>
            <p className={lookup.resultsSubtitle}>{subtitle}</p>
          </div>
          <button type="button" className={lookup.btnSecondary} onClick={onResetSearch}>
            New search
          </button>
        </header>

        {results.length === 0 ? (
          <LookupNoMatchActions
            onRegisterNew={onRegisterNew}
            onEmergency={onEmergency}
            emergencyLoading={emergencyLoading}
          />
        ) : null}

        {completeMatches.length > 0 ? (
          <div className={`grid gap-5 ${completeMatches.length === 1 ? 'max-w-3xl' : 'md:grid-cols-2'}`}>
            {completeMatches.map((p) => (
              <ReturningPatientCard
                key={p.id}
                patient={p}
                onCheckIn={onCheckIn}
                checkInLoading={checkInLoading}
                checkInPatientId={checkInPatientId}
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
