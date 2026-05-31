/** Helpers for the patient lookup dashboard. */

export function computeLookupStats(results) {
  const list = Array.isArray(results) ? results : [];
  const returning = list.filter((p) => p.profile_complete).length;
  const incomplete = list.length - returning;
  return {
    total: list.length,
    returning,
    incomplete,
  };
}

export function getResultsTitle(stats) {
  if (stats.total === 0) return 'No records found';
  if (stats.returning > 0) return 'Returning patient(s) found';
  return 'Possible matches need completion';
}

export function getResultsSubtitle(stats, phase) {
  if (stats.total === 0) {
    return 'No match in the national register. Register a new patient or use emergency intake.';
  }
  if (phase === 'returning' && stats.returning === 1) {
    return 'Returning patient identified. Select a routing destination and send to the clinic queue.';
  }
  if (stats.returning > 1) {
    return 'Select the correct patient. Do not start a new registration.';
  }
  return 'These records are missing required fields. Complete registration before check-in.';
}

export function lookupSteps(phase) {
  const onSearch = phase === 'find';
  const onResults = phase === 'results' || phase === 'returning';
  return [
    { id: 'search', label: '1. Search', active: onSearch, done: onResults },
    { id: 'review', label: '2. Review', active: onResults, done: false },
  ];
}
