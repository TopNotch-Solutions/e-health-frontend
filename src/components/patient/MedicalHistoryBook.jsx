import { useCallback, useEffect, useMemo, useState } from 'react';
import { lookup } from '../../pages/front_office/styles/lookupClasses';
import { patientInitials } from '../../pages/front_office/utils/ehrUtils';
import { buildBookModel, buildIdentityFields, formatStepTime } from './medicalHistoryBookUtils';

function bookStyles({ compact }) {
  const dense = compact;
  const pageH = dense ? 'h-[26rem]' : 'h-[32rem]';
  return {
    shell: dense
      ? 'mx-auto flex w-full max-w-4xl flex-col gap-3'
      : 'mx-auto flex w-full max-w-5xl flex-col gap-4',
    toolbar:
      'rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur-sm sm:p-3.5',
    toolbarRow: 'flex flex-wrap items-center justify-between gap-2.5',
    statBtn:
      'inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-gradient-to-b from-red-50 to-red-100/80 px-3 py-1.5 text-xs font-bold text-red-800 shadow-sm transition hover:from-red-100 hover:to-red-100',
    readOnlyBadge:
      'rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-slate-500',
    navCluster: 'flex items-center gap-2',
    navBtn:
      'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40',
    navBtnPrimary:
      'rounded-lg bg-gradient-to-b from-teal-600 to-teal-700 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-teal-900/20 transition hover:from-teal-500 hover:to-teal-600 disabled:opacity-40',
    pageBadge:
      'rounded-full bg-slate-900 px-3 py-1 text-[0.65rem] font-semibold tracking-wide text-white tabular-nums sm:text-xs',
    bookStage: 'perspective-[1400px] px-1 sm:px-2',
    bookWrap: 'relative mx-auto w-full transition-transform duration-500 ease-out',
    bookOuter:
      'rounded-2xl bg-gradient-to-br from-slate-200/60 via-slate-100 to-teal-100/40 p-2 shadow-xl shadow-slate-900/10 sm:p-2.5',
    bookBody:
      `relative overflow-hidden rounded-xl bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_20px_40px_-12px_rgba(15,23,42,0.18)] ${pageH}`,
    bookSpine:
      'pointer-events-none absolute left-1/2 top-0 bottom-0 z-10 w-[3px] -translate-x-1/2 bg-gradient-to-b from-slate-300/40 via-slate-400/70 to-slate-300/40 shadow-[2px_0_8px_rgba(15,23,42,0.08),-2px_0_8px_rgba(15,23,42,0.08)]',
    bookSpread: `grid ${pageH} grid-cols-1 md:grid-cols-2`,
    page: dense ? 'flex h-full flex-col px-4 py-4 sm:px-5 sm:py-5' : 'flex h-full flex-col px-5 py-5 sm:px-6 sm:py-6',
    pageLeft:
      'overflow-hidden border-b border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 md:border-b-0 md:border-r md:border-slate-200/80',
    pageRight: 'overflow-hidden bg-white',
    pageIdentity: 'min-h-0 flex-1 overflow-hidden',
    pageScrollBody: 'min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5',
    pageFooter:
      'shrink-0 border-t border-slate-100 pt-2.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-slate-400',
    identityHeader: 'shrink-0 text-center',
    avatarWrap: 'relative mx-auto w-fit',
    avatar: dense
      ? 'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-800 text-sm font-bold text-white shadow-lg shadow-teal-900/25 ring-4 ring-white'
      : 'flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-800 text-base font-bold text-white shadow-lg shadow-teal-900/25 ring-4 ring-white',
    idBadge:
      'absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-2.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-white shadow-md',
    patientName: dense
      ? 'mt-2 text-center text-sm font-bold tracking-tight text-slate-900'
      : 'mt-2.5 text-center text-base font-bold tracking-tight text-slate-900',
    identityBody: dense ? 'mt-2 space-y-2' : 'mt-2.5 space-y-2.5',
    identitySectionTitle:
      'text-[0.6rem] font-bold uppercase tracking-wider text-teal-700',
    identityGrid: 'grid grid-cols-2 gap-x-2.5 gap-y-2',
    identityField: 'min-w-0',
    fieldValueMono: 'mt-0.5 truncate font-mono text-[0.7rem] font-semibold text-slate-800 sm:text-xs',
    fieldValueCompact: 'mt-0.5 text-[0.7rem] font-semibold leading-snug text-slate-800 sm:text-xs',
    fieldLabel: 'text-[0.6rem] font-bold uppercase tracking-wider text-slate-400',
    fieldValue: 'mt-0.5 text-sm font-semibold text-slate-800',
    fieldSub: 'text-[0.7rem] text-slate-500',
    grid2: 'grid grid-cols-2 gap-2.5',
    contactCard:
      'rounded-xl border border-slate-200/80 bg-white/70 p-2.5 shadow-sm backdrop-blur-sm',
    contactTitle:
      'flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-wider text-teal-700',
    alertBox:
      'shrink-0 rounded-xl border border-red-200/80 bg-gradient-to-r from-red-50 to-rose-50 p-3 shadow-sm',
    alertTitle: 'text-xs font-bold text-red-800',
    alertLabel: 'text-[0.6rem] font-bold uppercase tracking-wide text-red-500',
    statCard:
      'rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 shadow-sm',
    statLabel: 'text-[0.6rem] font-bold uppercase tracking-wide text-slate-400',
    statValue: 'mt-0.5 text-sm font-bold text-teal-900',
    consultHeader:
      'shrink-0 rounded-xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-teal-50/40 px-3 py-2.5',
    consultTitle: 'text-[0.65rem] font-bold uppercase tracking-wider text-slate-400',
    consultVisit: 'font-mono text-sm font-bold text-slate-900 sm:text-base',
    consultMeta: 'mt-0.5 text-[0.7rem] leading-relaxed text-slate-500',
    pathwayLabel:
      'mt-3 shrink-0 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400',
    timeline: 'mt-2 space-y-0',
    timelineItem: 'relative flex gap-2.5 pb-3.5 last:pb-0',
    timelineRail:
      'absolute left-[0.4rem] top-5 bottom-0 w-px bg-gradient-to-b from-teal-300 to-slate-200',
    timelineDot:
      'relative z-[1] mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-600 shadow-[0_0_0_3px_rgba(255,255,255,1),0_0_0_4px_rgba(13,148,136,0.25)]',
    stepCard:
      'min-w-0 flex-1 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm transition hover:border-teal-200/80 hover:shadow-md',
    stepHeader: 'flex flex-wrap items-center justify-between gap-1',
    stepLabel: 'text-xs font-bold text-slate-900',
    stepTime: 'mt-0.5 text-[0.65rem] font-medium tabular-nums text-teal-700',
    detailRow: 'mt-1.5 text-xs leading-relaxed text-slate-600',
    detailLabel: 'font-semibold text-slate-800',
    emptyPage:
      'flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-white text-center text-sm text-slate-400',
    hint: 'text-center text-[0.7rem] text-slate-400 sm:text-xs',
    loadingWrap: dense ? 'py-10' : 'py-12',
    loadingSpinner: dense ? 'h-7 w-7' : 'h-8 w-8',
    statOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm',
    statPanel:
      'max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-red-200 bg-white p-5 shadow-2xl',
    statTitle: 'text-base font-bold text-red-800',
    statSection: 'mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3',
    statSectionTitle: 'text-[0.65rem] font-bold uppercase tracking-wide text-slate-500',
    statList: 'mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-slate-800 sm:text-sm',
  };
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-teal-700">
      <path
        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-red-600">
      <path
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IdentityField({ label, value, mono, fullWidth, styles }) {
  const valueClass = mono ? styles.fieldValueMono : styles.fieldValueCompact;
  return (
    <div className={`${styles.identityField} ${fullWidth ? 'col-span-2' : ''}`}>
      <p className={styles.fieldLabel}>{label}</p>
      <p className={valueClass}>{value}</p>
    </div>
  );
}

function IdentityPage({ identity, pageNumber, styles }) {
  const fields = buildIdentityFields(identity);

  return (
    <div className={`${styles.page} ${styles.pageLeft}`}>
      <div className={`${styles.pageIdentity} flex flex-col`}>
        <div className={styles.identityHeader}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar} aria-hidden>
              {patientInitials({
                first_name: identity.firstName !== '—' ? identity.firstName : identity.fullName.split(' ')[0],
                last_name: identity.lastName !== '—' ? identity.lastName : identity.fullName.split(' ').slice(1).join(' '),
              })}
            </div>
            <span className={styles.idBadge}>ID #{identity.patientId}</span>
          </div>
          <h2 className={styles.patientName}>{identity.fullName}</h2>
        </div>

        <div className={styles.identityBody}>
          <div>
            <p className={styles.identitySectionTitle}>Patient details</p>
            <div className={`${styles.identityGrid} mt-1.5`}>
              {fields.map((field) => (
                <IdentityField key={field.label} {...field} styles={styles} />
              ))}
            </div>
          </div>

          <div className={styles.contactCard}>
            <p className={styles.contactTitle}>
              <PhoneIcon />
              Emergency contact
            </p>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <div>
                <p className={styles.fieldLabel}>Name</p>
                <p className={styles.fieldValueCompact}>{identity.emergencyContact.name}</p>
              </div>
              <div>
                <p className={styles.fieldLabel}>Phone</p>
                <p className={`${styles.fieldValueCompact} text-teal-700`}>
                  {identity.emergencyContact.phone}
                </p>
              </div>
            </div>
          </div>

          {identity.latestVitalsLine ? (
            <div>
              <p className={styles.identitySectionTitle}>Latest vitals on file</p>
              <p className={`${styles.fieldValueCompact} mt-1`}>{identity.latestVitalsLine}</p>
            </div>
          ) : null}
        </div>
      </div>

      <p className={styles.pageFooter}>Page {pageNumber} · Identity</p>
    </div>
  );
}

