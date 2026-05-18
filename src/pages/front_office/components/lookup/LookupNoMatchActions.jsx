import { lookup } from '../../styles/lookupClasses';

export default function LookupNoMatchActions({ onRegisterNew, onEmergency, emergencyLoading }) {
  return (
    <section className={lookup.actionGrid} aria-label="No match actions">
      <button type="button" className={lookup.actionCard} onClick={onRegisterNew}>
        <div className={`${lookup.actionIcon} ${lookup.actionIconBrand}`} aria-hidden>
          +
        </div>
        <h3 className="font-bold text-slate-900">Register new patient</h3>
        <p className="mt-1 text-sm text-slate-600">
          No match in the register. Continue with the 4-step registration workflow.
        </p>
      </button>
      <button
        type="button"
        className={lookup.actionCardDanger}
        disabled={emergencyLoading}
        onClick={onEmergency}
      >
        <div className={`${lookup.actionIcon} ${lookup.actionIconDanger}`} aria-hidden>
          !
        </div>
        <h3 className="font-bold text-slate-900">Unknown patient (emergency)</h3>
        <p className="mt-1 text-sm text-slate-600">One-click emergency registration — doctor queue.</p>
      </button>
    </section>
  );
}
