import { useEffect, useState } from 'react';
import { getPatient } from '../../api/patients';
import { getMaternityMedicalHistory } from '../../api/maternity';
import { nurse as c } from '../../pages/nurse/styles/nurseClasses';
import MaternityMedicalHistoryBook from './MaternityMedicalHistoryBook';

export default function MaternityMedicalHistoryPanel({ patientId }) {
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

    Promise.all([getPatient(patientId), getMaternityMedicalHistory(patientId)])
      .then(([patientRow, historyRow]) => {
        if (!cancelled) {
          setPatient(patientRow);
          setHistory(historyRow);
          setLoaded(true);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load maternity medical history');
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
          <h3 className={c.readOnlyGroupTitle}>Maternity medical history book</h3>
          <p className={`${c.hint} mt-0.5`}>
            ANC sessions, ward daily records, NICU newborn links, and maternity pathway stops on file.
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
          {open ? 'Hide maternity history' : 'View maternity history book'}
        </button>
      </div>

      {open ? (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <MaternityMedicalHistoryBook
            patient={patient}
            history={history}
            loading={loading}
            error={error}
            compact
          />
        </div>
      ) : null}
    </section>
  );
}
