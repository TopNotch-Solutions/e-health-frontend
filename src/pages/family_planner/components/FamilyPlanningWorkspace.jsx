import { useEffect, useState } from 'react';
import { IntakeInput, IntakeSelect, IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import DoctorPrescriptionSection from '../../doctor/components/DoctorPrescriptionSection';
import { confirmAction } from '../../../utils/confirmAction';
import { checkMedicationStock, getMedicationCatalog } from '../../../api/inventory';
import { emptyMedLine } from '../../doctor/doctorConsultForm';
import {
  routeFamilyPlanningToPharmacy,
  completeFamilyPlanningSession,
} from '../../../api/familyPlanningSuite';
import {
  INTERVENTION_OPTIONS,
  DEVICE_TYPES,
  validatePlanningForm,
  buildRecordPayload,
  submitButtonClass,
  submitButtonLabel,
} from '../familyPlanningSuiteForm';

function SubSection({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

export default function FamilyPlanningWorkspace({
  patient,
  form,
  onFormChange,
  onInterventionTypeChange,
  fieldErrors,
  record,
  actionLoading,
  setActionLoading,
  onToast,
  onError,
  onDone,
}) {
  const [medLine, setMedLine] = useState(emptyMedLine);
  const [prescriptionLines, setPrescriptionLines] = useState([]);
  const [medFieldErrors, setMedFieldErrors] = useState({});
  const [medCatalog, setMedCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [liveStock, setLiveStock] = useState(null);
  const [stockChecking, setStockChecking] = useState(false);

  const isFinalized = !!record?.is_finalized;
  const hasPrescription = prescriptionLines.length > 0;
  const selectedType = form.intervention_type;
  const disabled = isFinalized;
  const canSubmit = Boolean(selectedType) && !isFinalized;

  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    getMedicationCatalog()
      .then((rows) => { if (!cancelled) setMedCatalog(Array.isArray(rows) ? rows : []); })
      .catch((err) => {
        if (!cancelled) setCatalogError(err.message || 'Could not load medication catalog.');
      })
      .finally(() => { if (!cancelled) setCatalogLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const name = medLine.medication_name?.trim();
    const qty = Number(medLine.quantity) || 1;
    if (!name) {
      setLiveStock(null);
      return undefined;
    }
    let cancelled = false;
    setStockChecking(true);
    const timer = setTimeout(() => {
      checkMedicationStock(name, qty)
        .then((data) => { if (!cancelled) setLiveStock(data); })
        .catch(() => { if (!cancelled) setLiveStock(null); })
        .finally(() => { if (!cancelled) setStockChecking(false); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [medLine.medication_name, medLine.quantity]);

  function handleField(key, value) {
    onFormChange(key, value);
  }

  function addOralEntry() {
    onFormChange('oral_contraceptive_log', [...(form.oral_contraceptive_log || []), {
      id: `oral-${Date.now()}`,
      distributed_date: '',
      tablet_count: '',
      is_refill: false,
      notes: '',
    }]);
  }

  function updateOralEntry(index, key, value) {
    const next = [...(form.oral_contraceptive_log || [])];
    next[index] = { ...next[index], [key]: value };
    onFormChange('oral_contraceptive_log', next);
  }

  function removeOralEntry(index) {
    onFormChange(
      'oral_contraceptive_log',
      (form.oral_contraceptive_log || []).filter((_, i) => i !== index)
    );
  }

  function addMedToList() {
    const name = medLine.medication_name.trim();
    const dose = medLine.dosage.trim();
    const errs = {};
    if (!name) errs.medication_name = 'Enter medication name';
    if (!dose) errs.dosage = 'Enter dosage';
    if (Object.keys(errs).length) {
      setMedFieldErrors(errs);
      return;
    }
    const qty = Number(medLine.quantity) || 1;
    const stockSnapshot = liveStock || {
      stock_status: 'out_of_stock',
      stock_label: 'Out of stock',
      quantity_in_stock: 0,
    };
    setPrescriptionLines((lines) => [
      ...lines,
      {
        ...medLine,
        medication_name: name,
        dosage: dose,
        quantity: qty,
        stock_status: stockSnapshot.stock_status,
        stock_label: stockSnapshot.stock_label,
        quantity_in_stock: stockSnapshot.quantity_in_stock,
      },
    ]);
    setMedLine(emptyMedLine());
    setLiveStock(null);
  }

  function buildPrescriptionItems() {
    return prescriptionLines.map((item) => ({
      medication_name: item.medication_name,
      dosage: item.dosage,
      frequency: item.frequency || null,
      quantity: item.quantity || 1,
      instructions: item.instructions || null,
    }));
  }

  async function handleSubmit() {
    const errors = validatePlanningForm(form);
    if (Object.keys(errors).length) {
      if (errors.intervention_type) onError(errors.intervention_type);
      else onError(errors._form || 'Complete required documentation');
      return;
    }

    const confirmed = hasPrescription
      ? await confirmAction({
        title: 'Send to Pharmacy?',
        text: `Save record and send ${patient.name} to the Pharmacy queue?`,
        icon: 'question',
        confirmButtonText: 'Save & send',
      })
      : await confirmAction({
        title: 'Complete session?',
        text: `Save and complete session for ${patient.name}?`,
        icon: 'question',
        confirmButtonText: 'Save & complete',
      });
    if (!confirmed) return;

    setActionLoading(true);
    onError('');
    try {
      const payload = buildRecordPayload(form, patient.visitId, patient.entryId);
      if (hasPrescription) {
        await routeFamilyPlanningToPharmacy({
          ...payload,
          items: buildPrescriptionItems(),
        });
        onToast(`${patient.name} — sent to Pharmacy`);
      } else {
        await completeFamilyPlanningSession(payload);
        onToast(`${patient.name} — session saved`);
      }
      onDone();
    } catch (err) {
      onError(err.message || 'Failed to save session');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Procedural interventions &amp; tracking</h3>
        <p className="mt-1 text-sm text-slate-500">
          Select one intervention type, complete documentation, optionally add medications, then
          save once.
        </p>

        {fieldErrors.intervention_type ? (
          <p className="mt-3 text-sm text-red-600" role="alert">{fieldErrors.intervention_type}</p>
        ) : null}
        {fieldErrors._form ? (
          <p className="mt-3 text-sm text-red-600" role="alert">{fieldErrors._form}</p>
        ) : null}

        <fieldset className={`mt-4 space-y-3 ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
          <legend className="text-sm font-semibold text-slate-800">Intervention type (select one)</legend>
          {INTERVENTION_OPTIONS.map((opt) => {
            const active = selectedType === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition ${
                  active
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="fp-intervention-type"
                  className="mt-0.5 h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                  checked={active}
                  onChange={() => onInterventionTypeChange(opt.value)}
                  disabled={disabled}
                />
                <span>
                  <span className="text-sm font-bold text-slate-900">{opt.label}</span>
                  <span className="mt-1 block text-xs text-slate-500">{opt.description}</span>
                </span>
              </label>
            );
          })}
        </fieldset>

        {selectedType === 'subdermal' ? (
          <section className={`${c.readOnlyGroup} mt-4`}>
            <h4 className={c.readOnlyGroupTitle}>Subdermal interventions</h4>
            <div className="mt-3 space-y-4">
              <SubSection title="Implant insertion">
                <IntakeInput
                  id="fp-sd-ins-date"
                  label="Procedure date"
                  type="date"
                  className={c.input}
                  value={form.subdermal_insertion_date}
                  onChange={(e) => handleField('subdermal_insertion_date', e.target.value)}
                  disabled={disabled}
                />
                <IntakeTextarea
                  id="fp-sd-ins-notes"
                  label="Insertion notes"
                  className={c.textarea}
                  rows={2}
                  value={form.subdermal_insertion_notes}
                  onChange={(e) => handleField('subdermal_insertion_notes', e.target.value)}
                  disabled={disabled}
                />
              </SubSection>
              <SubSection title="Implant replacement">
                <IntakeInput
                  id="fp-sd-rep-date"
                  label="Procedure date"
                  type="date"
                  className={c.input}
                  value={form.subdermal_replacement_date}
                  onChange={(e) => handleField('subdermal_replacement_date', e.target.value)}
                  disabled={disabled}
                />
                <IntakeTextarea
                  id="fp-sd-rep-notes"
                  label="Replacement notes"
                  className={c.textarea}
                  rows={2}
                  value={form.subdermal_replacement_notes}
                  onChange={(e) => handleField('subdermal_replacement_notes', e.target.value)}
                  disabled={disabled}
                />
              </SubSection>
            </div>
          </section>
        ) : null}

        {selectedType === 'device' ? (
          <section className={`${c.readOnlyGroup} mt-4`}>
            <h4 className={c.readOnlyGroupTitle}>Intrauterine / barrier devices</h4>
            <div className="mt-3 space-y-4">
              <SubSection title="Device insertion">
                <IntakeSelect
                  id="fp-dev-type"
                  label="Device type"
                  className={c.select}
                  value={form.device_type}
                  onChange={(e) => handleField('device_type', e.target.value)}
                  disabled={disabled}
                >
                  {DEVICE_TYPES.map((d) => (
                    <option key={d.value || 'empty'} value={d.value}>{d.label}</option>
                  ))}
                </IntakeSelect>
                <IntakeInput
                  id="fp-dev-ins-date"
                  label="Insertion date"
                  type="date"
                  className={c.input}
                  value={form.device_insertion_date}
                  onChange={(e) => handleField('device_insertion_date', e.target.value)}
                  disabled={disabled}
                />
                <IntakeTextarea
                  id="fp-dev-ins-notes"
                  label="Insertion procedure log"
                  className={c.textarea}
                  rows={2}
                  value={form.device_insertion_notes}
                  onChange={(e) => handleField('device_insertion_notes', e.target.value)}
                  disabled={disabled}
                />
              </SubSection>
              <SubSection title="Device removal">
                <IntakeInput
                  id="fp-dev-rem-date"
                  label="Removal date"
                  type="date"
                  className={c.input}
                  value={form.device_removal_date}
                  onChange={(e) => handleField('device_removal_date', e.target.value)}
                  disabled={disabled}
                />
                <IntakeTextarea
                  id="fp-dev-rem-notes"
                  label="Removal procedure log"
                  className={c.textarea}
                  rows={2}
                  value={form.device_removal_notes}
                  onChange={(e) => handleField('device_removal_notes', e.target.value)}
                  disabled={disabled}
                />
              </SubSection>
            </div>
          </section>
        ) : null}

        {selectedType === 'oral' ? (
          <section className={`${c.readOnlyGroup} mt-4`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className={c.readOnlyGroupTitle}>Oral contraceptives — distribution &amp; refills</h4>
              {!disabled ? (
                <button type="button" className={c.btnSecondary} onClick={addOralEntry}>
                  Add log entry
                </button>
              ) : null}
            </div>
            <div className="mt-3 space-y-3">
              {(form.oral_contraceptive_log || []).length === 0 ? (
                <p className={c.hint}>No oral contraceptive entries yet.</p>
              ) : (
                (form.oral_contraceptive_log || []).map((entry, index) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-slate-200 bg-white p-3 space-y-2"
                  >
                    <div className="flex justify-between gap-2">
                      <span className="text-xs font-bold text-slate-600">Entry {index + 1}</span>
                      {!disabled ? (
                        <button
                          type="button"
                          className="text-xs font-semibold text-rose-600"
                          onClick={() => removeOralEntry(index)}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <IntakeInput
                      label="Distribution date"
                      type="date"
                      className={c.input}
                      value={entry.distributed_date}
                      onChange={(e) => updateOralEntry(index, 'distributed_date', e.target.value)}
                      disabled={disabled}
                    />
                    <IntakeInput
                      label="Tablet count"
                      type="number"
                      min={0}
                      className={c.input}
                      value={entry.tablet_count}
                      onChange={(e) => updateOralEntry(index, 'tablet_count', e.target.value)}
                      disabled={disabled}
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={entry.is_refill}
                        onChange={(e) => updateOralEntry(index, 'is_refill', e.target.checked)}
                        disabled={disabled}
                      />
                      Refill cycle
                    </label>
                    <IntakeTextarea
                      label="Notes"
                      className={c.textarea}
                      rows={2}
                      value={entry.notes}
                      onChange={(e) => updateOralEntry(index, 'notes', e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                ))
              )}
            </div>
          </section>
        ) : null}
      </section>

      {selectedType && !isFinalized ? (
        <section className={c.sectionPanel}>
          <h3 className={c.sectionTitle}>Medication (optional)</h3>
          <p className="mt-1 text-sm text-slate-500">
            Add medications if supplies are needed. With medications listed, save will route to
            Pharmacy; otherwise the visit completes here.
          </p>

          <div className="mt-4">
            <DoctorPrescriptionSection
              catalog={medCatalog}
              catalogLoading={catalogLoading}
              catalogError={catalogError}
              medLine={medLine}
              medFieldErrors={medFieldErrors}
              onMedFieldChange={(k, v) => {
                setMedLine((prev) => ({ ...prev, [k]: v }));
                setMedFieldErrors((prev) => {
                  if (!prev[k]) return prev;
                  const next = { ...prev };
                  delete next[k];
                  return next;
                });
              }}
              onMedicationSelect={(name) => {
                const entry = medCatalog.find(
                  (cat) => cat.name === name || cat.medication_name === name
                );
                setMedLine((prev) => ({
                  ...prev,
                  medication_name: name,
                  generic_name: entry?.generic || entry?.generic_name || '',
                }));
              }}
              liveStock={liveStock}
              stockChecking={stockChecking}
              prescriptionLines={prescriptionLines}
              onAddMedToList={addMedToList}
              onRemoveMedLine={(index) => setPrescriptionLines((lines) => lines.filter((_, i) => i !== index))}
              actionLoading={actionLoading}
              hideSubmitButton
            />
          </div>

          <div className="mt-6">
            <button
              type="button"
              className={submitButtonClass(hasPrescription)}
              disabled={!canSubmit || actionLoading}
              onClick={handleSubmit}
            >
              {submitButtonLabel(actionLoading, hasPrescription)}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
