import { nurse as c, topbar } from '../../nurse/styles/nurseClasses';
import TopbarSignOutButton from '../../../components/TopbarSignOutButton';
import AppBrand from '../../../components/brand/AppBrand';

export function MaternityTopbar({ title, nurseLabel, initials, live }) {
  return (
    <header className={`${topbar.root} shrink-0`}>
      <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <AppBrand className={topbar.brand} />
        <span className="text-sm font-medium text-slate-500">{title}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <span className="hidden items-center gap-1.5 text-xs font-medium text-slate-500 sm:inline-flex">
          <span className={live ? c.liveDot : c.liveDotOff} />
          {live ? 'Live' : 'Connecting…'}
        </span>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white" aria-hidden>
            {initials}
          </span>
          <span className="max-w-[140px] truncate text-sm font-semibold text-slate-700 sm:max-w-none">{nurseLabel}</span>
        </div>
        <TopbarSignOutButton moduleLabel={title} className={topbar.signOut} />
      </div>
    </header>
  );
}

function Field({ label, id, children, error }) {
  return (
    <div className={c.field}>
      <label htmlFor={id} className={c.label}>{label}</label>
      {children}
      {error ? <p className={c.fieldError} role="alert">{error}</p> : null}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-teal-800">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function toBaselineListItems(value) {
  if (Array.isArray(value)) return value;
  if (value) return [value];
  return [''];
}

function BaselineListField({
  label,
  hint,
  fieldKey,
  items,
  onChange,
  addLabel,
  firstInputId,
  placeholders = [],
  removeAriaPrefix,
}) {
  function updateItem(index, value) {
    const next = [...items];
    next[index] = value;
    onChange(fieldKey, next);
  }

  function addItem() {
    onChange(fieldKey, [...items, '']);
  }

  function removeItem(index) {
    if (items.length <= 1) {
      onChange(fieldKey, ['']);
      return;
    }
    onChange(fieldKey, items.filter((_, i) => i !== index));
  }

  return (
    <div className={c.field}>
      <span className={c.label}>{label}</span>
      {hint ? <p className="mb-2 text-xs text-slate-500">{hint}</p> : null}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${fieldKey}-${index}`} className="flex gap-2">
            <input
              id={index === 0 ? firstInputId : undefined}
              className={c.input}
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholders[index] || placeholders[placeholders.length - 1] || ''}
            />
            <button
              type="button"
              className={`${c.btnSecondary} shrink-0 px-3`}
              onClick={() => removeItem(index)}
              aria-label={`Remove ${removeAriaPrefix} item ${index + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={`${c.btnSecondary} mt-2`} onClick={addItem}>
        {addLabel}
      </button>
    </div>
  );
}

export function FrontOfficeForm({ form, onChange, config, onSubmit, loading }) {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Register new patient">
        <Field label="First name *" id="mfo-first">
          <input id="mfo-first" className={c.input} required value={form.first_name} onChange={(e) => onChange('first_name', e.target.value)} />
        </Field>
        <Field label="Last name *" id="mfo-last">
          <input id="mfo-last" className={c.input} required value={form.last_name} onChange={(e) => onChange('last_name', e.target.value)} />
        </Field>
        <Field label="Payment type" id="mfo-pay">
          <select id="mfo-pay" className={c.input} value={form.payment_type} onChange={(e) => onChange('payment_type', e.target.value)}>
            <option value="state">State</option>
            <option value="private">Private</option>
          </select>
        </Field>
        <Field label="Phone" id="mfo-phone">
          <input id="mfo-phone" className={c.input} value={form.phone} onChange={(e) => onChange('phone', e.target.value)} />
        </Field>
      </Section>
      <Section title="Route patient">
        <Field label="Destination *" id="mfo-route">
          <select id="mfo-route" className={c.input} required value={form.routing_destination} onChange={(e) => onChange('routing_destination', e.target.value)}>
            <option value="maternity_anc">ANC Queue</option>
            <option value="maternity_anw">ANW Queue</option>
          </select>
        </Field>
      </Section>
      <button type="button" className={c.btnComplete} disabled={loading} onClick={onSubmit}>
        Register &amp; route patient
      </button>
    </div>
  );
}

export function AncForm({
  form,
  onChange,
  onSubmit,
  loading,
  ancContext,
  stateHospitals = [],
  stateHospitalsLoading = false,
  stateHospitalsError = '',
}) {
  const isFirstVisit = ancContext?.is_first_visit === true;
  const hivOnRecord = Boolean(ancContext?.hiv_positive_on_record);
  const hasLegacyPlaceOfDelivery = Boolean(
    form.place_of_delivery
    && !stateHospitals.some((facility) => facility.label === form.place_of_delivery)
  );

  return (
    <div className="flex flex-col gap-4">
      {ancContext == null ? (
        <p className="text-sm text-slate-500">Loading ANC visit context…</p>
      ) : null}
      {isFirstVisit ? (
        <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          <strong>First ANC visit of this pregnancy</strong> — capture baseline obstetric, gynae, and past medical history.
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Returning ANC visit for this pregnancy. Baseline history was captured on the first visit.
        </div>
      )}

      {isFirstVisit ? (
        <Section title="Baseline history (first visit only)">
          <div className="sm:col-span-2">
            <BaselineListField
              label="Obstetric history *"
              hint="Add each pregnancy, outcome, or obstetric detail separately."
              fieldKey="baseline_obstetric"
              items={toBaselineListItems(form.baseline_obstetric)}
              onChange={onChange}
              addLabel="Add obstetric history"
              firstInputId="anc-obstetric"
              removeAriaPrefix="obstetric history"
              placeholders={['G4P2', 'Previous C-section 2022', 'Miscarriage 2020']}
            />
          </div>
          <div className="sm:col-span-2">
            <BaselineListField
              label="Gynae history *"
              hint="Add menstrual history, contraception, or gynaecological conditions separately."
              fieldKey="baseline_gynae"
              items={toBaselineListItems(form.baseline_gynae)}
              onChange={onChange}
              addLabel="Add gynae history"
              firstInputId="anc-gynae"
              removeAriaPrefix="gynae history"
              placeholders={['Regular 28-day cycle', 'Oral contraceptive use', 'Fibroids']}
            />
          </div>
          <div className="sm:col-span-2">
            <BaselineListField
              label="Past medical history *"
              hint="Add each condition, allergy, surgery, or diagnosis separately."
              fieldKey="baseline_past_medical"
              items={toBaselineListItems(form.baseline_past_medical)}
              onChange={onChange}
              addLabel="Add past medical history"
              firstInputId="anc-past-med"
              removeAriaPrefix="past medical history"
              placeholders={['Hypertension', 'Penicillin allergy', 'Appendectomy 2019']}
            />
          </div>
        </Section>
      ) : null}

      <Section title="General physical examination">
        <Field label="Blood pressure" id="anc-bp">
          <input id="anc-bp" className={c.input} value={form.bp} onChange={(e) => onChange('bp', e.target.value)} placeholder="e.g. 120/80" />
        </Field>
        <Field label="Pulse" id="anc-pulse">
          <input id="anc-pulse" className={c.input} value={form.pulse} onChange={(e) => onChange('pulse', e.target.value)} />
        </Field>
        <Field label="Temperature" id="anc-temp">
          <input id="anc-temp" className={c.input} value={form.temperature} onChange={(e) => onChange('temperature', e.target.value)} />
        </Field>
        <Field label="Saturation" id="anc-sat">
          <input id="anc-sat" className={c.input} value={form.saturation} onChange={(e) => onChange('saturation', e.target.value)} placeholder="SpO₂ %" />
        </Field>
        <Field label="Weight" id="anc-weight">
          <input id="anc-weight" className={c.input} value={form.weight} onChange={(e) => onChange('weight', e.target.value)} />
        </Field>
        <Field label="Pallor" id="anc-pallor">
          <input id="anc-pallor" className={c.input} value={form.pallor} onChange={(e) => onChange('pallor', e.target.value)} />
        </Field>
        <Field label="Thyroid" id="anc-thyroid">
          <input id="anc-thyroid" className={c.input} value={form.thyroid} onChange={(e) => onChange('thyroid', e.target.value)} />
        </Field>
        <Field label="Breast exam" id="anc-breast">
          <input id="anc-breast" className={c.input} value={form.breast_exam} onChange={(e) => onChange('breast_exam', e.target.value)} />
        </Field>
        <Field label="Oedema" id="anc-oedema">
          <input id="anc-oedema" className={c.input} value={form.oedema} onChange={(e) => onChange('oedema', e.target.value)} />
        </Field>
        <Field label="Varicose veins" id="anc-varicose">
          <input id="anc-varicose" className={c.input} value={form.varicose_veins} onChange={(e) => onChange('varicose_veins', e.target.value)} />
        </Field>
      </Section>

      <Section title="Special investigations">
        {hivOnRecord ? (
          <div className="sm:col-span-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            <strong>HIV positive on record</strong> — HIV panel test is not repeated.
            {ancContext?.hiv_recorded_session_number ? (
              <> Recorded at ANC session {ancContext.hiv_recorded_session_number}.</>
            ) : null}
          </div>
        ) : (
          <Field label="HIV panel *" id="anc-hiv">
            <select id="anc-hiv" className={c.input} required value={form.hiv_result} onChange={(e) => onChange('hiv_result', e.target.value)}>
              <option value="">Select result…</option>
              <option value="negative">Negative</option>
              <option value="positive">Positive</option>
            </select>
          </Field>
        )}
        <Field label="Serology" id="anc-serology">
          <input id="anc-serology" className={c.input} value={form.serology} onChange={(e) => onChange('serology', e.target.value)} />
        </Field>
        <Field label="Tetanus toxoid immunization" id="anc-tetanus">
          <input id="anc-tetanus" className={c.input} value={form.tetanus_toxoid_immunization} onChange={(e) => onChange('tetanus_toxoid_immunization', e.target.value)} />
        </Field>
      </Section>

      <Section title="Delivery details">
        <Field label="Chemoprophylaxis" id="anc-chemo">
          <input id="anc-chemo" className={c.input} value={form.chemoprophylaxis} onChange={(e) => onChange('chemoprophylaxis', e.target.value)} />
        </Field>
        <Field label="Place of delivery" id="anc-place" error={stateHospitalsError || undefined}>
          {stateHospitalsLoading ? (
            <p className="text-sm text-slate-500">Loading state hospitals…</p>
          ) : (
            <select
              id="anc-place"
              className={c.input}
              value={form.place_of_delivery}
              onChange={(e) => onChange('place_of_delivery', e.target.value)}
            >
              <option value="">Select state hospital…</option>
              {hasLegacyPlaceOfDelivery ? (
                <option value={form.place_of_delivery}>{form.place_of_delivery}</option>
              ) : null}
              {stateHospitals.map((facility) => (
                <option key={facility.id} value={facility.label}>
                  {facility.label}
                </option>
              ))}
            </select>
          )}
          {!stateHospitalsLoading && stateHospitals.length === 0 && !stateHospitalsError ? (
            <p className="mt-1 text-xs text-slate-500">No state hospitals are registered in the system.</p>
          ) : null}
        </Field>
      </Section>

      <Section title="Follow-up">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
          <input type="checkbox" checked={form.no_further_session_required} onChange={(e) => onChange('no_further_session_required', e.target.checked)} />
          No further session required
        </label>
        {!form.no_further_session_required ? (
          <Field label="Follow-up date *" id="anc-fu">
            <input id="anc-fu" type="date" className={c.input} required value={form.follow_up_date} onChange={(e) => onChange('follow_up_date', e.target.value)} />
          </Field>
        ) : null}
      </Section>
      <button type="button" className={c.btnComplete} disabled={loading} onClick={onSubmit}>
        Complete ANC session
      </button>
    </div>
  );
}

export function AnwForm({ form, onChange, onSubmit, loading, config }) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" checked={form.is_admission_day} onChange={(e) => onChange('is_admission_day', e.target.checked)} />
        First day of arrival (admission metrics)
      </label>
      {form.is_admission_day ? (
        <Section title="Admission">
          <Field label="Reason for admission *" id="anw-reason">
            <textarea id="anw-reason" className={c.textarea} rows={2} required value={form.admission_reason} onChange={(e) => onChange('admission_reason', e.target.value)} />
          </Field>
          <Field label="Mode of arrival *" id="anw-arrival">
            <select id="anw-arrival" className={c.input} required value={form.mode_of_arrival} onChange={(e) => onChange('mode_of_arrival', e.target.value)}>
              <option value="">Select…</option>
              <option value="walk_in">Walk-in</option>
              <option value="ambulance">Ambulance</option>
              <option value="referral">Referral</option>
              <option value="transfer">Transfer</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </Section>
      ) : null}
      <Section title="Vital signs">
        <Field label="Temperature" id="anw-temp"><input id="anw-temp" className={c.input} value={form.temperature} onChange={(e) => onChange('temperature', e.target.value)} /></Field>
        <Field label="Pulse" id="anw-pulse"><input id="anw-pulse" className={c.input} value={form.pulse} onChange={(e) => onChange('pulse', e.target.value)} /></Field>
        <Field label="Respiration" id="anw-resp"><input id="anw-resp" className={c.input} value={form.respiration} onChange={(e) => onChange('respiration', e.target.value)} /></Field>
        <Field label="Blood pressure" id="anw-bp"><input id="anw-bp" className={c.input} value={form.blood_pressure} onChange={(e) => onChange('blood_pressure', e.target.value)} /></Field>
        <Field label="Urine" id="anw-urine"><input id="anw-urine" className={c.input} value={form.urine} onChange={(e) => onChange('urine', e.target.value)} /></Field>
      </Section>
      <Section title="Abdominal update">
        <Field label="Height of fundus" id="anw-fundus"><input id="anw-fundus" className={c.input} value={form.height_of_fundus} onChange={(e) => onChange('height_of_fundus', e.target.value)} /></Field>
        <Field label="Lie" id="anw-lie"><input id="anw-lie" className={c.input} value={form.lie} onChange={(e) => onChange('lie', e.target.value)} /></Field>
        <Field label="Presentation" id="anw-pres"><input id="anw-pres" className={c.input} value={form.presentation} onChange={(e) => onChange('presentation', e.target.value)} /></Field>
        <Field label="Position" id="anw-pos"><input id="anw-pos" className={c.input} value={form.position} onChange={(e) => onChange('position', e.target.value)} /></Field>
      </Section>
      <Section title="Active labour">
        <Field label="Cervical dilation" id="anw-dil"><input id="anw-dil" className={c.input} value={form.cervical_dilation} onChange={(e) => onChange('cervical_dilation', e.target.value)} /></Field>
        <Field label="Effacement" id="anw-eff"><input id="anw-eff" className={c.input} value={form.effacement} onChange={(e) => onChange('effacement', e.target.value)} /></Field>
        <Field label="Foetal heart rate" id="anw-fhr"><input id="anw-fhr" className={c.input} value={form.foetal_heart_rate} onChange={(e) => onChange('foetal_heart_rate', e.target.value)} /></Field>
        <Field label="Contractions" id="anw-con"><input id="anw-con" className={c.input} value={form.contractions} onChange={(e) => onChange('contractions', e.target.value)} /></Field>
      </Section>
      <Section title="Serial progress">
        <Field label="Clinical assessment" id="anw-clin"><textarea id="anw-clin" className={c.textarea} rows={2} value={form.clinical_assessment} onChange={(e) => onChange('clinical_assessment', e.target.value)} /></Field>
        <Field label="Treatment alteration" id="anw-treat"><textarea id="anw-treat" className={c.textarea} rows={2} value={form.treatment_alteration} onChange={(e) => onChange('treatment_alteration', e.target.value)} /></Field>
      </Section>
      <Section title="Transfer (optional)">
        <Field label="Send patient to" id="anw-route">
          <select id="anw-route" className={c.input} value={form.routing_destination} onChange={(e) => onChange('routing_destination', e.target.value)}>
            <option value="">Stay in ANW (daily sign-off only)</option>
            <option value="maternity_icu">Maternity ICU</option>
            <option value="maternity_pnw">Postnatal Ward (PNW)</option>
          </select>
        </Field>
      </Section>
      <button type="button" className={c.btnComplete} disabled={loading} onClick={onSubmit}>
        Sign off daily record
      </button>
    </div>
  );
}

