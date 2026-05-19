import { nurse as c } from '../styles/nurseClasses';

function controlClass(base, hasError, readOnly) {
  if (readOnly) return `${base} ${c.readOnlyInput}`;
  return hasError ? `${base} ${c.inputError}` : base;
}

export function IntakeField({
  id,
  label,
  error,
  required = true,
  showRequiredMark = true,
  children,
}) {
  return (
    <div className={c.field}>
      <label htmlFor={id} className={c.label}>
        {label}
        {required && showRequiredMark ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className={c.fieldError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function IntakeInput({
  id,
  label,
  error,
  value,
  onChange,
  className,
  readOnly = false,
  required = true,
  showRequiredMark = true,
  ...props
}) {
  return (
    <IntakeField
      id={id}
      label={label}
      error={error}
      required={required}
      showRequiredMark={showRequiredMark}
    >
      <input
        id={id}
        className={controlClass(className, error, readOnly)}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        disabled={readOnly}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
    </IntakeField>
  );
}

export function IntakeTextarea({
  id,
  label,
  error,
  value,
  onChange,
  className,
  readOnly = false,
  required = true,
  showRequiredMark = true,
  ...props
}) {
  return (
    <IntakeField
      id={id}
      label={label}
      error={error}
      required={required}
      showRequiredMark={showRequiredMark}
    >
      <textarea
        id={id}
        className={controlClass(className, error, readOnly)}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        disabled={readOnly}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
    </IntakeField>
  );
}

export function IntakeSelect({
  id,
  label,
  error,
  value,
  onChange,
  className,
  children,
  readOnly = false,
  required = true,
  showRequiredMark = true,
  ...props
}) {
  return (
    <IntakeField
      id={id}
      label={label}
      error={error}
      required={required}
      showRequiredMark={showRequiredMark}
    >
      <select
        id={id}
        className={controlClass(className, error, readOnly)}
        value={value}
        onChange={onChange}
        disabled={readOnly}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {children}
      </select>
    </IntakeField>
  );
}
