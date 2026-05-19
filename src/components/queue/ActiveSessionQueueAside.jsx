/**
 * Shown in the queue sidebar while the clinician has an in-progress patient.
 */
export default function ActiveSessionQueueAside({
  classes: c,
  badge,
  title,
  message,
  patientName,
  patientMeta,
  patientIdLabel,
}) {
  return (
    <div className={c.queueActivePanel} role="status" aria-live="polite">
      <span className={c.queueActiveBadge}>{badge}</span>
      <h3 className={c.queueActiveTitle}>{title}</h3>
      <p className={c.queueActiveText}>{message}</p>
      {/* {patientName ? (
        <div className={c.queueActivePatient}>
          <p className={c.queueActivePatientName}>{patientName}</p>
          {patientMeta ? <p className={c.queueActivePatientMeta}>{patientMeta}</p> : null}
          {patientIdLabel ? <p className={c.queueActivePatientMeta}>{patientIdLabel}</p> : null}
        </div>
      ) : null} */}
    </div>
  );
}
