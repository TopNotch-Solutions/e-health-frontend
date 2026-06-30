import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createUserReport,
  fetchReportAttachment,
  getMyReports,
  REPORTS_PAGE_SIZE,
} from '../../api/reports';
import ReportListPagination from '../../components/reports/ReportListPagination';
import { getStoredUser } from '../../api/authSession';
import { authRoleSlug, homePathForRole } from '../../utils/homePathForRole';
import TopbarSignOutButton from '../../components/TopbarSignOutButton';
import ReportImageThumbnail from '../../components/reports/ReportImageThumbnail';
import AppBrand from '../../components/brand/AppBrand';
import { topbar } from '../front_office/styles/frontOfficeClasses';
import {
  ISSUE_TYPE_CARDS,
  issueTypeLabel,
  reporting as c,
  statusBadgeClass,
  statusLabel,
} from './styles/reportingClasses';

const DESCRIPTION_MAX = 360;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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
    <button type="button" className={c.linkBtn} onClick={openAttachment} disabled={loading}>
      {loading ? 'Opening…' : 'View full image'}
    </button>
  );
}

function ReportCard({ row }) {
  return (
    <article className={c.reportCard}>
      <div className={c.reportCardTop}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={c.badgeType}>{issueTypeLabel(row.issue_type)}</span>
          <span className={statusBadgeClass(row.status)}>{statusLabel(row.status)}</span>
        </div>
        <time className={c.reportMeta} dateTime={row.created_at || undefined}>
          {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
        </time>
      </div>

      <p className={c.reportDescription}>{row.description}</p>

      {row.has_image ? (
        <div className={c.reportAttachment}>
          <ReportImageThumbnail
            reportId={row.id}
            className="h-16 w-16 rounded-lg border border-slate-200 object-cover shadow-sm"
          />
          <ReportAttachmentLink reportId={row.id} />
        </div>
      ) : null}

      {row.admin_response ? (
        <div className={c.responseBox}>
          <p className={c.responseLabel}>Administrator response</p>
          {row.admin_response}
        </div>
      ) : null}
    </article>
  );
}

export default function ReportingPage() {
  const user = getStoredUser();
  const homePath = homePathForRole(authRoleSlug(user)) || '/login';
  const operatorLabel =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'User';
  const initials =
    operatorLabel
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'U';

  const [issueType, setIssueType] = useState('issue');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: REPORTS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);

  const imagePreviewUrl = useMemo(() => {
    if (!image) return null;
    return URL.createObjectURL(image);
  }, [image]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const remaining = useMemo(() => DESCRIPTION_MAX - description.length, [description]);
  const charPercent = useMemo(
    () => Math.min(100, (description.length / DESCRIPTION_MAX) * 100),
    [description]
  );

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const applyImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPEG, PNG, etc.).');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image must be 5 MB or smaller.');
      return;
    }
    setError('');
    setImage(file);
  };

  const loadReports = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const result = await getMyReports({ page: targetPage, limit: REPORTS_PAGE_SIZE });
      setReports(result.rows || []);
      setPagination(result.pagination);
      setPage(result.pagination?.page || targetPage);
    } catch (err) {
      setError(err.message || 'Failed to load your reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports(page);
  }, [page, loadReports]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const text = description.trim();
    if (!text) {
      setError('Please enter a description.');
      return;
    }
    if (text.length > DESCRIPTION_MAX) {
      setError(`Description must be at most ${DESCRIPTION_MAX} characters.`);
      return;
    }

    setSubmitting(true);
    try {
      await createUserReport({ issue_type: issueType, description: text, image });
      setToast('Your report was submitted to the system administrator.');
      setDescription('');
      clearImage();
      setIssueType('issue');
      setPage(1);
      await loadReports(1);
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={c.page}>
      <header className={c.header}>
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
          <AppBrand className={topbar.brand} />
          <span className="text-sm font-medium text-slate-500">Reporting</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-700 text-xs font-bold text-white shadow-sm"
            aria-hidden
          >
            {initials}
          </span>
          <span className="max-w-[140px] truncate text-sm font-semibold text-slate-700 sm:max-w-none">
            {operatorLabel}
          </span>
          <TopbarSignOutButton moduleLabel="Reporting" className={topbar.signOut} />
        </div>
      </header>

      <main className={c.body}>
        <section className={c.hero} aria-labelledby="reporting-hero-title">
          <div className={c.heroGlow} aria-hidden />
          <div className={c.heroGlowAlt} aria-hidden />
          <Link to={homePath} className={c.backLink}>
            <span aria-hidden>←</span> Back to workspace
          </Link>
          <h1 id="reporting-hero-title" className={`${c.title} mt-4`}>
            Report an issue
          </h1>
          <p className={c.subtitle}>
            Share enquiries, report problems, or suggest improvements. Every submission goes
            directly to the system administrator — track responses below.
          </p>
          <div className={c.heroMeta}>
            <span className={c.heroPill}>Secure staff reporting</span>
            <span className={c.heroPill}>Optional screenshot</span>
            <span className={c.heroPill}>Status tracking</span>
          </div>
        </section>

        {toast ? (
          <p className={c.toast} role="status">
            <span className="text-lg leading-none" aria-hidden>
              ✓
            </span>
            {toast}
          </p>
        ) : null}

        <div className={c.layout}>
          <section className={`${c.panel} ${c.formPanel}`} aria-labelledby="report-form-title">
            <h2 id="report-form-title" className={c.panelTitle}>
              New report
            </h2>
            <p className={c.panelDesc}>
              Choose a category and describe what you need. Attach a screenshot if it helps.
            </p>

            {error ? (
              <p className={`${c.alert} mt-4`} role="alert">
                <span aria-hidden>!</span>
                {error}
              </p>
            ) : null}

            <form className="mt-5 space-y-6" onSubmit={handleSubmit}>
              <fieldset className="space-y-1">
                <legend className={c.label}>Category</legend>
                <div className={c.typeGrid} role="radiogroup" aria-label="Issue type">
                  {ISSUE_TYPE_CARDS.map((opt) => {
                    const active = issueType === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`${c.typeOption} ${active ? c.typeOptionActive : ''}`}
                      >
                        <input
                          type="radio"
                          name="issue-type"
                          value={opt.value}
                          checked={active}
                          onChange={() => setIssueType(opt.value)}
                          className="sr-only"
                        />
                        <span className={c.typeOptionTitle}>{opt.title}</span>
                        <span className={c.typeOptionDesc}>{opt.description}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className={c.formGrid}>
                <div>
                  <label htmlFor="description" className={c.label}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    className={c.textarea}
                    rows={6}
                    maxLength={DESCRIPTION_MAX}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What happened, where you saw it, and what you expected instead…"
                    required
                  />
                  <div className={c.charRow}>
                    <div className={c.charBar} aria-hidden>
                      <div className={c.charBarFill} style={{ width: `${charPercent}%` }} />
                    </div>
                    <p className={c.charCount}>
                      {remaining} left
                    </p>
                  </div>
                </div>

                <div>
                  <span className={c.label}>Screenshot (optional)</span>
                  <input
                    id="image"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => applyImageFile(e.target.files?.[0] || null)}
                  />
                  {!image ? (
                    <label
                      htmlFor="image"
                      className={`${c.uploadZone} ${dragOver ? c.uploadZoneActive : ''} min-h-[12rem] lg:min-h-full lg:py-10`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        applyImageFile(e.dataTransfer.files?.[0] || null);
                      }}
                    >
                      <span className={c.uploadIcon} aria-hidden>
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.75}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </span>
                      <span className={c.uploadTitle}>Drop an image or click to browse</span>
                      <span className={c.uploadHint}>JPEG, PNG, WebP — max 5 MB</span>
                    </label>
                  ) : (
                    <div className={`${c.imagePreviewCard} lg:min-h-[12rem]`}>
                      {imagePreviewUrl ? (
                        <img
                          src={imagePreviewUrl}
                          alt="Selected attachment preview"
                          className={c.imagePreview}
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className={c.imagePreviewMeta}>
                          <span className="font-semibold text-slate-800">{image.name}</span>
                          <br />
                          {(image.size / 1024).toFixed(1)} KB
                        </p>
                        <button type="button" className={c.btnRemoveImage} onClick={clearImage}>
                          Remove image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={c.formActions}>
                <button type="submit" className={c.btnPrimary} disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit report'}
                </button>
              </div>
            </form>
          </section>

          <section className={c.panel} aria-labelledby="my-reports-title">
            <div className={c.listHeader}>
              <div>
                <h2 id="my-reports-title" className={c.panelTitle}>
                  My reported issues
                </h2>
                <p className={c.panelDesc}>Track status and read administrator replies.</p>
              </div>
              {!loading && pagination.total > 0 ? (
                <span className={c.listCount}>
                  {pagination.total} report{pagination.total === 1 ? '' : 's'}
                </span>
              ) : null}
            </div>

            {loading ? (
              <div className={c.reportList} aria-busy="true" aria-label="Loading reports">
                <div className={c.skeleton} />
                <div className={c.skeleton} />
              </div>
            ) : reports.length === 0 ? (
              <div className={c.empty}>
                <span className={c.emptyIcon} aria-hidden>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </span>
                <p className={c.emptyTitle}>No reports yet</p>
                <p className={c.emptyDesc}>
                  When you submit an issue, it will appear here with its status.
                </p>
              </div>
            ) : (
              <div className={c.reportList}>
                {reports.map((row) => (
                  <ReportCard key={row.id} row={row} />
                ))}
              </div>
            )}

            <ReportListPagination
              pagination={pagination}
              loading={loading}
              onPageChange={setPage}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
