import { IntakeInput, IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';

export default function EmergencyUnitNurseIntakeForm({ form, fieldErrors, onFieldChange }) {
  const err = (key) => fieldErrors[key];

  return (
    <div className="space-y-4">
      <section className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Parameter nurse — vitals</h3>
        <p className="mt-1 text-sm text-slate-500">
          Emergency unit visits are always classified as Sick. Record temperature, blood pressure, and SpO₂.
        </p>
        <div className={`${c.vitalsGrid} mt-4`}>
          <IntakeInput
            id="eu-temp"
            label="Temperature"
            error={err('temperature')}
            className={c.input}
            inputMode="decimal"
            placeholder="°C"
            value={form.temperature}
            onChange={(e) => onFieldChange('temperature', e.target.value)}
          />
          <IntakeInput
            id="eu-bp-sys"
            label="Blood pressure (systolic)"
            error={err('blood_pressure_systolic')}
            className={c.input}
            inputMode="numeric"
            placeholder="mmHg"
            value={form.blood_pressure_systolic}
            onChange={(e) => onFieldChange('blood_pressure_systolic', e.target.value)}
          />
          <IntakeInput
            id="eu-bp-dia"
            label="Blood pressure (diastolic)"
            error={err('blood_pressure_diastolic')}
            className={c.input}
            inputMode="numeric"
            placeholder="mmHg"
            value={form.blood_pressure_diastolic}
            onChange={(e) => onFieldChange('blood_pressure_diastolic', e.target.value)}
          />
          <IntakeInput
            id="eu-spo2"
            label="Oxygen saturation (SpO₂)"
            error={err('oxygen_saturation')}
            className={c.input}
            inputMode="decimal"
            placeholder="%"
            value={form.oxygen_saturation}
            onChange={(e) => onFieldChange('oxygen_saturation', e.target.value)}
          />
        </div>
      </section>

      <section className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Clinical assessment</h3>
        <p className="mt-1 text-sm text-slate-500">
          Document symptoms, reason for visit, and screening impression.
        </p>
        <div className="mt-4 space-y-4">
          <IntakeTextarea
            id="eu-symptoms"
            label="Present symptoms"
            error={err('symptoms')}
            className={c.textarea}
            rows={3}
            value={form.symptoms}
            onChange={(e) => onFieldChange('symptoms', e.target.value)}
          />
          <IntakeTextarea
            id="eu-reason"
            label="Reason for visitation"
            error={err('reason')}
            className={c.textarea}
            rows={3}
            value={form.reason}
            onChange={(e) => onFieldChange('reason', e.target.value)}
          />
          <IntakeTextarea
            id="eu-diagnosis"
            label="Clinical diagnosis (screening impression)"
            error={err('diagnosis')}
            className={c.textarea}
            rows={3}
            value={form.diagnosis}
            onChange={(e) => onFieldChange('diagnosis', e.target.value)}
          />
        </div>
      </section>
    </div>
  );
}
