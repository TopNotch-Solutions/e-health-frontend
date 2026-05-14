import { Fragment } from 'react';

const STEPS = [
  { n: 1, label: 'Personal' },
  { n: 2, label: 'Medical' },
  { n: 3, label: 'Insurance' },
  { n: 4, label: 'Review' },
];

export default function RegistrationStepper({ activeStep }) {
  return (
    <div className="fo-stepper" role="list">
      {STEPS.map((step, i) => (
        <Fragment key={step.n}>
          {i > 0 ? <div className="fo-step-line" aria-hidden /> : null}
          <div
            role="listitem"
            className={`fo-step ${step.n === activeStep ? 'fo-step-active' : ''} ${
              step.n < activeStep ? 'fo-step-done' : ''
            }`}
          >
            <span className="fo-step-num">{step.n}</span>
            <span className="fo-step-label">{step.label}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
