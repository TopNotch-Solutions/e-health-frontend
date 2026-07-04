import { useEffect, useState } from 'react';
import { getPatient, getClinicalMedicalHistory } from '../../api/patients';
import { nurse as c } from '../../pages/nurse/styles/nurseClasses';
import MedicalHistoryBook from './MedicalHistoryBook';

export default function ConsultationMedicalHistoryPanel({
  patientId,
  visitId = null,
  showStatSummaryButton = true,
}) {
  const [open, setOpen] = useState(false);
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setOpen(false);
    setPatient(null);
    setHistory(null);
    setError('');
    setLoaded(false);
  }, [patientId]);

  useEffect(() => {
    if (!open || !patientId || loaded) return undefined;

    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all([getPatient(patientId), getClinicalMedicalHistory(patientId)])
      .then(([patientRow, historyRow]) => {
        if (!cancelled) {
          setPatient(patientRow);
          setHistory(historyRow);
          setLoaded(true);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load medical history');
          setPatient(null);
          setHistory(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [open, patientId, loaded]);

  if (!patientId) return null;

  return (
    <section className={c.readOnlyGroup}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className={c.readOnlyGroupTitle}>Medical history book</h3>
          <p className={`${c.hint} mt-0.5`}>
            Vitals history on file — open when you need the full record during consultation.
          </p>
        </div>
        <button
          type="button"
          className={
            open
              ? c.btnSecondary
              : 'inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1'
          }
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? 'Hide medical history' : 'View medical history book'}
        </button>
      </div>

      {open ? (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <MedicalHistoryBook
            patient={patient}
            history={history}
            loading={loading}
            error={error}
            showStatSummaryButton={showStatSummaryButton}
            medicalCardVisitId={visitId}
            compact
          />
        </div>
      ) : null}
    </section>
  );
}
