import { fo } from '../../front_office/styles/frontOfficeModuleClasses';

export default function MaternityNoMatchActions({ onRegisterNew }) {
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
    </section>
  );
}
