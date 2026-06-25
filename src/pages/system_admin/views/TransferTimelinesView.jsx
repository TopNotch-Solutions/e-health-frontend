import { Fragment, useCallback, useEffect, useState } from 'react';
import {
  downloadAdminTransferTimelinesExport,
  getAdminTransferTimelines,
} from '../../../api/admin';
import TransferTimeline from '../../../components/hospital/TransferTimeline';
import { TRANSFER_STATUS_LABELS } from '../../../constants/hospitalOutpatientDepartments';
import { admin as c } from '../styles/adminClasses';

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

function patientName(row) {
  const p = row?.visit?.patient;
  if (!p) return '—';
  return [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || '—';
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.entries(TRANSFER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export default function TransferTimelinesView({ facilities = [], onToast }) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [clinicFilter, setClinicFilter] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const clinics = facilities.filter((f) => f.type === 'clinic');
  const hospitals = facilities.filter((f) => f.type === 'hospital' || f.type === 'health_center');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await getAdminTransferTimelines({
        page,
        limit: 25,
        status: statusFilter || undefined,
        clinic_facility_id: clinicFilter || undefined,
        hospital_facility_id: hospitalFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setRows(result.rows);
      setPagination(result.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 });
    } catch (err) {
      onToast?.(err.message || 'Failed to load transfer timelines');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, clinicFilter, hospitalFilter, fromDate, toDate, onToast]);

  useEffect(() => {
    load(1);
  }, [load]);

  async function handleExport() {
    setExporting(true);
    try {
      const { blob, filename } = await downloadAdminTransferTimelinesExport({
        status: statusFilter || undefined,
        clinic_facility_id: clinicFilter || undefined,
        hospital_facility_id: hospitalFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      triggerDownload(blob, filename);
      onToast?.('Transfer timelines exported');
    } catch (err) {
      onToast?.(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className={`${c.panelHeader} mb-3`}>
        <div>
          <h2 className={c.sectionTitle}>Clinic → hospital transfer timelines</h2>
          <p className={c.sectionDesc}>
            Audit timestamps for each step from booking room through department receipt.
            Visible to system administrators only.
          </p>
        </div>
        <button
          type="button"
          className={c.btnPrimary}
          disabled={exporting || loading}
          onClick={handleExport}
        >
          {exporting ? 'Preparing Excel…' : 'Download XLSX'}
        </button>
      </div>

      <div className={`${c.filters} mb-4`}>
        <select
          className={c.input}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          className={c.input}
          value={clinicFilter}
          onChange={(e) => setClinicFilter(e.target.value)}
          aria-label="Filter by clinic"
        >
          <option value="">All clinics</option>
          {clinics.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <select
          className={c.input}
          value={hospitalFilter}
          onChange={(e) => setHospitalFilter(e.target.value)}
          aria-label="Filter by hospital"
        >
          <option value="">All hospitals</option>
          {hospitals.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <input
          type="date"
          className={c.input}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          aria-label="From date"
        />
        <input
          type="date"
          className={c.input}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          aria-label="To date"
        />
      </div>

      <div className={c.tableWrap}>
        <table className={c.table}>
          <thead>
            <tr>
              <th className={c.th}>Patient</th>
              <th className={c.th}>Clinic</th>
              <th className={c.th}>Hospital</th>
              <th className={c.th}>Status</th>
              <th className={c.th}>Created</th>
              <th className={c.th}><span className="sr-only">Timeline</span></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className={c.tdMuted} colSpan={6}>Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className={c.tdMuted} colSpan={6}>No transfers match your filters.</td>
              </tr>
            ) : (
              rows.map((row) => {
                const expanded = expandedId === row.id;
                return (
                  <Fragment key={row.id}>
                    <tr>
                      <td className={c.td}>
                        <div className="font-semibold">{patientName(row)}</div>
                        <div className="text-xs text-emerald-100/80">
                          {row.visit?.patient?.patient_number || '—'}
                        </div>
                      </td>
                      <td className={c.tdMuted}>{row.clinicFacility?.name || '—'}</td>
                      <td className={c.tdMuted}>{row.hospitalFacility?.name || '—'}</td>
                      <td className={c.tdMuted}>
                        {TRANSFER_STATUS_LABELS[row.transfer_status] || row.transfer_status}
                      </td>
                      <td className={c.tdMuted}>{formatDateTime(row.created_at)}</td>
                      <td className={c.td}>
                        <button
                          type="button"
                          className={c.btnGhost}
                          onClick={() => setExpandedId(expanded ? null : row.id)}
                        >
                          {expanded ? 'Hide timeline' : 'View timeline'}
                        </button>
                      </td>
                    </tr>
                    {expanded ? (
                      <tr>
                        <td className={c.td} colSpan={6}>
                          <div className="rounded-lg border border-white/20 bg-white/10 p-4">
                            <TransferTimeline timeline={row.timeline} />
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} transfers)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className={c.btnSecondary}
              disabled={loading || pagination.page <= 1}
              onClick={() => load(pagination.page - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className={c.btnSecondary}
              disabled={loading || pagination.page >= pagination.totalPages}
              onClick={() => load(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
