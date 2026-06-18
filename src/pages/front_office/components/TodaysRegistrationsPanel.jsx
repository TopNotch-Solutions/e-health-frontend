import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyRegistrationsToday } from '../../../api/frontOffice';
import { useToast } from '../context/ToastContext';
import { patientName } from '../patientUtils';
import { lookup } from '../styles/lookupClasses';
import { fo } from '../styles/frontOfficeModuleClasses';
import EditPatientModal from './EditPatientModal';

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

/**
 * Today's registrations list — used on the dedicated page and the lookup dashboard.
 */
export default function TodaysRegistrationsPanel({
  compact = false,
  limit,
  showHeaderLink = false,
  todayPath = '/front_office/today',
}) {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyRegistrationsToday();
      setRows(data.registrations || []);
    } catch (err) {
      if (!compact) {
        showToast(err.message || 'Failed to load registrations', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [compact, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const displayRows = limit ? rows.slice(0, limit) : rows;

  return (
    <>
      <section className={lookup.resultsPanel}>
        <header className={lookup.resultsHead}>
          <div>
            <h2 className={lookup.resultsTitle}>Today&apos;s registrations</h2>
            <p className={lookup.resultsSubtitle}>
              {loading
                ? 'Loading your records…'
                : `${rows.length} patient${rows.length === 1 ? '' : 's'} registered by you today · same-day edits only`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={lookup.btnSecondary} onClick={load} disabled={loading}>
              Refresh
            </button>
            {showHeaderLink && rows.length > (limit || 0) ? (
              <Link to={todayPath} className={lookup.btnPrimary}>
                View all
              </Link>
            ) : null}
          </div>
        </header>

        {loading ? (
          <p className={lookup.hint}>Loading…</p>
        ) : rows.length === 0 ? (
          <p className={lookup.empty}>
            No patients registered yet today. New registrations and check-ins you process will appear here.
          </p>
        ) : (
          <div className={`${fo.tableWrap} overflow-x-auto`}>
            <table className={fo.table}>
              <thead>
                <tr>
                  <th className={fo.th}>Time</th>
                  <th className={fo.th}>Patient</th>
                  {!compact ? <th className={fo.th}>Visit #</th> : null}
                  <th className={fo.th}>Routed to</th>
                  <th className={fo.th}>Type</th>
                  <th className={fo.th} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayRows.map((row) => (
                  <tr key={row.visit_id}>
                    <td className={fo.td}>{formatTime(row.registered_at)}</td>
                    <td className={fo.td}>
                      <span className="font-medium text-slate-900">{patientName(row.patient)}</span>
                      <span className="block text-xs text-slate-500">{row.patient?.patient_number}</span>
                    </td>
                    {!compact ? (
                      <td className={`${fo.td} font-mono text-xs`}>{row.visit_number}</td>
                    ) : null}
                    <td className={fo.td}>{row.routing_label || '—'}</td>
                    <td className={fo.td}>
                      <span className="capitalize">{row.visit_type?.replace('_', ' ')}</span>
                      {row.queue_priority === 'emergency' ? (
                        <span className="ml-1 rounded bg-rose-100 px-1.5 py-0.5 text-xs font-semibold text-rose-700">
                          Emergency
                        </span>
                      ) : null}
                    </td>
                    <td className={fo.td}>
                      {row.editable ? (
                        <button
                          type="button"
                          className={lookup.btnGhost}
                          onClick={() => setEditing(row)}
                        >
                          Edit details
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {compact && rows.length > (limit || 0) ? (
          <p className={`${lookup.hint} mt-4`}>
            Showing {displayRows.length} of {rows.length}.{' '}
            <Link to={todayPath} className="font-semibold text-teal-700 hover:underline">
              View full list
            </Link>
          </p>
        ) : null}
      </section>

      {editing ? (
        <EditPatientModal
          registration={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      ) : null}
    </>
  );
}
