import { IntakeInput, IntakeSelect, IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';

export default function HospitalOutpatientVitalsForm({
  config,
  form,
  fieldErrors,
  onFieldChange,
  idPrefix = 'ho',
}) {
  const err = (key) => fieldErrors[key];

  if (!config) return null;

  return (
    <section className={c.sectionPanel} aria-labelledby={`${idPrefix}-vitals-heading`}>
      <h3 id={`${idPrefix}-vitals-heading`} className={c.sectionTitle}>
        {config.vitalsTitle}
      </h3>
      <p className="mt-1 text-sm text-slate-600">{config.vitalsHint}</p>

      <div className={`${c.vitalsGrid} mt-4`}>
        {config.fields.map((field) => {
          if (field.type === 'select') {
            return (
              <IntakeSelect
                key={field.key}
                id={`${idPrefix}-${field.key}`}
                label={field.label}
                required
                error={err(field.key)}
                className={c.input}
                value={form[field.key]}
                onChange={(e) => onFieldChange(field.key, e.target.value)}
              >
                {(field.options || []).map((option) => (
                  <option key={option.value || 'placeholder'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </IntakeSelect>
            );
          }

          return (
            <IntakeInput
              key={field.key}
              id={`${idPrefix}-${field.key}`}
              label={field.label}
              required
              error={err(field.key)}
              className={c.input}
              inputMode={field.inputMode}
              placeholder={field.placeholder}
              value={form[field.key]}
              onChange={(e) => onFieldChange(field.key, e.target.value)}
            />
          );
        })}
      </div>

      {config.showCritical !== false ? (
      <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="mt-0.5 rounded border-slate-300"
          checked={form.is_critical}
          onChange={(e) => onFieldChange('is_critical', e.target.checked)}
        />
        <span>
          <strong className="text-slate-900">Critical patient</strong>
          <span className="block text-slate-600">{config.criticalHint}</span>
        </span>
      </label>
      ) : null}

      <div className="mt-4">
        <IntakeTextarea
          id={`${idPrefix}-notes`}
          label="Clinical notes (optional)"
          className={c.textarea}
          rows={3}
          value={form.notes}
          onChange={(e) => onFieldChange('notes', e.target.value)}
        />
      </div>
    </section>
  );
}
