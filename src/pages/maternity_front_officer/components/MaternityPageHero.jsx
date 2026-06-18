import { lookup } from '../../front_office/styles/lookupClasses';
import { lookupSteps } from '../../front_office/utils/lookupUtils';

export default function MaternityPageHero({ phase, now = new Date() }) {
  const steps = lookupSteps(phase);
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <header className={lookup.hero}>
      <div className={lookup.heroInner}>
        <p className={lookup.heroKicker}>Maternity front office</p>
        <h1 className={lookup.heroTitle}>Find patient record</h1>
        <p className={lookup.heroMeta}>
          {dateStr} · {timeStr}
        </p>
        <p className="mt-2 max-w-2xl text-sm text-teal-100/80">
          Search by National ID or date of birth with full name. Register new maternity patients when
          no match exists, then route to ANC (outpatient) or ANW (ward admission).
        </p>
        <div className={lookup.heroSteps} aria-label="Lookup progress">
          {steps.map((step) => (
            <span
              key={step.id}
              className={`${lookup.stepPill} ${
                step.active ? lookup.stepActive : step.done ? lookup.stepDone : lookup.stepPending
              }`}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
