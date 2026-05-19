import { Fragment } from 'react';
import { fo } from './styles/frontOfficeModuleClasses';

const STEPS = [
  { n: 1, label: 'Personal' },
  { n: 2, label: 'Medical' },
  { n: 3, label: 'Contact detail' },
  { n: 4, label: 'Review' },
];

export default function RegistrationStepper({ activeStep }) {
  return (
    <div className={fo.stepper} role="list">
      {STEPS.map((step, i) => {
        const isActive = step.n === activeStep;
        const isDone = step.n < activeStep;
        const numClass = isActive
          ? fo.stepNumActive
          : isDone
            ? fo.stepNumDone
            : fo.stepNumPending;
        const labelClass = isActive
          ? fo.stepLabelActive
          : isDone
            ? fo.stepLabelDone
            : fo.stepLabel;

        return (
          <Fragment key={step.n}>
            {i > 0 ? <div className={fo.stepLine} aria-hidden /> : null}
            <div role="listitem" className={fo.stepItem}>
              <span className={`${fo.stepNum} ${numClass}`}>{step.n}</span>
              <span className={labelClass}>{step.label}</span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
