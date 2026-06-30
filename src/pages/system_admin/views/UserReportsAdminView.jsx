import { useCallback, useEffect, useState } from 'react';
import {
  fetchReportAttachment,
  getAdminReports,
  REPORT_STATUS_OPTIONS,
  REPORTS_PAGE_SIZE,
  updateAdminReport,
} from '../../../api/reports';
import ReportListPagination from '../../../components/reports/ReportListPagination';
import { admin as c } from '../styles/adminClasses';
import {
  issueTypeLabel,
  statusBadgeClass,
  statusLabel,
} from '../../reporting/styles/reportingClasses';
import ReportImageThumbnail from '../../../components/reports/ReportImageThumbnail';

function ReportAttachmentLink({ reportId }) {
  const [loading, setLoading] = useState(false);

  const openAttachment = async () => {
    setLoading(true);
    try {
      const blob = await fetchReportAttachment(reportId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      window.alert(err.message || 'Could not open attachment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" className={c.btnGhost} onClick={openAttachment} disabled={loading}>
      {loading ? '…' : 'View'}
    </button>
  );
}

function CompleteReportModal({ report, open, onClose, onSubmit, submitting }) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) setNote('');
  }, [open, report?.id]);

  if (!open || !report) return null;

  return (
    <div className={c.modalBackdrop} role="dialog" aria-modal="true">
      <div className={c.modal}>
        <h3 className={c.modalTitle}>Complete report</h3>
        <p className={c.modalSub}>
          Add a response note for {report.reporter?.name || 'the reporter'}. They will see this
          when the report is marked completed.
        </p>
        <textarea
          className={`${c.input} mt-4 min-h-[6rem]`}
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Resolution summary or reply…"
          required
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className={c.btnSecondary} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className={c.btnPrimary}
            disabled={submitting || !note.trim()}
            onClick={() => onSubmit({ status: 'completed', admin_response: note.trim() })}
          >
            {submitting ? 'Saving…' : 'Mark completed'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserReportsAdminView({ onToast, currentUserId }) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: REPORTS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [completing, setCompleting] = useState(false);

  const load = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const result = await getAdminReports({
        status: statusFilter || undefined,
        page: targetPage,
        limit: REPORTS_PAGE_SIZE,
      });
      setRows(result.rows || []);
      setPagination(result.pagination);
      setPage(result.pagination?.page || targetPage);
    } catch (err) {
      onToast?.(err.message || 'Failed to load user reports');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, onToast]);

  useEffect(() => {
    load(page);
  }, [page, load]);

  const handleStatusChange = async (row, nextStatus) => {
    const isOwnReport =
      row.is_own_report ?? (currentUserId && row.reporter?.id === currentUserId);
    if (isOwnReport) {
      onToast?.('Another system administrator must action reports you submitted.');
      return;
    }
    if (nextStatus === 'completed') {
      setCompleteTarget(row);
      return;
    }
    setUpdatingId(row.id);
    try {
      await updateAdminReport(row.id, { status: nextStatus });
      onToast?.('Report status updated.');
      await load(page);
    } catch (err) {
      onToast?.(err.message || 'Failed to update report');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleComplete = async (payload) => {
    if (!completeTarget) return;
    setCompleting(true);
    try {
      await updateAdminReport(completeTarget.id, payload);
      onToast?.('Report marked completed with response.');
      setCompleteTarget(null);
      await load(page);
    } catch (err) {
      onToast?.(err.message || 'Failed to complete report');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className={c.chartPanel}>
      <div className={c.panelHeader}>
        <div>
          <h2 className={c.sectionTitle}>User reports</h2>
          <p className={c.sectionDesc}>
            Enquiries, issues, and improvement requests submitted by staff across the system.
          </p>
        </div>
        <button type="button" className={c.btnSecondary} onClick={() => load(page)} disabled={loading}>
          Refresh
        </button>
      </div>

      <div className={c.filters}>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Status
          <select
            className={c.input}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            {REPORT_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={c.whiteTableWrap}>
        <table className={c.whiteTable}>
          <thead>
            <tr>
              <th className={c.whiteTh}>Submitted</th>
              <th className={c.whiteTh}>Reporter</th>
              <th className={c.whiteTh}>Type</th>
              <th className={c.whiteTh}>Description</th>
              <th className={c.whiteTh}>Status</th>
              <th className={c.whiteTh}>Image</th>
              <th className={c.whiteTh}>Response</th>
              <th className={c.whiteTh}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className={c.whiteTdMuted} colSpan={8}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className={c.whiteTdMuted} colSpan={8}>
                  No reports found.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isOwnReport =
                  row.is_own_report ?? (currentUserId && row.reporter?.id === currentUserId);
                const canAction = row.can_action ?? !isOwnReport;

                return (
                <tr key={row.id}>
                  <td className={c.whiteTdMuted}>
                    {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                  </td>
                  <td className={c.whiteTd}>
                    <div className="font-semibold text-slate-900">{row.reporter?.name || '—'}</div>
                    <div className="text-xs text-slate-500">{row.reporter?.role || ''}</div>
                    <div className="text-xs text-slate-500">{row.reporter?.facility || ''}</div>
                  </td>
                  <td className={c.whiteTd}>{issueTypeLabel(row.issue_type)}</td>
                  <td className={c.whiteTd}>{row.description}</td>
                  <td className={c.whiteTd}>
                    <span className={statusBadgeClass(row.status)}>{statusLabel(row.status)}</span>
                  </td>
                  <td className={c.whiteTd}>
                    {row.has_image ? (
                      <div className="flex flex-col items-start gap-2">
                        <ReportImageThumbnail reportId={row.id} />
                        <ReportAttachmentLink reportId={row.id} />
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={c.whiteTd}>
                    {row.admin_response ? (
                      <span className="text-sm text-slate-700">{row.admin_response}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={c.whiteTd}>
                    {canAction ? (
                      <select
                        className={c.input}
                        value={row.status}
                        disabled={updatingId === row.id || row.status === 'completed'}
                        onChange={(e) => handleStatusChange(row, e.target.value)}
                      >
                        {REPORT_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Awaiting another administrator
                      </span>
                    )}
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ReportListPagination pagination={pagination} loading={loading} onPageChange={setPage} />

      <CompleteReportModal
        report={completeTarget}
        open={Boolean(completeTarget)}
        onClose={() => setCompleteTarget(null)}
        onSubmit={handleComplete}
        submitting={completing}
      />
    </div>
  );
}
