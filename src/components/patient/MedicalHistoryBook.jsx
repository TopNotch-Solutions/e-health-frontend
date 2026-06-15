import { useCallback, useEffect, useMemo, useState } from 'react';
import { lookup } from '../../pages/front_office/styles/lookupClasses';
import { BOOK_CHAPTERS, buildBookPages } from './medicalHistoryBookUtils';

function bookStyles({ compact, interactive }) {
  const dense = compact;
  const medium = interactive && !compact;

  return {
    shell: dense
      ? 'mx-auto flex w-full max-w-lg flex-col gap-2'
      : medium
        ? 'mx-auto flex w-full max-w-xl flex-col gap-2.5'
        : 'mx-auto flex w-full max-w-lg flex-col gap-2',
    toolbar: dense
      ? 'rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm'
      : 'rounded-xl border border-slate-200 bg-white p-3 shadow-sm',
    toolbarRow: 'flex flex-wrap items-center justify-between gap-2',
    statBtn:
      'inline-flex items-center rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs font-bold text-red-800 shadow-sm transition hover:bg-red-100',
    progressTrack: 'mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100',
    progressFill: 'h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-300',
    quickNav: 'mt-2 flex flex-wrap gap-1',
    quickNavBtn:
      'rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800',
    quickNavBtnActive:
      'rounded-full border border-teal-500 bg-teal-600 px-2 py-0.5 text-[0.65rem] font-semibold text-white shadow-sm',
    scrubber: 'mt-2 h-1.5 w-full accent-teal-600',
    bookStage: 'perspective-[1000px]',
    bookWrap: 'relative mx-auto w-full transition-transform duration-500 ease-out',
    bookSpine:
      'pointer-events-none absolute -left-1.5 top-2 bottom-2 w-2 rounded-l-md bg-gradient-to-r from-amber-800/80 to-amber-700/40 shadow-inner',
    bookBody:
      'relative overflow-hidden rounded-r-xl rounded-l-sm border border-amber-200/90 bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100/80 p-1 shadow-lg shadow-amber-900/10',
    pageShell: dense
      ? 'relative max-h-[18rem] min-h-[9rem] overflow-hidden rounded-md border border-stone-200/80 bg-[#fffef8] shadow-inner'
      : medium
        ? 'relative max-h-[22rem] min-h-[11rem] overflow-hidden rounded-lg border border-stone-200/80 bg-[#fffef8] shadow-inner'
        : 'relative max-h-[18rem] min-h-[9rem] overflow-hidden rounded-md border border-stone-200/80 bg-[#fffef8] shadow-inner',
    pageInner: dense
      ? 'h-full max-h-[18rem] overflow-y-auto p-3 text-sm leading-snug'
      : medium
        ? 'h-full max-h-[22rem] overflow-y-auto p-3.5 text-sm leading-relaxed'
        : 'h-full max-h-[18rem] overflow-y-auto p-3 text-sm leading-snug',
    pageEnterRight: 'animate-[bookPageInRight_0.3s_ease-out]',
    pageEnterLeft: 'animate-[bookPageInLeft_0.3s_ease-out]',
    coverTitle: dense
      ? 'text-center text-sm font-bold uppercase tracking-wide text-teal-900'
      : 'text-center text-base font-bold uppercase tracking-wide text-teal-900',
    coverName: dense
      ? 'mt-3 text-center text-lg font-bold text-slate-900'
      : 'mt-4 text-center text-xl font-bold text-slate-900',
    coverMeta: dense ? 'mt-2 space-y-1 text-xs text-slate-700' : 'mt-3 space-y-1.5 text-sm text-slate-700',
    coverMinH: '',
    alertBox:
      'mt-3 rounded-lg border-2 border-red-500 bg-red-50 p-2.5 text-xs text-red-900 shadow-sm',
    alertTitle: 'text-[0.65rem] font-bold uppercase tracking-wider text-red-700',
    tocTitle: dense ? 'text-base font-bold text-slate-900' : 'text-lg font-bold text-slate-900',
    tocIntro: 'mt-0.5 text-xs text-slate-500',
    tocItem:
      'group flex w-full items-start gap-2 rounded-lg border border-transparent px-2 py-2 text-left text-xs transition hover:border-teal-200 hover:bg-teal-50/80',
    tocChapter: 'font-bold text-teal-800',
    tocHint: 'ml-auto text-[0.65rem] font-medium text-slate-400 group-hover:text-teal-600',
    chapterTitle: dense ? 'text-base font-bold text-teal-900' : 'text-lg font-bold text-teal-900',
    entryHeader: 'border-b border-stone-200 pb-2 text-xs font-semibold text-slate-800',
    fieldLabel: 'mt-2 text-[0.65rem] font-bold uppercase tracking-wide text-slate-500',
    fieldValue: 'mt-0.5 text-xs leading-relaxed text-slate-800 sm:text-sm',
    fieldCard: 'mt-1.5 rounded-md border border-slate-100 bg-slate-50/80 px-2.5 py-1.5',
    vitalsHighlight: 'text-sm font-semibold text-teal-900 sm:text-base',
    detailsSummary: 'cursor-pointer px-3 py-2 text-xs font-bold text-teal-900',
    detailsBody: 'space-y-1.5 border-t border-teal-100 px-3 py-2',
    statOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm',
    statPanel:
      'max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border-2 border-red-400 bg-white p-4 shadow-2xl',
    statTitle: 'text-base font-bold text-red-800',
    statSection: 'mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5',
    statSectionTitle: 'text-[0.65rem] font-bold uppercase tracking-wide text-slate-600',
    statList: 'mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-slate-800 sm:text-sm',
    navCluster: 'flex items-center gap-1.5',
    navBtn: dense
      ? 'rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40'
      : 'rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40',
    navBtnPrimary: dense
      ? 'rounded-md bg-teal-600 px-2 py-1 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-40'
      : 'rounded-md bg-teal-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-40',
    pageBadge:
      'rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-600 tabular-nums sm:text-xs',
    readOnlyBadge: 'rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-600',
    hint: 'text-center text-[0.65rem] text-slate-500 sm:text-xs',
    loadingWrap: dense ? 'py-8' : 'py-10',
    loadingSpinner: dense ? 'h-7 w-7' : 'h-8 w-8',
    gridGap: dense ? 'mt-2 grid gap-2 sm:grid-cols-2' : 'mt-3 grid gap-2 sm:grid-cols-2',
    tocBtn: dense ? `${lookup.btnPrimary} mt-3 w-full py-2 text-xs` : `${lookup.btnPrimary} mt-4 w-full py-2.5 text-sm`,
  };
}