export function PnwForm({ form, onChange, onSubmit, loading }) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" checked={form.is_post_delivery_day} onChange={(e) => onChange('is_post_delivery_day', e.target.checked)} />
        Post-delivery day (first day only)
      </label>
      {form.is_post_delivery_day ? (
        <Section title="Post-delivery">
          <Field label="Delivery type *" id="pnw-del"><input id="pnw-del" className={c.input} required value={form.delivery_type} onChange={(e) => onChange('delivery_type', e.target.value)} /></Field>
          <Field label="Post-op recovery *" id="pnw-rec"><textarea id="pnw-rec" className={c.textarea} rows={2} required value={form.post_op_recovery} onChange={(e) => onChange('post_op_recovery', e.target.value)} /></Field>
        </Section>
      ) : null}
      <Section title="Vital signs">
        <Field label="Temperature" id="pnw-temp"><input id="pnw-temp" className={c.input} value={form.temperature} onChange={(e) => onChange('temperature', e.target.value)} /></Field>
        <Field label="Pulse" id="pnw-pulse"><input id="pnw-pulse" className={c.input} value={form.pulse} onChange={(e) => onChange('pulse', e.target.value)} /></Field>
        <Field label="Respiration" id="pnw-resp"><input id="pnw-resp" className={c.input} value={form.respiration} onChange={(e) => onChange('respiration', e.target.value)} /></Field>
        <Field label="Systolic BP" id="pnw-sys"><input id="pnw-sys" className={c.input} value={form.systolic_bp} onChange={(e) => onChange('systolic_bp', e.target.value)} /></Field>
        <Field label="Diastolic BP" id="pnw-dia"><input id="pnw-dia" className={c.input} value={form.diastolic_bp} onChange={(e) => onChange('diastolic_bp', e.target.value)} /></Field>
      </Section>
      <Section title="Uterine index">
        <Field label="Fundal height" id="pnw-fundal"><input id="pnw-fundal" className={c.input} value={form.fundal_height} onChange={(e) => onChange('fundal_height', e.target.value)} /></Field>
      </Section>
      <Section title="Physiological output">
        <Field label="Lochia status" id="pnw-loch"><input id="pnw-loch" className={c.input} value={form.lochia_status} onChange={(e) => onChange('lochia_status', e.target.value)} /></Field>
        <Field label="Perineum site" id="pnw-per"><input id="pnw-per" className={c.input} value={form.perineum_site} onChange={(e) => onChange('perineum_site', e.target.value)} /></Field>
        <Field label="Urine passed" id="pnw-urine"><input id="pnw-urine" className={c.input} value={form.urine_passed} onChange={(e) => onChange('urine_passed', e.target.value)} /></Field>
        <Field label="Bowels" id="pnw-bowel"><input id="pnw-bowel" className={c.input} value={form.bowels} onChange={(e) => onChange('bowels', e.target.value)} /></Field>
      </Section>
      <Section title="Breast examination & lower limb screening">
        <Field label="Breast examination" id="pnw-breast"><textarea id="pnw-breast" className={c.textarea} rows={2} value={form.breast_examination} onChange={(e) => onChange('breast_examination', e.target.value)} /></Field>
        <Field label="Lower limb screening" id="pnw-limb"><textarea id="pnw-limb" className={c.textarea} rows={2} value={form.lower_limb_screening} onChange={(e) => onChange('lower_limb_screening', e.target.value)} /></Field>
      </Section>
      <Section title="Discharge / transfer">
        <Field label="Action" id="pnw-route">
          <select id="pnw-route" className={c.input} value={form.routing_destination} onChange={(e) => onChange('routing_destination', e.target.value)}>
            <option value="">Daily sign-off only</option>
            <option value="maternity_icu">Send to Maternity ICU</option>
            <option value="discharge">Discharge patient</option>
          </select>
        </Field>
        {form.routing_destination === 'discharge' ? (
          <>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
              <input type="checkbox" checked={form.feeding_counselling_done} onChange={(e) => onChange('feeding_counselling_done', e.target.checked)} />
              Feeding counselling review completed *
            </label>
            <Field label="6-week follow-up date *" id="pnw-6wk">
              <input id="pnw-6wk" type="date" className={c.input} required value={form.six_week_follow_up_date} onChange={(e) => onChange('six_week_follow_up_date', e.target.value)} />
            </Field>
          </>
        ) : null}
      </Section>
      <button type="button" className={c.btnComplete} disabled={loading} onClick={onSubmit}>
        Sign off daily record
      </button>
    </div>
  );
}

