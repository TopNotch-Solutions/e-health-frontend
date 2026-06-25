import { IntakeInput, IntakeSelect } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import { PARAMETER_NURSE_CLASSIFICATIONS } from '../parameterNurseForm';

export default function ParameterNurseVitalsForm({
  form,
  fieldErrors,
  onFieldChange,
  onClassificationChange,
  classifications = PARAMETER_NURSE_CLASSIFICATIONS,
}) {
  const destinations = form.visit_classification
    ? classifications[form.visit_classification]?.destinations || []
    : [];

  const err = (key) => fieldErrors[key];

  return (
    <div className="space-y-4">
      <section className={c.sectionPanel} aria-labelledby="pn-classification-heading">
        <h3 id="pn-classification-heading" className={c.sectionTitle}>
          Visit classification
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Follow-Up: BP and pulse only. Sick: temperature, BP, and saturation.
        </p>
        <div className="mt-4">
          <IntakeSelect
            id="pn-classification"
            label="Visit type"
            error={err('visit_classification')}
            className={c.select}
            value={form.visit_classification}
            onChange={(e) => onClassificationChange(e.target.value)}
          >
            <option value="">Select visit type…</option>
            <option value="follow_up">Follow-Up — route to Master Doctor or Pharmacy</option>
            <option value="sick">Sick — route to Screening Nurse or Emergency Unit</option>
          </IntakeSelect>
        </div>
      </section>

      {form.visit_classification ? (
        <section className={c.sectionPanel} aria-labelledby="pn-vitals-heading">
          <h3 id="pn-vitals-heading" className={c.sectionTitle}>
            Vital signs
          </h3>
          <div className={c.vitalsGrid}>
            {form.visit_classification === 'sick' ? (
              <IntakeInput
                id="pn-temp"
                label="Temperature"
                error={err('temperature')}
                className={c.input}
                inputMode="decimal"
                placeholder="°C"
                value={form.temperature}
                onChange={(e) => onFieldChange('temperature', e.target.value)}
              />
            ) : null}
            <IntakeInput
              id="pn-bp-sys"
              label="Blood pressure (systolic)"
              error={err('blood_pressure_systolic')}
              className={c.input}
              inputMode="numeric"
              placeholder="mmHg"
              value={form.blood_pressure_systolic}
              onChange={(e) => onFieldChange('blood_pressure_systolic', e.target.value)}
            />
            <IntakeInput
              id="pn-bp-dia"
              label="Blood pressure (diastolic)"
              error={err('blood_pressure_diastolic')}
              className={c.input}
              inputMode="numeric"
              placeholder="mmHg"
              value={form.blood_pressure_diastolic}
              onChange={(e) => onFieldChange('blood_pressure_diastolic', e.target.value)}
            />
            {form.visit_classification === 'follow_up' ? (
              <IntakeInput
                id="pn-pulse"
                label="Heart rate"
                error={err('pulse_rate')}
                className={c.input}
                inputMode="numeric"
                placeholder="BPM"
                value={form.pulse_rate}
                onChange={(e) => onFieldChange('pulse_rate', e.target.value)}
              />
            ) : null}
            {form.visit_classification === 'sick' ? (
              <IntakeInput
                id="pn-spo2"
                label="Oxygen saturation (SpO₂)"
                error={err('oxygen_saturation')}
                className={c.input}
                inputMode="decimal"
                placeholder="%"
                value={form.oxygen_saturation}
                onChange={(e) => onFieldChange('oxygen_saturation', e.target.value)}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {form.visit_classification ? (
        <section className={c.sectionPanel} aria-labelledby="pn-routing-heading">
          <h3 id="pn-routing-heading" className={c.sectionTitle}>
            Routing
          </h3>
          <IntakeSelect
            id="pn-routing"
            label="Destination queue"
            error={err('routing_destination')}
            className={c.select}
            value={form.routing_destination}
            onChange={(e) => onFieldChange('routing_destination', e.target.value)}
          >
            <option value="">Select destination…</option>
            {destinations.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </IntakeSelect>
        </section>
      ) : null}
    </div>
  );
}