const book = bookStyles({ compact: false, interactive: false });
function CoverPage({ page, onOpenContents, styles = book }) {
  return (
    <div className={`flex flex-col justify-between ${styles.coverMinH}`}>
      <div>
        <p className={styles.coverTitle}>{page.title}</p>
        <p className={styles.coverName}>{page.fullName}</p>
        <dl className={styles.coverMeta}>
          <div>
            <dt className="inline font-semibold">Patient ID: </dt>
            <dd className="inline font-mono">{page.patientId}</dd>
          </div>
          {page.nationalId !== '—' ? (
            <div>
              <dt className="inline font-semibold">National ID: </dt>
              <dd className="inline font-mono">{page.nationalId}</dd>
            </div>
          ) : null}
          <div>
            <dt className="inline font-semibold">Demographics: </dt>
            <dd className="inline">
              DOB {page.dateOfBirth}
              {page.age != null ? ` · Age ${page.age}` : ''}
              {' · '}
              {page.gender}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold">Emergency contact: </dt>
            <dd className="inline">
              {page.emergencyContact.name}
              {page.emergencyContact.relationship !== '—'
                ? ` (${page.emergencyContact.relationship})`
                : ''}
              {page.emergencyContact.phone !== '—' ? ` · ${page.emergencyContact.phone}` : ''}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold">Vitals on file: </dt>
            <dd className="inline">
              {page.vitalsCount ?? 0} capture{(page.vitalsCount ?? 0) !== 1 ? 's' : ''}
              {' · '}
              {page.visitCount ?? 0} visit{(page.visitCount ?? 0) !== 1 ? 's' : ''}
            </dd>
          </div>
        </dl>
      </div>

      {page.criticalAlerts?.length ? (
        <div className={styles.alertBox} role="alert">
          <p className={styles.alertTitle}>Critical alerts</p>
          <ul className="mt-2 space-y-2">
            {page.criticalAlerts.map((alert, idx) => (
              <li key={idx}>
                <span className="font-bold">{alert.type}: </span>
                {alert.text}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 text-center text-[0.65rem] text-slate-500">No critical alerts on file</p>
      )}

      {onOpenContents ? (
        <button type="button" className={styles.tocBtn} onClick={onOpenContents}>
          Open table of contents →
        </button>
      ) : null}
    </div>
  );
}

function TocPage({ page, onJump, chapterPageIndex, styles = book }) {
  return (
    <div>
      <h3 className={styles.tocTitle}>Table of contents</h3>
      <p className={styles.tocIntro}>
        Tap a chapter to jump. Individual vitals captures follow as pages (newest first).
      </p>
      <ul className="mt-2 space-y-0.5">
        {page.chapters.map((ch) => (
          <li key={ch.id}>
            <button type="button" className={styles.tocItem} onClick={() => onJump(ch.id)}>
              <span className={styles.tocChapter}>Chapter {ch.number}</span>
              <span className="text-slate-700">{ch.title}</span>
              {chapterPageIndex?.[ch.id] != null ? (
                <span className={styles.tocHint}>p. {chapterPageIndex[ch.id] + 1}</span>
              ) : null}
            </button>
          </li>
        ))}
        {chapterPageIndex?.vitalsTimeline != null ? (
          <li>
            <button type="button" className={styles.tocItem} onClick={() => onJump('vitals')}>
              <span className={styles.tocChapter}>Timeline</span>
              <span className="text-slate-700">Vitals capture pages</span>
              <span className={styles.tocHint}>p. {chapterPageIndex.vitalsTimeline + 1}+</span>
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function ChapterPage({ page, styles = book }) {
  return (
    <div>
      <h3 className={styles.chapterTitle}>{page.title}</h3>
      {page.sections.map((section) => (
        <div key={section.label}>
          <p className={styles.fieldLabel}>{section.label}</p>
          <ul className={`${styles.fieldValue} space-y-1.5`}>
            {section.items.map((item, idx) => (
              <li key={idx} className={styles.fieldCard}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function VitalsRecordPage({ page, styles = book }) {
  return (
    <article>
      <header className={styles.entryHeader}>
        Vitals captured
        {' · '}
        {page.recordedAt}
        <span className="mt-1 block font-mono text-xs font-normal text-slate-500">
          {page.visitNumber}
          {' · '}
          {page.visitType}
          {' · '}
          {page.visitStatus}
        </span>
      </header>

      <div className={styles.fieldCard}>
        <p className={styles.fieldLabel}>Vital signs</p>
        <p className={styles.vitalsHighlight}>{page.vitalsLine}</p>
      </div>

      <div className={styles.gridGap}>
        <div className={styles.fieldCard}>
          <p className={styles.fieldLabel}>Chief complaint</p>
          <p className={styles.fieldValue}>{page.chiefComplaint}</p>
        </div>
        <div className={styles.fieldCard}>
          <p className={styles.fieldLabel}>Allergies</p>
          <p className={styles.fieldValue}>{page.allergies}</p>
        </div>
        <div className={styles.fieldCard}>
          <p className={styles.fieldLabel}>Current medications</p>
          <p className={styles.fieldValue}>{page.currentMedications}</p>
        </div>
        <div className={styles.fieldCard}>
          <p className={styles.fieldLabel}>Immunization status</p>
          <p className={styles.fieldValue}>{page.immunizationStatus}</p>
        </div>
      </div>

      <div className={styles.fieldCard}>
        <p className={styles.fieldLabel}>Physical examination</p>
        <p className={styles.fieldValue}>{page.clinicalNotes}</p>
      </div>

      <div className={styles.fieldCard}>
        <p className={styles.fieldLabel}>Social history</p>
        <p className={styles.fieldValue}>{page.socialHistory}</p>
      </div>

      {page.clinicalSections?.length ? (
        <details className="mt-2 rounded-lg border border-teal-100 bg-teal-50/40 open:shadow-sm">
          <summary className={styles.detailsSummary}>
            Complete vitals record ({page.clinicalSections.length} fields)
          </summary>
          <div className={styles.detailsBody}>
            {page.clinicalSections.map((section, idx) => (
              <div key={idx} className={styles.fieldCard}>
                <p className={styles.fieldLabel}>{section.label}</p>
                <p className={`${styles.fieldValue} whitespace-pre-wrap`}>{section.value}</p>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </article>
  );
}

function StatSummaryModal({ summary, onClose, styles = book }) {
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

function pageKindLabel(page) {
  if (!page) return 'Page';
  switch (page.kind) {
    case 'cover': return 'Cover';
    case 'toc': return 'Contents';
    case 'chapter': return 'Chapter';
    case 'vitals': return 'Vitals';
    case 'stop':
    case 'timeline': return 'Vitals';
    default: return 'Page';
  }
}

function renderPage(page, handlers, styles = book) {
  switch (page.kind) {
    case 'cover':
      return <CoverPage page={page} onOpenContents={handlers?.onOpenContents} styles={styles} />;
    case 'toc':
      return (
        <TocPage
          page={page}
          onJump={page._onJump}
          chapterPageIndex={handlers?.chapterPageIndex}
          styles={styles}
        />
      );
    case 'chapter':
      return <ChapterPage page={page} styles={styles} />;
    case 'vitals':
      return <VitalsRecordPage page={page} styles={styles} />;
    case 'stop':
    case 'timeline':
      return <VitalsRecordPage page={page} styles={styles} />;
    default:
      return null;
  }
}

export default function MedicalHistoryBook({
  patient,
  history,
  loading,
  error,
  showStatSummaryButton = true,
  compact = false,
  interactive = false,
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const [statOpen, setStatOpen] = useState(false);
  const [flipDir, setFlipDir] = useState('right');

  const bookModel = useMemo(() => {
    if (!patient || !history) return null;
    return buildBookPages(patient, history);
  }, [patient, history]);

  const pages = bookModel?.pages || [];
  const totalPages = pages.length;
  const progress = totalPages > 1 ? (pageIndex / (totalPages - 1)) * 100 : 100;

  const goToPage = useCallback((index, direction = 'right') => {
    setFlipDir(direction);
    setPageIndex(Math.max(0, Math.min(index, totalPages - 1)));
  }, [totalPages]);

  const goToChapter = useCallback(
    (chapterId) => {
      if (chapterId === 'vitals' && bookModel?.chapterPageIndex?.vitalsTimeline != null) {
        goToPage(bookModel.chapterPageIndex.vitalsTimeline, 'right');
        return;
      }
      const idx = bookModel?.chapterPageIndex?.[chapterId];
      if (idx != null) goToPage(idx, 'right');
    },
    [bookModel, goToPage]
  );

  const goPrev = useCallback(() => {
    goToPage(pageIndex - 1, 'left');
  }, [goToPage, pageIndex]);

  const goNext = useCallback(() => {
    goToPage(pageIndex + 1, 'right');
  }, [goToPage, pageIndex]);

  useEffect(() => {
    setPageIndex(0);
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

  if (loading) {
    const loadStyles = bookStyles({ compact, interactive });
    return (
      <div className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white shadow-sm ${loadStyles.loadingWrap}`}>
        <div className={`${loadStyles.loadingSpinner} animate-spin rounded-full border-2 border-teal-600 border-t-transparent`} />
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

  if (!bookModel || !totalPages) {
    return <p className="text-sm text-slate-500">No medical history on file for this patient.</p>;
  }

  const styles = bookStyles({ compact, interactive });
  const showInteractiveChrome = interactive && !compact;

  const currentPage = { ...pages[pageIndex] };
  if (currentPage.kind === 'toc') {
    currentPage._onJump = goToChapter;
  }

  const pageLabel = `${pageKindLabel(currentPage)} · ${pageIndex + 1} / ${totalPages}`;
  const animClass = flipDir === 'left' ? styles.pageEnterLeft : styles.pageEnterRight;

  const quickLinks = [
    { label: 'Cover', index: 0 },
    { label: 'Contents', index: 1 },
    ...BOOK_CHAPTERS.map((ch) => ({
      label: `Ch.${ch.number}`,
      index: bookModel.chapterPageIndex?.[ch.id],
    })).filter((l) => l.index != null),
  ];

  if (bookModel.chapterPageIndex?.vitalsTimeline != null) {
    quickLinks.push({ label: 'Vitals', index: bookModel.chapterPageIndex.vitalsTimeline });
  }

  return (
    <>
      <style>{`
        @keyframes bookPageInRight {
          from { opacity: 0; transform: translateX(24px) rotateY(-6deg); }
          to { opacity: 1; transform: translateX(0) rotateY(0); }
        }
        @keyframes bookPageInLeft {
          from { opacity: 0; transform: translateX(-24px) rotateY(6deg); }
          to { opacity: 1; transform: translateX(0) rotateY(0); }
        }
      `}</style>

      <div className={styles.shell}>
        <div className={showInteractiveChrome ? styles.toolbar : 'mb-2 flex flex-wrap items-center justify-between gap-2'}>
          <div className={showInteractiveChrome ? styles.toolbarRow : 'flex flex-wrap items-center gap-2'}>
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
                disabled={pageIndex === 0}
              >
                ← Prev
              </button>
              <span className={styles.pageBadge}>{pageLabel}</span>
              <button
                type="button"
                className={styles.navBtnPrimary}
                onClick={goNext}
                disabled={pageIndex >= totalPages - 1}
              >
                Next →
              </button>
            </div>
          </div>

          {showInteractiveChrome ? (
            <>
              <div className={styles.progressTrack} aria-hidden>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <div className={styles.quickNav} role="navigation" aria-label="Quick page navigation">
                {quickLinks.map((link) => (
                  <button
                    key={`${link.label}-${link.index}`}
                    type="button"
                    className={pageIndex === link.index ? styles.quickNavBtnActive : styles.quickNavBtn}
                    onClick={() => goToPage(link.index, link.index > pageIndex ? 'right' : 'left')}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                className={styles.scrubber}
                min={0}
                max={Math.max(0, totalPages - 1)}
                value={pageIndex}
                aria-label="Jump to page"
                onChange={(e) => goToPage(Number(e.target.value), Number(e.target.value) > pageIndex ? 'right' : 'left')}
              />
            </>
          ) : null}
        </div>

        <div className={showInteractiveChrome ? styles.bookStage : undefined}>
          <div className={showInteractiveChrome ? styles.bookWrap : undefined}>
            <div className={styles.bookBody} aria-label="Medical history book">
              {showInteractiveChrome ? <div className={styles.bookSpine} aria-hidden /> : null}
              <div className={styles.pageShell}>
                <div key={pageIndex} className={`${styles.pageInner} ${animClass}`}>
                  {renderPage(currentPage, {
                    onOpenContents: () => goToPage(1, 'right'),
                    chapterPageIndex: bookModel.chapterPageIndex,
                  }, styles)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className={styles.hint}>
          {showInteractiveChrome
            ? 'Flip with Prev/Next, arrow keys, the slider, or tap a chapter.'
            : 'Use arrow keys or Prev/Next to browse vitals.'}
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