export function IcuForm({ form, onChange, onSubmit, loading }) {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Extreme indicators — sick state">
        {['eclampsia_coma', 'hellp_syndrome', 'dic', 'septic_shock'].map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form[key]} onChange={(e) => onChange(key, e.target.checked)} />
            {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </label>
        ))}
      </Section>
      <Section title="Continuous advanced parameters">
        <Field label="Inotropic support" id="icu-ino"><textarea id="icu-ino" className={c.textarea} rows={2} value={form.inotropic_support} onChange={(e) => onChange('inotropic_support', e.target.value)} /></Field>
        <Field label="Blood gas analysis" id="icu-bg"><textarea id="icu-bg" className={c.textarea} rows={2} value={form.blood_gas_analysis} onChange={(e) => onChange('blood_gas_analysis', e.target.value)} /></Field>
        <Field label="Central venous pressure" id="icu-cvp"><input id="icu-cvp" className={c.input} value={form.central_venous_pressure} onChange={(e) => onChange('central_venous_pressure', e.target.value)} /></Field>
      </Section>
      <Section title="Multiple origin tracking">
        <Field label="Renal dialysis metric" id="icu-renal"><textarea id="icu-renal" className={c.textarea} rows={2} value={form.renal_dialysis_metric} onChange={(e) => onChange('renal_dialysis_metric', e.target.value)} /></Field>
        <Field label="Advanced neurological state" id="icu-neuro"><textarea id="icu-neuro" className={c.textarea} rows={2} value={form.advanced_neurological_state} onChange={(e) => onChange('advanced_neurological_state', e.target.value)} /></Field>
      </Section>
      <Section title="Transfer / discharge">
        <Field label="Action" id="icu-route">
          <select id="icu-route" className={c.input} value={form.routing_destination} onChange={(e) => onChange('routing_destination', e.target.value)}>
            <option value="">Daily sign-off only</option>
            <option value="maternity_anw">Return to ANW</option>
            <option value="discharge">Discharge</option>
          </select>
        </Field>
      </Section>
      <button type="button" className={c.btnComplete} disabled={loading} onClick={onSubmit}>
        Sign off ICU record
      </button>
    </div>
  );
}