function CriticalAlerts({ alerts, styles }) {
  if (!alerts?.length) return null;
  return (
    <div className={styles.alertBox} role="alert">
      <p className={`${styles.alertTitle} flex items-center gap-1.5`}>
        <AlertIcon />
        Critical alerts
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {alerts.map((alert, idx) => (
          <div key={idx}>
            <p className={styles.alertLabel}>{alert.type}</p>
            <p className="mt-0.5 text-xs text-red-900">{alert.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VitalsSummaryRow({ identity, styles }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <div className={styles.statCard}>
        <p className={styles.statLabel}>Visits on file</p>
        <p className={styles.statValue}>{identity.visitCount ?? 0}</p>
      </div>
      <div className={styles.statCard}>
        <p className={styles.statLabel}>Latest vitals</p>
        <p className={`${styles.statValue} text-xs font-semibold leading-snug`}>
          {identity.latestVitalsLine || 'None recorded'}
        </p>
      </div>
    </div>
  );
}

function TimelineStep({ step, isLast, styles }) {
  return (
    <li className={styles.timelineItem}>
      {!isLast ? <span className={styles.timelineRail} aria-hidden /> : null}
      <span className={styles.timelineDot} aria-hidden />
      <div className={styles.stepCard}>
        <div className={styles.stepHeader}>
          <p className={styles.stepLabel}>{step.label}</p>
        </div>
        <p className={styles.stepTime}>{formatStepTime(step)}</p>
        {step.details?.length ? (
          <div className="mt-2 space-y-1">
            {step.details.map((detail, idx) => (
              <p key={idx} className={styles.detailRow}>
                <span className={styles.detailLabel}>{detail.label}: </span>
                {detail.value}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-1.5 text-xs italic text-slate-500">No additional details captured.</p>
        )}
      </div>
    </li>
  );
}

function ConsultationTimelinePage({ consultation, identity, pageNumber, styles }) {
  if (!consultation) {
    return (
      <div className={`${styles.page} ${styles.pageRight} ${styles.emptyPage}`}>
        <p>No consultation on this page.</p>
        <p className={styles.pageFooter}>Page {pageNumber}</p>
      </div>
    );
  }

  const showAlerts = pageNumber === 2;

  return (
    <div className={`${styles.page} ${styles.pageRight}`}>
      {showAlerts ? <CriticalAlerts alerts={identity.criticalAlerts} styles={styles} /> : null}
      {showAlerts ? <VitalsSummaryRow identity={identity} styles={styles} /> : null}

      <div className={styles.pageScrollBody}>
        <div className={showAlerts ? 'mt-3' : ''}>
          <div className={styles.consultHeader}>
            <div>
              <p className={styles.consultTitle}>Consultation</p>
              <p className={styles.consultVisit}>{consultation.visitNumber}</p>
              <p className={styles.consultMeta}>
                {consultation.visitType}
                {' · '}
                Started {consultation.startedAtLabel}
                {consultation.completedAtLabel ? ` · Ended ${consultation.completedAtLabel}` : ''}
              </p>
            </div>
          </div>

          {consultation.stepCount > 0 ? (
            <>
              <p className={styles.pathwayLabel}>
                Care pathway · {consultation.stepCount} step{consultation.stepCount !== 1 ? 's' : ''}
              </p>

              <ol className={styles.timeline} aria-label="Consultation care pathway">
                {consultation.steps.map((step, index) => (
                  <TimelineStep
                    key={step.id}
                    step={step}
                    isLast={index === consultation.steps.length - 1}
                    styles={styles}
                  />
                ))}
              </ol>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No clinical stops recorded for this visit.</p>
          )}
        </div>
      </div>

      <p className={styles.pageFooter}>
        Page {pageNumber} · Consultation {consultation.consultationIndex + 1}
      </p>
    </div>
  );
}

function renderSpreadPage(page, patient, identity, styles) {
  if (!page) {
    return <div className={`${styles.page} ${styles.pageRight} ${styles.emptyPage}`} aria-hidden />;
  }

  if (page.kind === 'identity') {
    return (
      <IdentityPage
        identity={page.identity}
        pageNumber={page.pageNumber}
        styles={styles}
      />
    );
  }

  if (page.kind === 'consultation') {
    return (
      <ConsultationTimelinePage
        consultation={{ ...page.consultation, consultationIndex: page.consultationIndex }}
        identity={identity}
        pageNumber={page.pageNumber}
        styles={styles}
      />
    );
  }

  return null;
}

function StatSummaryModal({ summary, onClose, styles }) {
  return (
    <div className={styles.statOverlay} role="dialog" aria-modal="true" aria-labelledby="stat-summary-title">
      <div className={styles.statPanel}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="stat-summary-title" className={styles.statTitle}>Stat summary</h2>
            <p className="text-xs text-slate-600 sm:text-sm">
              {summary.patientName} · ID {summary.patientId}
            </p>
          </div>
          <button type="button" className={lookup.btnSecondary} onClick={onClose}>
            Close
          </button>
        </div>

        <section className={styles.statSection}>
          <h3 className={styles.statSectionTitle}>Active allergies</h3>
          <ul className={styles.statList}>
            {summary.allergies.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={styles.statSection}>
          <h3 className={styles.statSectionTitle}>Current medications</h3>
          <ul className={styles.statList}>
            {summary.medications.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={styles.statSection}>
          <h3 className={styles.statSectionTitle}>Vitals captures on file</h3>
          <p className="mt-1.5 text-xs text-slate-800 sm:text-sm">
            {summary.vitalsCount ?? 0} recorded capture{(summary.vitalsCount ?? 0) !== 1 ? 's' : ''}
          </p>
        </section>

        <section className={styles.statSection}>
          <h3 className={styles.statSectionTitle}>Last recorded vitals</h3>
          <p className="mt-1.5 text-xs text-slate-800 sm:text-sm">{summary.lastVitals}</p>
        </section>
      </div>
    </div>
  );
}

export default function MedicalHistoryBook({
  patient,
  history,
  loading,
  error,
  showStatSummaryButton = true,
  compact = false,
  interactive = false,
  bookLabel = 'Medical history book',
  emptyMessage = 'No medical history on file for this patient.',
  pageHint = null,
}) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [statOpen, setStatOpen] = useState(false);
  const [flipDir, setFlipDir] = useState('right');

  const bookModel = useMemo(() => {
    if (!patient || !history) return null;
    return buildBookModel(patient, history);
  }, [patient, history]);

  const spreads = bookModel?.spreads || [];
  const totalPages = bookModel?.totalPages || 0;
  const totalSpreads = spreads.length;
  const currentSpread = spreads[spreadIndex] || null;

  const goToSpread = useCallback((index, direction = 'right') => {
    setFlipDir(direction);
    setSpreadIndex(Math.max(0, Math.min(index, totalSpreads - 1)));
  }, [totalSpreads]);

  const goPrev = useCallback(() => {
    goToSpread(spreadIndex - 1, 'left');
  }, [goToSpread, spreadIndex]);

  const goNext = useCallback(() => {
    goToSpread(spreadIndex + 1, 'right');
  }, [goToSpread, spreadIndex]);

  useEffect(() => {
    setSpreadIndex(0);
    setStatOpen(false);
  }, [patient?.id, history]);

  useEffect(() => {
    function onKey(e) {
      if (statOpen) return;
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext, statOpen]);

  const styles = bookStyles({ compact });

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white shadow-sm ${styles.loadingWrap}`}>
        <div className={`${styles.loadingSpinner} animate-spin rounded-full border-2 border-teal-600 border-t-transparent`} />
        <p className="text-xs font-medium text-slate-600 sm:text-sm">Opening medical record book…</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
        {error}
      </p>
    );
  }

  if (!patient) {
    return <p className="text-sm text-slate-500">Select a patient to open their medical record book.</p>;
  }

  if (!bookModel) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  const leftPageNumber = currentSpread?.left?.pageNumber;
  const rightPageNumber = currentSpread?.right?.pageNumber;
  const pageLabel = totalPages
    ? `Pages ${leftPageNumber}${rightPageNumber ? `–${rightPageNumber}` : ''} of ${totalPages}`
    : 'Page 1';

  const animClass = flipDir === 'left' ? 'animate-[bookPageInLeft_0.3s_ease-out]' : 'animate-[bookPageInRight_0.3s_ease-out]';

  return (
    <>
      <style>{`
        @keyframes bookPageInRight {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bookPageInLeft {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className={styles.shell}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarRow}>
            <div className="flex flex-wrap items-center gap-1.5">
              {showStatSummaryButton ? (
                <button type="button" className={styles.statBtn} onClick={() => setStatOpen(true)}>
                  Stat summary
                </button>
              ) : null}
              <span className={styles.readOnlyBadge}>Read only</span>
            </div>
            <div className={styles.navCluster}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={goPrev}
                disabled={spreadIndex === 0}
              >
                ← Prev
              </button>
              <span className={styles.pageBadge}>{pageLabel}</span>
              <button
                type="button"
                className={styles.navBtnPrimary}
                onClick={goNext}
                disabled={spreadIndex >= totalSpreads - 1}
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        <div className={styles.bookStage}>
          <div className={styles.bookWrap}>
            <div className={styles.bookOuter}>
              <div className={styles.bookBody} aria-label={bookLabel}>
                <div className={styles.bookSpine} aria-hidden />
                <div key={spreadIndex} className={`${styles.bookSpread} ${animClass}`}>
                  {renderSpreadPage(currentSpread?.left, patient, bookModel.identity, styles)}
                  {renderSpreadPage(
                    currentSpread?.right,
                    patient,
                    bookModel.identity,
                    styles,
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className={styles.hint}>
          {pageHint || (totalPages > 1
            ? `The book has ${totalPages} page${totalPages !== 1 ? 's' : ''} — identity plus one page per consultation. Use Prev/Next or arrow keys to turn pages.`
            : 'Page 1 shows patient identity. Additional pages appear as consultations are recorded.')}
        </p>

        {statOpen ? (
          <StatSummaryModal
            summary={bookModel.statSummary}
            onClose={() => setStatOpen(false)}
            styles={styles}
          />
        ) : null}
      </div>
    </>
  );
}
