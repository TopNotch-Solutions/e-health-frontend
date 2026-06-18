import { APP_BRAND_SHORT, APP_BRAND_TAGLINE } from './brandConstants';

function BrandMark({ className = '' }) {
  return (
    <div
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 shadow-md shadow-teal-600/25 ring-1 ring-white/20 ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
      <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M12 6v12M8 10h8M8 14h8" />
        <circle cx="12" cy="12" r="9" strokeWidth="1.8" className="opacity-90" />
      </svg>
    </div>
  );
}

/**
 * Modern E-Health product mark for topbars, auth hero, and shells.
 * @param {'default' | 'light' | 'compact'} variant
 */
export default function AppBrand({ variant = 'default', className = '', showTagline = true }) {
  const isLight = variant === 'light';
  const isCompact = variant === 'compact';

  const titleClass = isLight
    ? 'text-lg font-bold tracking-tight text-white sm:text-xl'
    : 'bg-gradient-to-r from-slate-900 via-teal-800 to-teal-600 bg-clip-text text-lg font-bold tracking-tight text-transparent sm:text-xl';

  const taglineClass = isLight
    ? 'text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-teal-100/85'
    : 'text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-400';

  return (
    <div className={`flex min-w-0 items-center gap-2.5 sm:gap-3 ${className}`} aria-label={`${APP_BRAND_SHORT} ${APP_BRAND_TAGLINE}`}>
      <BrandMark className={isCompact ? 'h-8 w-8 rounded-lg' : ''} />
      <div className="flex min-w-0 flex-col leading-tight">
        <span className={titleClass}>{APP_BRAND_SHORT}</span>
        {showTagline && !isCompact ? (
          <span className={taglineClass}>{APP_BRAND_TAGLINE}</span>
        ) : null}
      </div>
    </div>
  );
}