export function NicuForm({ form, onChange, onSubmit, loading }) {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Immediate newborn classification">
        <Field label="Date & time of birth *" id="nicu-dob">
          <input id="nicu-dob" type="datetime-local" className={c.input} required value={form.date_time_of_birth} onChange={(e) => onChange('date_time_of_birth', e.target.value)} />
        </Field>
        <Field label="Sex *" id="nicu-sex">
          <select id="nicu-sex" className={c.input} required value={form.sex} onChange={(e) => onChange('sex', e.target.value)}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Name" id="nicu-name"><input id="nicu-name" className={c.input} value={form.name} onChange={(e) => onChange('name', e.target.value)} /></Field>
        <Field label="Gestation (weeks)" id="nicu-gest"><input id="nicu-gest" type="number" className={c.input} value={form.gestation_weeks} onChange={(e) => onChange('gestation_weeks', e.target.value)} /></Field>
      </Section>
      <Section title="Clinical status">
        <div className="sm:col-span-2">
          <textarea className={c.textarea} rows={3} value={form.clinical_status} onChange={(e) => onChange('clinical_status', e.target.value)} placeholder="Clinical status notes…" />
        </div>
      </Section>
      <Section title="APGAR matrix">
        <Field label="1 minute" id="nicu-a1"><input id="nicu-a1" className={c.input} value={form.apgar_1min} onChange={(e) => onChange('apgar_1min', e.target.value)} /></Field>
        <Field label="5 minutes" id="nicu-a5"><input id="nicu-a5" className={c.input} value={form.apgar_5min} onChange={(e) => onChange('apgar_5min', e.target.value)} /></Field>
        <Field label="10 minutes" id="nicu-a10"><input id="nicu-a10" className={c.input} value={form.apgar_10min} onChange={(e) => onChange('apgar_10min', e.target.value)} /></Field>
      </Section>
      <button type="button" className={c.btnComplete} disabled={loading} onClick={onSubmit}>
        Register newborn &amp; link to mother
      </button>
    </div>
  );
}

export { c as maternityClasses };
