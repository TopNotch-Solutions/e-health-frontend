import MedicalHistoryBook from './MedicalHistoryBook';

/**
 * Maternity pathway medical record book — reuses the shared book UI with maternity-scoped history.
 */
export default function MaternityMedicalHistoryBook({
  patient,
  history,
  loading,
  error,
  showStatSummaryButton = true,
  compact = true,
}) {
  return (
    <MedicalHistoryBook
      patient={patient}
      history={history}
      loading={loading}
      error={error}
      showStatSummaryButton={showStatSummaryButton}
      compact={compact}
      bookLabel="Maternity medical history book"
      emptyMessage="No maternity visits on file for this patient yet."
      pageHint="Each page shows a maternity visit — Front Office, ANC, ANW, PNW, ICU, or NICU stops with captured session and daily records."
    />
  );
}
