import { reporting as c } from '../../pages/reporting/styles/reportingClasses';

export default function ReportListPagination({ pagination, loading, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className={c.pagination}>
      <span>
        Page {pagination.page} of {pagination.totalPages} ({pagination.total} report
        {pagination.total === 1 ? '' : 's'})
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className={c.paginationBtn}
          disabled={loading || pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className={c.paginationBtn}
          disabled={loading || pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
