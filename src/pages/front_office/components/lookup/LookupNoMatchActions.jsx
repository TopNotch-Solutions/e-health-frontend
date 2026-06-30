import { fo } from '../../styles/frontOfficeModuleClasses';

export default function LookupNoMatchActions({ onRegisterNew, onEmergency, emergencyLoading }) {
  return (
    <section className={fo.actionGrid} aria-label="No match actions">
      <button type="button" className={fo.actionCard} onClick={onRegisterNew}>
        <div className={`${fo.actionIcon} ${fo.actionIconBrand}`} aria-hidden>
          +
        </div>
        <h3 className={fo.actionTitle}>Register new patient</h3>
        <p className={fo.actionText}>
          No match in the register. Continue with the 4-step registration workflow.
        </p>
      </button>
      {onEmergency ? (
        <button
          type="button"
          className={fo.actionCardEmergency}
          disabled={emergencyLoading}
          onClick={onEmergency}
        >
          <div className={`${fo.actionIcon} ${fo.actionIconDanger}`} aria-hidden>
            !
          </div>
          <h3 className={fo.actionTitleEmergency}>Unknown patient (emergency)</h3>
          <p className={fo.actionTextEmergency}>
            One-click unknown patient — emergency priority at the top of the nurse queue.
          </p>
        </button>
      ) : null}
    </section>
  );
}
