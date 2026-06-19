function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function patientInitials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

/**
 * Modern queue sidebar card — entire surface is a button (click to open / resume).
 */
export default function QueueEntryCard({
  classes: c,
  name,
  meta,
  idLabel,
  subtitle,
  badge,
  active = false,
  locked = false,
  emergency = false,
  completed = false,
  disabled = false,
  onClick,
  openLabel = 'Click to open',
  activeLabel = 'Selected — open',
  lockedLabel = 'Locked by another clinician',
  completedLabel = 'Completed',
}) {
  const isDisabled = disabled || locked || completed;
  const footerLabel = completed
    ? completedLabel
    : locked
      ? lockedLabel
      : active
        ? activeLabel
        : openLabel;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={[
        c.queueCard,
        active ? c.queueCardActive : '',
        locked ? c.queueCardLocked : '',
        emergency && !completed ? c.queueCardEmergency : '',
        completed ? c.queueCardCompleted : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-pressed={active}
      aria-label={isDisabled ? `${name} — ${footerLabel}` : `Open ${name}`}
    >
      <div className={c.queueCardInner}>
        <div
          className={[
            c.queueCardAvatar,
            emergency && !completed ? c.queueCardAvatarEmergency : '',
            active ? c.queueCardAvatarActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden
        >
          {patientInitials(name)}
        </div>

        <div className={c.queueCardBody}>
          {badge ? <div className={c.queueCardBadgeRow}>{badge}</div> : null}
          <p className={c.queueName}>{name}</p>
          {meta ? <p className={c.queueMeta}>{meta}</p> : null}
          {idLabel ? <p className={c.queueId}>{idLabel}</p> : null}
          {subtitle ? <p className={c.queueCardSubtitle}>{subtitle}</p> : null}
          <p
            className={[
              c.queueCardFooter,
              isDisabled ? c.queueCardFooterMuted : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span>{footerLabel}</span>
            {!isDisabled ? <span className={c.queueCardChevron}><ChevronIcon /></span> : null}
          </p>
        </div>
      </div>
    </button>
  );
}
